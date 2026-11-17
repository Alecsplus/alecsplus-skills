#!/usr/bin/env node
// Renders an .excalidraw file to a hand-drawn SVG (rough.js) and, when a Chrome is found, to a PNG.
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync, deflateSync } from 'node:zlib';
import rough from './vendor/rough.esm.mjs';

const MARGIN = 20;
const ARROWHEAD_LENGTH = 15;
const FONT_FAMILIES = { 1: 'Virgil, Excalifont, cursive', 2: 'Helvetica, Arial, sans-serif', 3: '"Cascadia Code", monospace', 5: 'Excalifont, Virgil, cursive' };
// Excalifont comes split by unicode range, as Excalidraw ships it (vendor/excalifont/<hash>.woff2).
const EXCALIFONT_RANGES = {
  a88b72a24fb54c9f94e3b5fdaa7481c9: 'U+20-7e,U+a0-a3,U+a5-a6,U+a8-ab,U+ad-b1,U+b4,U+b6-b8,U+ba-ff,U+131,U+152-153,U+2bc,U+2c6,U+2da,U+2dc,U+304,U+308,U+2013-2014,U+2018-201a,U+201c-201e,U+2020,U+2022,U+2024-2026,U+2030,U+2039-203a,U+20ac,U+2122,U+2212',
  be310b9bcd4f1a43f571c46df7809174: 'U+100-130,U+132-137,U+139-149,U+14c-151,U+154-17e,U+192,U+1fc-1ff,U+218-21b,U+237,U+1e80-1e85,U+1ef2-1ef3,U+2113',
  b9dcf9d2e50a1eaf42fc664b50a3fd0d: 'U+400-45f,U+490-491,U+2116',
  '41b173a47b57366892116a575a43e2b6': 'U+37e,U+384-38a,U+38c,U+38e-393,U+395-3a1,U+3a3-3a8,U+3aa-3cf,U+3d7',
  '3f2c5db56cc93c5a6873b1361d730c16': 'U+2c7,U+2d8-2d9,U+2db,U+2dd,U+302,U+306-307,U+30a-30c,U+326-328,U+212e,U+2211,U+fb01-fb02',
  '349fac6ca4700ffec595a7150a0d1e1d': 'U+462-463,U+472-475,U+4d8-4d9,U+4e2-4e3,U+4e6-4e9,U+4ee-4ef',
  '623ccf21b21ef6b3a0d87738f77eb071': 'U+300-301,U+303',
};
const SCALE = 2;
const WINDOW_EXTRA_HEIGHT = 200; // headless Chrome paints a viewport shorter than --window-size; the PNG is cropped back after
const BROWSER_NAMES = ['google-chrome', 'chromium', 'chromium-browser', 'google-chrome-stable'];
const generator = rough.generator();

function fail(message) {
  process.stderr.write(`render.mjs: ${message}\n`);
  process.exit(1);
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function absolutePoints(element) {
  return element.points.map(([deltaX, deltaY]) => [element.x + deltaX, element.y + deltaY]);
}

function dashArray(element) {
  const half = element.strokeWidth / 2;
  if (element.strokeStyle === 'dashed') return [8 * half, 8 * half];
  if (element.strokeStyle === 'dotted') return [1.5 * half, 6 * half];
  return null;
}

function roundedRectanglePath({ x, y, width, height }) {
  const radius = Math.min(Math.min(width, height) * 0.25, 32);
  return `M${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} `
    + `L${x + width},${y + height - radius} Q${x + width},${y + height} ${x + width - radius},${y + height} `
    + `L${x + radius},${y + height} Q${x},${y + height} ${x},${y + height - radius} `
    + `L${x},${y + radius} Q${x},${y} ${x + radius},${y} Z`;
}

function roughOptions(element, overrides = {}) {
  const filled = element.backgroundColor && element.backgroundColor !== 'transparent';
  return {
    seed: element.seed || 1,
    roughness: element.roughness ?? 1,
    bowing: 0.8,
    strokeWidth: element.strokeWidth ?? 1,
    stroke: element.strokeColor || '#000000',
    fill: filled ? element.backgroundColor : undefined,
    fillStyle: element.fillStyle || 'hachure',
    ...overrides,
  };
}

function pathsMarkup(drawable, dash) {
  return drawable.sets.map((set) => {
    const [drawn] = generator.toPaths({ sets: [set], options: drawable.options });
    const dashAttribute = dash && set.type === 'path' ? ` stroke-dasharray="${dash.join(' ')}"` : '';
    return `<path d="${drawn.d}" stroke="${drawn.stroke}" stroke-width="${drawn.strokeWidth}" fill="${drawn.fill}" stroke-linecap="round" stroke-linejoin="round"${dashAttribute}/>`;
  }).join('');
}

function arrowheadMarkup(element, kind, tip, from) {
  const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]) + Math.PI;
  const wings = [-0.45, 0.45].map((side) => [tip[0] + ARROWHEAD_LENGTH * Math.cos(angle + side), tip[1] + ARROWHEAD_LENGTH * Math.sin(angle + side)]);
  const options = roughOptions(element, { roughness: 0.4, fill: undefined });
  if (kind === 'triangle') {
    return pathsMarkup(generator.polygon([tip, ...wings], { ...options, fill: element.strokeColor, fillStyle: 'solid' }), null);
  }
  return wings.map((wing) => pathsMarkup(generator.line(tip[0], tip[1], wing[0], wing[1], options), null)).join('');
}

function linearMarkup(element, options) {
  const points = absolutePoints(element);
  const smooth = element.roundness && points.length >= 3;
  const drawable = smooth ? generator.curve(points, options) : generator.linearPath(points, options);
  let markup = pathsMarkup(drawable, dashArray(element));
  if (points.length >= 2 && element.type !== 'freedraw') {
    if (element.endArrowhead) markup += arrowheadMarkup(element, element.endArrowhead, points.at(-1), points.at(-2));
    if (element.startArrowhead) markup += arrowheadMarkup(element, element.startArrowhead, points[0], points[1]);
  }
  return markup;
}

function textMarkup(element) {
  const fontSize = element.fontSize || 20;
  const step = fontSize * (element.lineHeight || 1.25);
  const anchor = { center: 'middle', right: 'end' }[element.textAlign] || 'start';
  const anchorX = element.x + ({ center: element.width / 2, right: element.width }[element.textAlign] || 0);
  const family = FONT_FAMILIES[element.fontFamily] || FONT_FAMILIES[5];
  return element.text.split('\n').map((line, index) => {
    const baseline = element.y + step * 0.8 + index * step;
    return `<text x="${anchorX}" y="${baseline}" font-size="${fontSize}" font-family='${family}' text-anchor="${anchor}" fill="${element.strokeColor}" xml:space="preserve">${escapeXml(line)}</text>`;
  }).join('');
}

function shapeMarkup(element) {
  const options = roughOptions(element);
  const { x, y, width, height } = element;
  const dash = dashArray(element);
  switch (element.type) {
    case 'rectangle':
      return pathsMarkup(element.roundness ? generator.path(roundedRectanglePath(element), options) : generator.rectangle(x, y, width, height, options), dash);
    case 'ellipse':
      return pathsMarkup(generator.ellipse(x + width / 2, y + height / 2, width, height, options), dash);
    case 'diamond':
      return pathsMarkup(generator.polygon([[x + width / 2, y], [x + width, y + height / 2], [x + width / 2, y + height], [x, y + height / 2]], options), dash);
    case 'line':
    case 'arrow':
      return linearMarkup(element, { ...options, fill: undefined });
    case 'freedraw':
      return linearMarkup(element, { ...options, fill: undefined, roughness: 0.2 });
    case 'text':
      return textMarkup(element);
    default:
      return null;
  }
}

function elementBounds(element) {
  const { x, y, width, height } = element;
  const corners = element.points ? absolutePoints(element) : [[x, y], [x + width, y], [x, y + height], [x + width, y + height]];
  const angle = element.angle || 0;
  const [centerX, centerY] = [x + width / 2, y + height / 2];
  const turned = corners.map(([pointX, pointY]) => [
    centerX + (pointX - centerX) * Math.cos(angle) - (pointY - centerY) * Math.sin(angle),
    centerY + (pointX - centerX) * Math.sin(angle) + (pointY - centerY) * Math.cos(angle),
  ]);
  const [xs, ys] = [0, 1].map((axis) => turned.map((point) => point[axis]));
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function renderSvg(drawing) {
  const background = drawing.appState?.viewBackgroundColor || '#ffffff';
  const groups = [];
  const bounds = [];
  for (const element of drawing.elements) {
    if (element.isDeleted) continue;
    const markup = shapeMarkup(element);
    if (markup === null) {
      process.stderr.write(`render.mjs: skipped element ${element.id} of type "${element.type}" (not supported)\n`);
      continue;
    }
    bounds.push(elementBounds(element));
    const rotation = element.angle ? ` transform="rotate(${element.angle * 180 / Math.PI} ${element.x + element.width / 2} ${element.y + element.height / 2})"` : '';
    const opacity = element.opacity !== undefined && element.opacity < 100 ? ` opacity="${element.opacity / 100}"` : '';
    groups.push(`<g${rotation}${opacity}>${markup}</g>`);
  }
  const [boundsLeft, boundsTop, boundsRight, boundsBottom] = bounds.length
    ? [0, 1, 2, 3].map((side) => (side < 2 ? Math.min : Math.max)(...bounds.map((box) => box[side])))
    : [0, 0, 0, 0];
  const left = boundsLeft - MARGIN;
  const top = boundsTop - MARGIN;
  const width = Math.ceil(boundsRight + MARGIN - left);
  const height = Math.ceil(boundsBottom + MARGIN - top);
  const vendorDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'vendor');
  const fontFace = (family, file, range) => `@font-face { font-family: ${family};${range ? ` unicode-range: ${range};` : ''} src: url(data:font/woff2;base64,${readFileSync(path.join(vendorDirectory, file)).toString('base64')}) format("woff2"); }`;
  const fontFaces = fontFace('Virgil', 'Virgil-Regular.woff2')
    + Object.entries(EXCALIFONT_RANGES).map(([hash, range]) => fontFace('Excalifont', `excalifont/${hash}.woff2`, range)).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}" width="${width}" height="${height}">`
    + `<style>${fontFaces}</style>`
    + `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="${background}"/>${groups.join('')}</svg>`;
  return { svg, width, height, background };
}

function findBrowser() {
  const fromEnvironment = process.env.HOLO_BROWSER;
  if (fromEnvironment && existsSync(fromEnvironment)) return fromEnvironment;
  if (fromEnvironment) process.stderr.write(`render.mjs: HOLO_BROWSER="${fromEnvironment}" does not exist, looking in PATH\n`);
  for (const name of BROWSER_NAMES) {
    for (const directory of (process.env.PATH || '').split(path.delimiter)) {
      if (directory && existsSync(path.join(directory, name))) return path.join(directory, name);
    }
  }
  return null;
}

function checksum(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
  }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typed = Buffer.concat([Buffer.from(type), data]);
  const [length, crc] = [data.length, checksum(typed)].map((number) => { const field = Buffer.alloc(4); field.writeUInt32BE(number); return field; });
  return Buffer.concat([length, typed, crc]);
}

// Keeps only the first `rows` pixel rows of a non-interlaced PNG: rows are filtered only against the rows above them.
function cropPngRows(png, rows) {
  const chunks = [];
  for (let offset = 8; offset < png.length; offset += 12 + png.readUInt32BE(offset)) {
    chunks.push({ type: png.toString('latin1', offset + 4, offset + 8), data: png.subarray(offset + 8, offset + 8 + png.readUInt32BE(offset)) });
  }
  const header = Buffer.from(chunks[0].data);
  const [pixelWidth, pixelHeight, bitDepth, colorType, interlace] = [header.readUInt32BE(0), header.readUInt32BE(4), header[8], header[9], header[12]];
  if (interlace || rows >= pixelHeight) return png;
  const bytesPerRow = 1 + Math.ceil(pixelWidth * bitDepth * { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType] / 8);
  const raw = inflateSync(Buffer.concat(chunks.filter((chunk) => chunk.type === 'IDAT').map((chunk) => chunk.data)));
  header.writeUInt32BE(rows, 4);
  return Buffer.concat([png.subarray(0, 8), pngChunk('IHDR', header), pngChunk('IDAT', deflateSync(raw.subarray(0, rows * bytesPerRow))), pngChunk('IEND', Buffer.alloc(0))]);
}

function writePng({ svg, width, height, background }, pngPath) {
  const browser = findBrowser();
  if (!browser) {
    console.log('PNG not written: no Chrome or Chromium found (set HOLO_BROWSER to the path of one)');
    return;
  }
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'holo-'));
  const htmlPath = path.join(temporaryDirectory, 'page.html');
  writeFileSync(htmlPath, `<!doctype html><html><head><style>html,body{margin:0;background:${background}}svg{display:block}</style></head><body>${svg}</body></html>`);
  try {
    execFileSync(browser, ['--headless=new', '--no-sandbox', '--hide-scrollbars', `--force-device-scale-factor=${SCALE}`,
      `--window-size=${width},${height + WINDOW_EXTRA_HEIGHT}`, `--screenshot=${pngPath}`, `file://${htmlPath}`], { stdio: 'ignore', timeout: 60000 });
    writeFileSync(pngPath, cropPngRows(readFileSync(pngPath), height * SCALE));
    console.log(pngPath);
  } catch (error) {
    console.log(`PNG not written: ${browser} failed (${error.message.split('\n')[0]})`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

const [inputPath, ...flags] = process.argv.slice(2);
if (!inputPath) fail('usage: node render.mjs <file.excalidraw> [--no-png]');
if (!existsSync(inputPath)) fail(`file not found: ${inputPath}`);
let drawing;
try {
  drawing = JSON.parse(readFileSync(inputPath, 'utf8'));
} catch (error) {
  fail(`${inputPath} is not valid JSON: ${error.message}`);
}
if (!Array.isArray(drawing.elements)) fail(`${inputPath} has no "elements" list: not an Excalidraw file`);

const result = renderSvg(drawing);
const basePath = inputPath.replace(/\.[^./\\]*$/, '') || inputPath;
writeFileSync(`${basePath}.svg`, result.svg);
console.log(`${basePath}.svg`);
if (!flags.includes('--no-png')) writePng(result, `${basePath}.png`);
