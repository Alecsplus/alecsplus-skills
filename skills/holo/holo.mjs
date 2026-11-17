// Builds an .excalidraw file from a script: holo() returns a page that collects elements, save() writes them.
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CHARACTER_WIDTH = 0.55;
const LINE_HEIGHT = 1.25;
const PADDING = 16;
const DASHED_GRAY = '#9a9a9a';
const renderPath = fileURLToPath(new URL('./render.mjs', import.meta.url));

function lightTint(color) {
  const channels = [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16));
  return `#${channels.map((channel) => Math.round(channel + (255 - channel) * 0.6).toString(16).padStart(2, '0')).join('')}`;
}

export function holo({ background = '#121212' } = {}) {
  const elements = [];
  let counter = 0;

  function add(type, x, y, width, height, fields) {
    counter += 1;
    const element = {
      id: `holo-${counter}`, type, x, y, width, height, angle: 0,
      strokeColor: 'transparent', backgroundColor: 'transparent', fillStyle: 'solid',
      strokeWidth: 1, strokeStyle: 'solid', roughness: 0, opacity: 100, groupIds: [],
      seed: counter, version: 1, versionNonce: counter, isDeleted: false, ...fields,
    };
    elements.push(element);
    return element;
  }

  function measure(text, size) {
    const lines = text.split('\n');
    const longest = Math.max(...lines.map((line) => line.length));
    return { width: CHARACTER_WIDTH * size * longest, height: LINE_HEIGHT * size * lines.length };
  }

  function text(x, y, content, { size = 18, color = '#ffffff', opacity = 100, align = 'left' } = {}) {
    const { width, height } = measure(content, size);
    const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
    return add('text', left, y, width, height, {
      text: content, fontSize: size, fontFamily: 5, textAlign: align, verticalAlign: 'top',
      lineHeight: LINE_HEIGHT, strokeColor: color, opacity,
    });
  }

  function card(x, y, width, content, { color, corner, opacity = 100, size = 18 } = {}) {
    const textHeight = measure(content, size).height;
    const cornerHeight = corner ? measure(corner, 13).height : 0;
    const height = textHeight + 2 * PADDING + (corner ? cornerHeight : 0);
    add('rectangle', x, y, width, height, {
      strokeColor: color, backgroundColor: color, roundness: { type: 3 }, opacity,
    });
    text(x + PADDING, y + PADDING, content, { size, opacity });
    if (corner) text(x + width - 12, y + height - cornerHeight - 8, corner, { size: 13, color: lightTint(color), align: 'right', opacity });
    return height;
  }

  function fence(x, y, width, height, label, { color, opacity = 18 } = {}) {
    add('rectangle', x, y, width, height, { backgroundColor: color, roundness: { type: 3 }, opacity });
    add('rectangle', x, y, width, height, { strokeColor: color, strokeWidth: 2, roughness: 1, roundness: { type: 3 } });
    text(x + 14, y + 10, label, { size: 16 });
  }

  function slot(x, y, width, height, content) {
    add('rectangle', x, y, width, height, {
      strokeColor: DASHED_GRAY, strokeStyle: 'dashed', fillStyle: 'hachure', roughness: 1, roundness: { type: 3 },
    });
    const { height: textHeight } = measure(content, 14);
    text(x + width / 2, y + (height - textHeight) / 2, content, { size: 14, color: DASHED_GRAY, align: 'center' });
  }

  function line(from, to, { color = '#6f6f6f', width = 3, opacity = 100 } = {}) {
    return add('line', from[0], from[1], Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), {
      points: [[0, 0], [to[0] - from[0], to[1] - from[1]]], strokeColor: color, strokeWidth: width, opacity,
      roundness: null, startArrowhead: null, endArrowhead: null,
    });
  }

  function person(x, y, caption, { color = '#e6e6e6' } = {}) {
    add('ellipse', x, y, 16, 16, { strokeColor: color, strokeWidth: 2, roughness: 1 });
    line([x + 8, y + 16], [x + 8, y + 34], { color, width: 2 });
    line([x - 4, y + 22], [x + 20, y + 22], { color, width: 2 });
    line([x + 8, y + 34], [x, y + 46], { color, width: 2 });
    line([x + 8, y + 34], [x + 16, y + 46], { color, width: 2 });
    if (caption) text(x + 30, y + 8 - measure(caption, 15).height / 2, caption, { size: 15, color });
  }

  function arrow(from, to, { dotted = false, color = '#f2f2f2', width = 2, label } = {}) {
    add('arrow', from[0], from[1], Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]), {
      points: [[0, 0], [to[0] - from[0], to[1] - from[1]]], strokeColor: color, strokeWidth: width,
      strokeStyle: dotted ? 'dotted' : 'solid', roughness: 1, roundness: null, startArrowhead: null, endArrowhead: 'arrow',
    });
    if (label) {
      const { height } = measure(label, 14);
      text((from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - 8 - height, label, { size: 14, color, align: 'center' });
    }
  }

  function legend(x, y, items) {
    let cursor = y;
    for (const { sample, color, text: label } of items) {
      const rowHeight = sample === 'person' ? 46 : 26;
      if (sample === 'card') add('rectangle', x, cursor, 60, 26, { strokeColor: color, backgroundColor: color, roundness: { type: 3 } });
      if (sample === 'fence') {
        add('rectangle', x, cursor, 60, 26, { backgroundColor: color, roundness: { type: 3 }, opacity: 18 });
        add('rectangle', x, cursor, 60, 26, { strokeColor: color, strokeWidth: 2, roughness: 1, roundness: { type: 3 } });
      }
      if (sample === 'dashed') add('rectangle', x, cursor, 60, 26, { strokeColor: color ?? DASHED_GRAY, strokeStyle: 'dashed', roughness: 1, roundness: { type: 3 } });
      if (sample === 'person') person(x + 22, cursor, '', { color });
      text(x + 76, cursor + (rowHeight - measure(label, 16).height) / 2, label, { size: 16 });
      cursor += rowHeight + 12;
    }
    return cursor - y - 12;
  }

  function save(path, { render = false } = {}) {
    const drawing = { type: 'excalidraw', version: 2, source: 'holo', appState: { viewBackgroundColor: background }, elements };
    writeFileSync(path, JSON.stringify(drawing, null, 2));
    if (render) process.stdout.write(execFileSync(process.execPath, [renderPath, path], { encoding: 'utf8' }));
    return path;
  }

  return { measure, text, card, fence, slot, person, arrow, line, legend, save };
}
