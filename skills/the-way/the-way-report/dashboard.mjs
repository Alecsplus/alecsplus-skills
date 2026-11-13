// Writes the self-contained dashboard.html from the whole ledger: inline CSS and JS, the data inside the page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

function pluginVersion() {
  let version = '0';
  try {
    version = JSON.parse(readFileSync(new URL('../../../.claude-plugin/plugin.json', import.meta.url), 'utf8')).version || '0';
  } catch {
    version = '0';
  }
  return version;
}

// Every visible text of the page, written once in English; the skill translates the values, keys and {placeholders} stay.
export const TEXTS = {
  _version: pluginVersion(),
  title: 'How much the principles weigh',
  documentTitle: 'Principles report: how much they weigh',
  updated: 'updated {date}',
  modeGroup: 'Shares or numbers',
  modeShares: 'Shares %',
  modeNumbers: 'Numbers',
  themeGroup: 'Theme',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  filtersLabel: 'Filters',
  whatTitle: 'What the numbers are about',
  whenTitle: 'When',
  projects: 'Projects',
  searchProjects: 'add a project…',
  searchLabel: 'Search a project',
  removeProject: 'Remove {name}',
  allProjectsButton: 'All {n}',
  allProjectsChip: 'All projects ({n})',
  noProjectMatches: 'No project with this name.',
  answersCount: '{n} answers',
  principles: 'Principles',
  levelAll: 'All',
  levelProject: 'Of the project',
  levelGlobal: 'Global',
  list: 'List',
  kindAll: 'All',
  kindResult: 'Result',
  kindWork: 'Work',
  period: 'Period',
  days7: '7 d',
  days30: '30 d',
  days90: '90 d',
  daysAll: 'All',
  from: 'from',
  to: 'to',
  stepsOf: 'In steps of',
  unitGroup: 'Unit',
  unitDay: 'Day',
  unitWeek: 'Week',
  unitMonth: 'Month',
  monthNames: 'jan feb mar apr may jun jul aug sep oct nov dec',
  infoLabel: 'Explanation',
  infoCounts: 'What it counts',
  infoReading: 'How to read it',
  infoColumns: 'What the columns say',
  infoWhat: 'Choose which projects, which principles and which list the numbers are about. Principles and List narrow the three shares, the chart and the table; the plugin tiles at the bottom ignore them.',
  infoWhen: 'Cuts the period and sets how wide the points of the charts are: one per day, per week or per month.',
  howMuchTitle: 'How much they weigh',
  subtitleProjects: 'in {n} projects',
  subtitleProject: 'in {name}',
  subtitleDays: 'last {n} days',
  subtitleAllDays: 'all days',
  subtitleRange: '{from} to {to}',
  subtitleNumbers: 'numbers',
  tileClosedTitle: 'Decided on its own',
  tileTakenTitle: 'Advised you and you took the advice',
  tileOpenTitle: 'Was not enough and said so',
  infoTileClosed: 'Out of the times there was a choice to make, how many a principle closed without asking you. The others are the questions that reached you. It counts only the principles chosen in the filters.',
  infoTileTaken: 'Out of the grilling questions you answered, how many times you chose exactly the answer that was recommended. With Principles and List it counts only the questions that name those principles.',
  infoTileOpen: 'Out of the questions that reached you, how many said the principles did not decide. With Principles and List it counts only the ones that name those principles.',
  shareOfClosed: '{part} choices out of {whole}',
  shareOfTaken: '{part} pieces of advice out of {whole}',
  shareOfOpen: '{part} questions out of {whole}',
  numbersClosed: 'choices closed · {asked} questions to you · {share}',
  numbersTaken: 'advice taken · {other} other choice · {share}',
  numbersOpen: 'questions left open · out of {whole} · {share}',
  partOfWhole: '{part} of {whole}',
  noDataPoint: '{label}: nothing to count',
  tileScaleShares: 'per {unit}, 0–100%',
  tileScaleNumbers: 'per {unit}, {maximum} at the top',
  tileTrendAria: 'Trend per {unit}: {values}',
  countedSince: 'counted since {date}',
  habitTitle: 'Is the habit there?',
  habitText: 'answers with the «Principles:» line on top: {share}, {part} of {whole}; last step ({unit}): {last}.',
  infoHabit: 'How many answers start with the «Principles:» line. It does not change with the Principles and List filters.',
  chartSharesTitle: 'The three shares, per {unit}',
  chartNumbersTitle: 'The three things, per {unit}, in numbers',
  chartAriaShares: 'The three shares per {unit}',
  chartAriaNumbers: 'Bars per {unit}: choices closed, advice taken, questions left open, and in grey the questions that reached you',
  infoChart: 'The three shares of «How much they weigh», one point per step. Hover a point for the numbers behind it. With «Numbers» at the top the same chart shows the counts.',
  legendClosed: 'decided on its own',
  legendTaken: 'advice taken',
  legendOpen: 'not enough',
  legendAsked: 'questions that reached you',
  chartHintShares: 'Hover a point to see the share and the numbers it comes from. With «Numbers» at the top the same chart shows the counts.',
  chartHintNumbers: 'The grey outline, on the left of each step, is all the questions that reached you in that step: the coloured bars beside it are read against it. With «Shares %» at the top the chart goes back to lines from 0 to 100.',
  tipWeek: 'Week of {label}',
  whereTitle: 'Where to act',
  legendGlobal: '{mark} = global principle; the others belong to the project written next to them',
  globalMarkTitle: 'Global principle',
  tableTitle: 'The principles, one per row',
  infoTable: 'For each principle: how many times it decided, how many times it was not enough, how many times it was named as the one the work went against. The last column is the trend of Decided. Principles with no decision or tie in the period sit in one grey row at the bottom.',
  colPrinciple: 'Principle',
  colDecided: 'Decided',
  colNotEnough: 'Not enough',
  colAgainst: 'Against',
  colTrend: 'Decided, per {unit}',
  silentRow: '· silent in the period',
  moreRows: '{n} more rows with fewer than {limit} decisions:',
  showAll: 'show all',
  allRowsShown: 'All rows are shown:',
  showFewer: 'show fewer',
  pairsTitle: 'When it was not enough: the pairs',
  infoPairs: 'The two principles that pulled in opposite directions when the principles did not decide, and how many times. Only pairs whose two names pass the filters.',
  pairsEmpty: 'No pairs in this period.',
  noLevel: 'named without a level',
  inProjects: 'in {n} projects',
  unknownTitle: 'Names cited that no file has',
  infoUnknown: 'Names that came up in the Principles line but are in no THE-WAY.md of the right level, with how many times. They do not count among the choices closed.',
  unknownEmpty: 'None.',
  wayTitle: 'The plugin in use: runs of its skills in the period',
  infoWayInUse: 'How many times each skill of the plugin was started, per step. It follows the projects and the period, not the Principles and List filters.',
  wayNote: 'follows projects and period, not the Principles and List filters',
  wayGrilling: 'the-way-grilling',
  waySelfAnswer: 'the-way-self-answer',
  wayNew: 'the-way-new',
  wayGlobalNew: 'the-way-global-new',
  wayPocock: 'Pocock’s grilling, without the principles',
  footer: 'Ledger: {path}, updated {updatedAt}, {projects} projects, {days} days.'
};

// The one markup of the "i" button and its box; the page and the script both use this function.
function infoMarkup(texts, key, side, labelKey) {
  const escape = function (text) { return String(text).replace(/[&<>"]/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]; }); };
  return '<span class="infoWrap ' + side + '"><button type="button" class="info" aria-label="' + escape(texts[labelKey || 'infoLabel']) + '">i</button><span class="infoText" role="tooltip">' + escape(texts[key]) + '</span></span>';
}

const escapeText = (text) => String(text).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));

const STYLE = `
:root{--bg:#F4F3EF;--card:#FFFFFF;--line:#E3E1DA;--control:#C9C6BC;--text:#1E1E1C;--muted:#5F5F5A;--faint:#6B6B66;--grid:#ECEAE3;--axis:#C9C6BC;--rowline:#F0EEE8;--chip:#EEF2FB;--chipText:#1E3A8A;--soft:#F9F8F5;--blue:#2457C5;--green:#1F8A70;--orange:#C2410C;--activeBg:#1E1E1C;--activeText:#FFFFFF;--tipBg:#1E1E1C;--tipText:#F4F3EF;--link:#2457C5;--linkHover:#163B8C;--spark:#8A8A84;--shadow:rgba(0,0,0,0.18)}
[data-theme="dark"]{--bg:#15151A;--card:#1F1F26;--line:#2E2E36;--control:#3A3A42;--text:#ECEAE3;--muted:#A3A19A;--faint:#A3A19A;--grid:#2E2E36;--axis:#5C5C66;--rowline:#2E2E36;--chip:#243457;--chipText:#C9D8FB;--soft:#1A1A20;--blue:#8FB0F5;--green:#5FD3B5;--orange:#F5A26B;--activeBg:#ECEAE3;--activeText:#15151A;--tipBg:#ECEAE3;--tipText:#15151A;--link:#8FB0F5;--linkHover:#B7CCF9;--spark:#A3A19A;--shadow:rgba(0,0,0,0.5)}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--text);background:var(--bg);font-size:14px;line-height:1.45}
a,.link{color:var(--link)}a:hover,.link:hover{color:var(--linkHover)}
.link{border:0;background:none;padding:0;font:inherit;text-decoration:underline;cursor:pointer}
.page{max-width:1360px;margin:0 auto;padding:28px 40px 48px;display:flex;flex-direction:column;gap:26px}
h1,h2,h3{margin:0}h1{font-size:26px;font-weight:700;letter-spacing:-0.01em}h2{font-size:18px;font-weight:600}h3{font-size:15px;font-weight:600}
header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.titleRow{display:flex;align-items:baseline;gap:14px}.titleRow span,.muted{color:var(--muted)}.faint{color:var(--faint);font-size:12px}
.tools{display:flex;align-items:center;gap:14px}
.seg{display:inline-flex;border:1px solid var(--control);border-radius:8px;overflow:hidden}
.seg button{height:36px;padding:0 14px;border:0;border-left:1px solid var(--control);background:var(--card);color:var(--text);font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.seg button:first-child{border-left:0}
.seg.small button{height:34px}.seg.icons button{width:40px;padding:0}.seg.tight button{padding:0 12px}
.seg button.on{background:var(--activeBg);color:var(--activeText);font-weight:500}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 20px;display:flex;flex-direction:column;gap:14px}
.filters{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:20px}
.cardHead,.rowHead{display:flex;align-items:center;gap:8px}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--faint)}
.fields{display:flex;flex-direction:column;gap:10px}
.fieldRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.fieldRow.wide{gap:24px}
.fieldRow .label{width:72px;color:var(--muted)}.fieldRow .labelShort{color:var(--muted)}.whenCard .fieldRow .label{width:64px}
.pair{display:flex;align-items:center;gap:10px}
.projectField{position:relative;flex:1 1 320px}
.projectBox{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:4px 6px;border:1px solid var(--control);border-radius:8px;background:var(--card);min-height:36px}
.chips{display:contents}
.chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:var(--chip);color:var(--chipText);font-size:13px;font-weight:500}
.chip button{width:18px;height:18px;margin-right:-6px;border:0;border-radius:50%;background:transparent;color:var(--chipText);font:inherit;font-size:14px;line-height:1;padding:0;cursor:pointer}
.projectBox input{flex:1 1 140px;min-width:120px;height:26px;border:0;font:inherit;font-size:13px;color:var(--text);background:transparent;outline:none}
.matches{display:none;position:absolute;left:0;right:0;top:100%;margin-top:4px;max-height:260px;overflow:auto;background:var(--card);border:1px solid var(--control);border-radius:8px;box-shadow:0 6px 20px var(--shadow);z-index:6}
.projectField:focus-within .matches{display:block}
.matches button{display:flex;justify-content:space-between;width:100%;padding:8px 12px;border:0;background:transparent;color:var(--text);font:inherit;text-align:left;cursor:pointer}
.matches button:hover{background:var(--soft)}.matches .count,.matches .empty{color:var(--faint);font-size:12px}.matches .empty{padding:8px 12px}
.plain{height:36px;padding:0 12px;border:1px solid var(--control);border-radius:8px;background:var(--card);font:inherit;color:var(--text);cursor:pointer}
label.date{display:inline-flex;align-items:center;gap:6px;color:var(--muted)}
input[type=date]{height:36px;padding:0 8px;border:1px solid var(--control);border-radius:8px;font:inherit;color:var(--text);background:var(--card);color-scheme:light}
[data-theme="dark"] input[type=date]{color-scheme:dark}
.infoWrap{position:relative;display:inline-flex}
.info{width:20px;height:20px;border:1px solid var(--control);border-radius:50%;background:var(--card);color:var(--faint);font:inherit;font-size:11px;font-weight:600;padding:0;cursor:pointer}
.infoWrap.open .info,.info:hover{background:var(--activeBg);color:var(--activeText)}
.infoText{display:none;position:absolute;top:28px;width:260px;padding:10px 12px;background:var(--tipBg);color:var(--tipText);border-radius:8px;font-size:13px;font-weight:400;line-height:1.4;text-transform:none;letter-spacing:0;box-shadow:0 6px 20px var(--shadow);z-index:8}
.infoWrap.left .infoText{left:0}.infoWrap.right .infoText{right:0}
.infoWrap:hover .infoText,.infoWrap:focus-within .infoText,.infoWrap.open .infoText{display:block}
section{display:flex;flex-direction:column;gap:14px}
.sectionHead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:12px}.sectionHead .lead{display:flex;align-items:baseline;gap:12px}
.tiles3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.tile{padding:20px 22px;gap:10px}
.tileHead{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px;font-weight:600}
.big{display:flex;align-items:baseline;gap:10px}.big b{font-size:40px;font-weight:700;line-height:1}.big span{color:var(--muted)}
.c0.big b{color:var(--blue)}.c1.big b{color:var(--green)}.c2.big b{color:var(--orange)}
.tileScale{display:flex;justify-content:space-between;font-size:12px;color:var(--faint)}
.note{font-size:12px;color:var(--faint)}
.habit{display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:var(--muted);padding:0 4px}.habit .habitTitle{font-weight:600;color:var(--text)}.habit b{color:var(--text)}
svg text{font-family:inherit}
.base{stroke:var(--line);stroke-width:0.5}
.trend{fill:none;stroke-width:1.6;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}
.c0.trend,.c0.line{stroke:var(--blue)}.c1.trend,.c1.line{stroke:var(--green)}.c2.trend,.c2.line{stroke:var(--orange)}
.c0.bar,.c0.dot,.c0.swatch,.c0.swatchLine{fill:var(--blue)}.c1.bar,.c1.dot,.c1.swatch,.c1.swatchLine{fill:var(--green)}.c2.bar,.c2.dot,.c2.swatch,.c2.swatchLine{fill:var(--orange)}
i.swatch,i.swatchLine{display:inline-block}
i.c0{background:var(--blue)}i.c1{background:var(--green)}i.c2{background:var(--orange)}
.swatch{width:12px;height:12px;border-radius:2px}.swatchLine{width:18px;height:3px;border-radius:2px}.swatchOutline{background:none!important;border:1px solid var(--axis);box-sizing:border-box}
.chartHead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.legend{display:flex;flex-wrap:wrap;gap:18px;font-size:13px;color:var(--muted)}.legend span{display:inline-flex;align-items:center;gap:6px}
.chartCard{padding:20px 22px;gap:12px}.chartCard h2{font-size:16px}.hint{font-size:12px;color:var(--faint)}
.gridLine{stroke:var(--grid)}.axisLine{stroke:var(--axis)}.axisText{font-size:11px;fill:var(--faint)}.xText{font-size:12px;fill:var(--muted)}
.line{fill:none;stroke-width:2.5}.outline{fill:none;stroke:var(--axis)}.valueLabel{font-size:12px;font-weight:600}.c0.valueLabel{fill:var(--blue)}.c1.valueLabel{fill:var(--green)}.c2.valueLabel{fill:var(--orange)}.outlineLabel{font-size:11px;fill:var(--faint)}
.band{fill:transparent}.dotEmpty{fill:transparent}.hit .tip{opacity:0;pointer-events:none}.hit:hover .tip{opacity:1}
.tip rect{fill:var(--tipBg)}.tip text{font-size:12px;fill:var(--tipText)}.tip .tipHead{font-weight:600}
.whereGrid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:20px}.stack{display:flex;flex-direction:column;gap:20px}
.panel{padding:18px 22px;gap:8px}
table{width:100%;border-collapse:collapse}
th{padding:8px 6px;font-weight:500;font-size:12px;color:var(--faint);text-align:left;border-bottom:1px solid var(--line)}
td{padding:8px 6px;border-bottom:1px solid var(--rowline)}tr:last-child td{border-bottom:0}
th.n,td.n{text-align:right}td.hot{color:var(--orange);font-weight:600}td.zero{color:var(--faint)}
.collapsed .extra{display:none}
.nameCell{display:inline-flex;align-items:center;gap:6px}
.globeMark{display:inline-flex;color:var(--blue)}.globeMark svg{fill:none;stroke:var(--blue);stroke-width:1.2}
.legendGlobal{font-size:13px;color:var(--muted);display:inline-flex;align-items:center;gap:6px}
.pairs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.pairs li{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--rowline)}.pairs li:last-child{border-bottom:0}.pairs b.hot{color:var(--orange)}
.chips2{display:flex;flex-wrap:wrap;gap:8px}.chips2 span{padding:4px 10px;border:1px solid var(--line);border-radius:999px;font-size:13px}
.way{padding-top:20px;border-top:1px solid var(--line);gap:12px}.way h2{font-size:16px;color:var(--muted)}.way .sectionHead .lead{align-items:center;gap:8px}
.wayTiles{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
.wayTile{background:var(--soft);border:1px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}.wayTile.dashed{border-style:dashed;border-color:var(--control)}
.wayTile .name{font-size:12px;color:var(--muted)}.wayTile .row{display:flex;align-items:baseline;justify-content:space-between}.wayTile .count{font-size:22px;font-weight:600}.wayTile.dashed .count{color:var(--muted)}
.spark{fill:none;stroke:var(--spark);stroke-width:1.5;vector-effect:non-scaling-stroke;stroke-linecap:round}.spark.dashed{stroke-dasharray:3 2}.rowSpark{fill:none;stroke:var(--blue);stroke-width:1.5;vector-effect:non-scaling-stroke;stroke-linecap:round}
footer{color:var(--faint);font-size:12px}
@media (max-width:1000px){.page{padding:20px 16px 40px}.filters,.whereGrid,.tiles3{grid-template-columns:minmax(0,1fr)}.wayTiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

const CLIENT_SCRIPT = String.raw`
(function () {
const ledger = JSON.parse(document.getElementById('ledger').textContent);
const texts = ledger.texts;
const infoMarkup = ${infoMarkup};
const NOT_IN_A_FILE = 'not in a file';
const DAY = 86400000;
const LEFT = 60, RIGHT = 1180, TOP = 20, BASE = 200;
const VISIBLE_ROWS = 8, FEW_DECISIONS = 5, PAIR_LIMIT = 12;
const POCOCK_GRILLING = ['mattpocock-skills:grilling', 'grilling'];
const TILES = [
  { cls: 'c0', title: 'tileClosedTitle', info: 'infoTileClosed', shares: 'shareOfClosed', numbers: 'numbersClosed', legend: 'legendClosed' },
  { cls: 'c1', title: 'tileTakenTitle', info: 'infoTileTaken', shares: 'shareOfTaken', numbers: 'numbersTaken', legend: 'legendTaken' },
  { cls: 'c2', title: 'tileOpenTitle', info: 'infoTileOpen', shares: 'shareOfOpen', numbers: 'numbersOpen', legend: 'legendOpen' }
];
const WAY_TILES = [
  { label: 'wayGrilling', skills: ['alecsplus-skills:the-way-grilling'], dashed: false },
  { label: 'waySelfAnswer', skills: ['alecsplus-skills:the-way-self-answer'], dashed: false },
  { label: 'wayNew', skills: ['alecsplus-skills:the-way-new'], dashed: false },
  { label: 'wayGlobalNew', skills: ['alecsplus-skills:the-way-global-new'], dashed: false },
  { label: 'wayPocock', skills: POCOCK_GRILLING, dashed: true }
];
const state = { mode: 'shares', level: 'all', kind: 'all', unit: 'week', preset: '30', from: '', to: '', chosen: null, showAll: false, scheme: 'light' };
let current = null;
const element = function (id) { return document.getElementById(id); };
const isoDay = function (time) { return new Date(time).toISOString().slice(0, 10); };
const escapeHtml = function (text) { return String(text).replace(/[&<>"]/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]; }); };
const fill = function (template, values) { return template.replace(/\{(\w+)\}/g, function (placeholder, key) { return String(values[key]); }); };
const fillHtml = function (template, values) { return escapeHtml(template).replace(/\{(\w+)\}/g, function (placeholder, key) { return values[key]; }); };
const increase = function (counts, key, amount) { counts[key] = (counts[key] || 0) + amount; };
const round = function (number) { return Math.round(number * 10) / 10; };
const globalMark = function () {
  const title = escapeHtml(texts.globalMarkTitle);
  return '<span class="globeMark" role="img" aria-label="' + title + '" title="' + title + '"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5"/><ellipse cx="7" cy="7" rx="2.3" ry="5.5"/><line x1="1.5" y1="7" x2="12.5" y2="7"/></svg></span>';
};
const percent = function (part, whole) { return whole > 0 ? Math.round(100 * part / whole) : null; };
const shareText = function (part, whole) { return whole > 0 ? percent(part, whole) + '%' : '—'; };
function dayLabel(day) { return Number(day.slice(8, 10)) + ' ' + texts.monthNames.split(' ')[Number(day.slice(5, 7)) - 1] + ' ' + day.slice(0, 4); }
function bucketStart(day) {
  const date = new Date(day + 'T00:00:00Z');
  const weekDay = isoDay(date.getTime() - ((date.getUTCDay() + 6) % 7) * DAY);
  return state.unit === 'day' ? day : (state.unit === 'month' ? day.slice(0, 7) + '-01' : weekDay);
}
function bucketLabel(key) {
  const monthName = texts.monthNames.split(' ')[Number(key.slice(5, 7)) - 1];
  return state.unit === 'month' ? monthName + ' ' + key.slice(0, 4) : Number(key.slice(8, 10)) + ' ' + monthName;
}
function unitWord() { return texts[{ day: 'unitDay', week: 'unitWeek', month: 'unitMonth' }[state.unit]].toLowerCase(); }
function perUnit(template) { return fill(template, { unit: unitWord() }); }
function filesOf(folder) { return ledger.files[folder] || {}; }
function classify(key, folder) {
  const match = /^(.*?)_([a-z]+)$/.exec(key);
  const globalNames = (filesOf('*').global) || [];
  const projectNames = filesOf(folder).project || [];
  const isGlobal = Boolean(match) && globalNames.indexOf(match[1]) >= 0;
  const isProject = !match && projectNames.indexOf(key) >= 0;
  return { base: match ? match[1] : key, level: isGlobal ? 'global' : (isProject ? 'project' : NOT_IN_A_FILE) };
}
function passes(found, folder) {
  const lists = found.level === 'global' ? filesOf('*').globalLists : filesOf(folder).projectLists;
  const levelFits = state.level === 'all' || state.level === found.level;
  const kindFits = state.kind === 'all' || (found.level !== NOT_IN_A_FILE && Boolean(lists) && (lists[state.kind] || []).indexOf(found.base) >= 0);
  return levelFits && kindFits;
}
function allFolders() { return Object.keys(ledger.projects); }
function selectedFolders() { return state.chosen ? allFolders().filter(function (folder) { return state.chosen[folder]; }) : allFolders(); }
function isAllSelected() { return selectedFolders().length === allFolders().length; }
// The key of the counts by level and list; '*/*' is no filter.
function citeKey() { return (state.level === 'all' ? '*' : state.level) + '/' + (state.kind === 'all' ? '*' : state.kind); }
// The grilling answers of a day under the filters; null when the day was saved before they were kept by level and list.
function adviceOf(facts, key) {
  const cites = facts.grillingCites;
  const own = cites ? (cites[key] || { chosenRecommended: 0, chosenOther: 0 }) : null;
  return key === '*/*' ? ((cites && cites[key]) || facts.grilling) : own;
}
function emptyBucket() { return { answers: 0, withLine: 0, asked: 0, closed: 0, taken: 0, other: 0, open: 0, openWhole: 0, skills: {} }; }
function rowOf(rows, found, folder) {
  const id = found.level === 'global' ? 'global:' + found.base : found.level + ':' + folder + ':' + found.base;
  rows[id] = rows[id] || { name: found.base, level: found.level, project: found.level === 'global' ? '' : ledger.projects[folder].name, decided: 0, ties: 0, against: 0, perBucket: {} };
  return rows[id];
}
function aggregate() {
  const total = { answers: 0, withLine: 0, asked: 0, closed: 0, taken: 0, other: 0, open: 0, openWhole: 0, skills: {}, rows: {}, pairs: {}, unknown: {}, buckets: {}, missing: { taken: false, open: false }, since: { taken: '', open: '' } };
  const key = citeKey();
  selectedFolders().forEach(function (folder) {
    const days = ledger.projects[folder].days;
    Object.keys(days).filter(function (day) { return day >= state.from && day <= state.to; }).forEach(function (day) {
      const facts = days[day];
      const bucket = bucketStart(day);
      total.buckets[bucket] = total.buckets[bucket] || emptyBucket();
      const targets = [total, total.buckets[bucket]];
      const add = function (field, amount) { targets.forEach(function (target) { target[field] += amount; }); };
      const advice = adviceOf(facts, key);
      const hasOpen = Boolean(facts.openCites);
      add('answers', facts.answers); add('withLine', facts.withLine); add('asked', facts.questionsAsked);
      add('taken', advice ? advice.chosenRecommended : 0); add('other', advice ? advice.chosenOther : 0);
      add('open', hasOpen ? (facts.openCites[key] || 0) : 0); add('openWhole', hasOpen ? facts.questionsAsked : 0);
      total.missing.taken = total.missing.taken || !advice; total.missing.open = total.missing.open || !hasOpen;
      total.since.taken = advice && (!total.since.taken || day < total.since.taken) ? day : total.since.taken;
      total.since.open = hasOpen && (!total.since.open || day < total.since.open) ? day : total.since.open;
      Object.keys(facts.skills).forEach(function (skill) { increase(total.skills, skill, facts.skills[skill]); increase(total.buckets[bucket].skills, skill, facts.skills[skill]); });
      Object.keys(facts.tiePairs).forEach(function (pair) {
        const found = pair.split(' × ').map(function (name) { return classify(name, folder); });
        const scope = found.some(function (entry) { return entry.level === 'project'; }) ? 'project:' + folder : (found.some(function (entry) { return entry.level === NOT_IN_A_FILE; }) ? 'none' : 'global');
        const id = found.map(function (entry) { return entry.level + ':' + entry.base; }).join(' × ') + '|' + scope;
        if (found.every(function (entry) { return passes(entry, folder); })) {
          total.pairs[id] = total.pairs[id] || { found: found, scope: scope, count: 0, folders: {}, project: ledger.projects[folder].name };
          total.pairs[id].count += facts.tiePairs[pair]; total.pairs[id].folders[folder] = true;
        }
      });
      ['decided', 'ties', 'against'].forEach(function (field) {
        Object.keys(facts[field]).forEach(function (name) {
          const found = classify(name, folder);
          const isKnown = found.level !== NOT_IN_A_FILE;
          if (passes(found, folder) && isKnown) {
            const row = rowOf(total.rows, found, folder);
            row[field] += facts[field][name];
            if (field === 'decided') { increase(row.perBucket, bucket, facts.decided[name]); add('closed', facts.decided[name]); }
          }
          if (passes(found, folder) && !isKnown) { increase(total.unknown, found.base, facts[field][name]); }
        });
      });
    });
    (filesOf(folder).project || []).forEach(function (name) { const found = { base: name, level: 'project' }; if (passes(found, folder)) { rowOf(total.rows, found, folder); } });
    ((filesOf('*').global) || []).forEach(function (name) { const found = { base: name, level: 'global' }; if (passes(found, folder)) { rowOf(total.rows, found, folder); } });
  });
  return total;
}
function bucketsBetween() {
  const list = [];
  const last = Date.parse(state.to + 'T00:00:00Z');
  let time = Date.parse(bucketStart(state.from) + 'T00:00:00Z');
  while (time <= last && list.length < 1000) {
    list.push(isoDay(time));
    const date = new Date(time);
    time = state.unit === 'month' ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) : time + (state.unit === 'day' ? 1 : 7) * DAY;
  }
  return list;
}
// The three quantities of the tiles for a total or a bucket: what counted, out of how much.
function quantities(source) {
  return [
    { part: source.closed, whole: source.closed + source.asked },
    { part: source.taken, whole: source.taken + source.other },
    { part: source.open, whole: source.openWhole }
  ];
}
function pointsOf(total, list, index) {
  return list.map(function (bucket) {
    const found = quantities(total.buckets[bucket] || emptyBucket())[index];
    return { bucket: bucket, label: bucketLabel(bucket), part: found.part, whole: found.whole, share: percent(found.part, found.whole) };
  });
}
function titleOf(label, found) { return '<title>' + escapeHtml(label + ': ' + fill(texts.partOfWhole, found)) + '</title>'; }
function xPercent(index, count) { return count > 1 ? 100 * index / (count - 1) : 50; }
// The polyline joins the buckets that have something to count, in order, skipping the empty ones.
function joinedPoints(points, count, yOf) {
  const joined = points.filter(function (point) { return point.share !== null; }).map(function (point) { return round(xPercent(points.indexOf(point), count)) + ',' + round(yOf(point)); });
  return joined.length === 1 ? [joined[0], joined[0]] : joined;
}
function trendSvg(points, cls) {
  const count = Math.max(points.length, 1);
  const slot = 100 / count;
  const bands = points.map(function (point, index) { return '<rect class="band" x="' + round(slot * index) + '" y="0" width="' + round(slot) + '" height="30">' + titleOf(point.label, point) + '</rect>'; }).join('');
  const maximum = Math.max.apply(null, points.map(function (point) { return point.part; }).concat([1]));
  const body = state.mode === 'shares'
    ? '<polyline class="trend ' + cls + '" points="' + joinedPoints(points, count, function (point) { return 28 - 26 * Math.min(point.share, 100) / 100; }).join(' ') + '"/>'
    : points.map(function (point, index) { const height = 26 * point.part / maximum; return '<rect class="bar ' + cls + '" x="' + round(slot * index + slot * 0.1) + '" y="' + round(28 - height) + '" width="' + round(slot * 0.8) + '" height="' + round(height) + '"/>'; }).join('');
  const values = points.map(function (point) { return state.mode === 'shares' ? (point.share === null ? '—' : point.share + '%') : point.part; }).join(', ');
  return { maximum: maximum, html: '<svg viewBox="0 0 100 30" preserveAspectRatio="none" width="100%" height="36" role="img" aria-label="' + escapeHtml(fill(texts.tileTrendAria, { unit: unitWord(), values: values })) + '"><line class="base" x1="0" y1="28" x2="100" y2="28"/>' + body + bands + '</svg>' };
}
function renderTiles(total, list) {
  const numbers = quantities(total);
  const isShares = state.mode === 'shares';
  element('tiles').innerHTML = TILES.map(function (tile, index) {
    const found = numbers[index];
    const share = shareText(found.part, found.whole);
    const small = isShares ? fill(texts[tile.shares], found) : fill(texts[tile.numbers], { asked: total.asked, other: total.other, whole: found.whole, share: share });
    const trend = trendSvg(pointsOf(total, list, index), tile.cls);
    const scale = isShares ? perUnit(texts.tileScaleShares) : fill(texts.tileScaleNumbers, { unit: unitWord(), maximum: trend.maximum });
    const since = [null, 'taken', 'open'][index];
    const note = since && total.missing[since] ? '<div class="note">' + escapeHtml(fill(texts.countedSince, { date: total.since[since] ? dayLabel(total.since[since]) : '—' })) + '</div>' : '';
    return '<article class="card tile"><div class="tileHead"><span>' + escapeHtml(texts[tile.title]) + '</span>' + infoMarkup(texts, tile.info, 'right', 'infoCounts') + '</div>'
      + '<div class="big ' + tile.cls + '"><b>' + escapeHtml(isShares ? share : found.part) + '</b><span>' + escapeHtml(small) + '</span></div>' + trend.html
      + '<div class="tileScale"><span>' + escapeHtml(list.length ? bucketLabel(list[0]) : '') + '</span><span>' + escapeHtml(scale) + '</span><span>' + escapeHtml(list.length ? bucketLabel(list[list.length - 1]) : '') + '</span></div>' + note + '</article>';
  }).join('');
}
function renderHabit(total, list) {
  const last = total.buckets[list[list.length - 1]] || emptyBucket();
  element('habit').innerHTML = '<span class="habitTitle">' + escapeHtml(texts.habitTitle) + '</span><span>'
    + fillHtml(texts.habitText, { share: '<b>' + escapeHtml(shareText(total.withLine, total.answers)) + '</b>', part: total.withLine, whole: total.answers, unit: escapeHtml(unitWord()), last: escapeHtml(shareText(last.withLine, last.answers)) })
    + '</span>' + infoMarkup(texts, 'infoHabit', 'left');
}
function niceMaximum(value) {
  const clamped = Math.max(value, 2);
  const power = Math.pow(10, Math.floor(Math.log10(clamped)));
  return [1, 2, 4, 6, 8, 10].map(function (step) { return step * power; }).filter(function (candidate) { return candidate >= clamped; })[0];
}
function tipHeading(label) { return state.unit === 'week' ? fill(texts.tipWeek, { label: label }) : label; }
function xLabels(list, positionOf) {
  const step = Math.ceil(list.length / 10);
  return list.map(function (bucket, index) { return index % step === 0 ? '<text class="xText" x="' + round(positionOf(index)) + '" y="226" text-anchor="middle">' + escapeHtml(bucketLabel(bucket)) + '</text>' : ''; }).join('');
}
function gridLines(labels) {
  return [0, 1, 2].map(function (step) {
    const y = TOP + (BASE - TOP) * step / 2;
    return '<line class="' + (step === 2 ? 'axisLine' : 'gridLine') + '" x1="' + LEFT + '" y1="' + y + '" x2="' + RIGHT + '" y2="' + y + '"/><text class="axisText" x="' + (LEFT - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + escapeHtml(labels[step]) + '</text>';
  }).join('');
}
function sharesChart(total, list) {
  const count = list.length;
  const series = TILES.map(function (tile, index) { return pointsOf(total, list, index); });
  const xOf = function (index) { return count > 1 ? LEFT + (RIGHT - LEFT) * index / (count - 1) : (LEFT + RIGHT) / 2; };
  const yOf = function (share) { return BASE - 180 * Math.min(share, 100) / 100; };
  const lines = TILES.map(function (tile, index) { return '<polyline class="line ' + tile.cls + '" points="' + joinedPoints(series[index], count, function (point) { return yOf(point.share); }).map(function (pair) { const parts = pair.split(','); return round(LEFT + (RIGHT - LEFT) * Number(parts[0]) / 100) + ',' + parts[1]; }).join(' ') + '"/>'; }).join('');
  const hits = list.map(function (bucket, index) {
    const slot = count > 1 ? (RIGHT - LEFT) / (count - 1) : 200;
    const dots = TILES.map(function (tile, tileIndex) { const point = series[tileIndex][index]; return point.share === null ? '<circle class="dotEmpty" cx="' + round(xOf(index)) + '" cy="' + BASE + '" r="4"><title>' + escapeHtml(fill(texts.noDataPoint, { label: point.label })) + '</title></circle>' : '<circle class="dot ' + tile.cls + '" cx="' + round(xOf(index)) + '" cy="' + round(yOf(point.share)) + '" r="3">' + titleOf(texts[tile.legend], point) + '</circle>'; }).join('');
    const lineTexts = TILES.map(function (tile, tileIndex) { const point = series[tileIndex][index]; return texts[tile.legend] + ' ' + (point.share === null ? '—' : point.share + '% · ' + fill(texts.partOfWhole, point)); });
    const tipX = xOf(index) > (LEFT + RIGHT) / 2 ? xOf(index) - 282 : xOf(index) + 14;
    const tip = '<g class="tip"><rect x="' + round(tipX) + '" y="30" width="270" height="72" rx="8"/><text class="tipHead" x="' + round(tipX + 12) + '" y="48">' + escapeHtml(tipHeading(bucketLabel(bucket))) + '</text>'
      + lineTexts.map(function (line, lineIndex) { return '<text x="' + round(tipX + 12) + '" y="' + (66 + 16 * lineIndex) + '">' + escapeHtml(line) + '</text>'; }).join('') + '</g>';
    return '<g class="hit"><rect class="band" x="' + round(xOf(index) - slot / 2) + '" y="' + (TOP - 10) + '" width="' + round(slot) + '" height="' + (BASE - TOP + 10) + '"/>' + dots + tip + '</g>';
  }).join('');
  return '<svg viewBox="0 0 1240 240" width="100%" height="240" role="img" aria-label="' + escapeHtml(perUnit(texts.chartAriaShares)) + '">' + gridLines(['100%', '50%', '0%']) + xLabels(list, xOf) + lines + hits + '</svg>';
}
function numbersChart(total, list) {
  const count = Math.max(list.length, 1);
  const series = TILES.map(function (tile, index) { return pointsOf(total, list, index); });
  const asked = list.map(function (bucket) { return (total.buckets[bucket] || emptyBucket()).asked; });
  const maximum = niceMaximum(Math.max.apply(null, asked.concat(series.map(function (points) { return Math.max.apply(null, points.map(function (point) { return point.part; })); }))));
  const slot = (RIGHT - LEFT) / count;
  const centerOf = function (index) { return LEFT + slot * (index + 0.5); };
  const groupWidth = Math.min(slot * 0.72, 120);
  const gap = groupWidth * 0.03;
  const outlineWidth = groupWidth * 0.4;
  const barWidth = (groupWidth - outlineWidth - 3 * gap) / 3;
  const groupStartOf = function (index) { return centerOf(index) - groupWidth / 2; };
  const yOf = function (value) { return BASE - 180 * value / maximum; };
  const startOf = function (index, tileIndex) { return groupStartOf(index) + outlineWidth + gap + tileIndex * (barWidth + gap); };
  const outlines = list.map(function (bucket, index) { return '<rect class="outline" x="' + round(groupStartOf(index)) + '" y="' + round(yOf(asked[index])) + '" width="' + round(outlineWidth) + '" height="' + round(BASE - yOf(asked[index])) + '"><title>' + escapeHtml(texts.legendAsked + ': ' + asked[index]) + '</title></rect>'; }).join('');
  const bars = TILES.map(function (tile, tileIndex) {
    return series[tileIndex].map(function (point, index) { return '<rect class="bar ' + tile.cls + '" x="' + round(startOf(index, tileIndex)) + '" y="' + round(yOf(point.part)) + '" width="' + round(barWidth) + '" height="' + round(BASE - yOf(point.part)) + '">' + titleOf(texts[tile.legend], point) + '</rect>'; }).join('');
  }).join('');
  const labelOf = function (values, x, y, cls) { const top = Math.max.apply(null, values); return top > 0 ? '<text class="' + cls + '" x="' + round(x(values.indexOf(top))) + '" y="' + round(y(top) - 6) + '" text-anchor="middle">' + top + '</text>' : ''; };
  const labels = labelOf(asked, function (index) { return groupStartOf(index) + outlineWidth / 2; }, yOf, 'outlineLabel')
    + TILES.map(function (tile, tileIndex) { return labelOf(series[tileIndex].map(function (point) { return point.part; }), function (index) { return startOf(index, tileIndex) + barWidth / 2; }, yOf, 'valueLabel ' + tile.cls); }).join('');
  return '<svg viewBox="0 0 1240 240" width="100%" height="240" role="img" aria-label="' + escapeHtml(perUnit(texts.chartAriaNumbers)) + '">' + gridLines([maximum, maximum / 2, 0]) + xLabels(list, centerOf) + outlines + bars + labels + '</svg>';
}
function renderChart(total, list) {
  const isShares = state.mode === 'shares';
  element('chartTitle').textContent = perUnit(isShares ? texts.chartSharesTitle : texts.chartNumbersTitle);
  element('legend').innerHTML = TILES.map(function (tile) { return '<span><i class="' + (isShares ? 'swatchLine' : 'swatch') + ' ' + tile.cls + '"></i>' + escapeHtml(texts[tile.legend]) + '</span>'; }).join('')
    + (isShares ? '' : '<span><i class="swatch swatchOutline"></i>' + escapeHtml(texts.legendAsked) + '</span>');
  element('chart').innerHTML = isShares ? sharesChart(total, list) : numbersChart(total, list);
  element('chartHint').textContent = isShares ? texts.chartHintShares : texts.chartHintNumbers;
}
function subtitle() {
  const chosen = selectedFolders();
  const who = chosen.length === 1 ? fill(texts.subtitleProject, { name: ledger.projects[chosen[0]].name }) : fill(texts.subtitleProjects, { n: chosen.length });
  const when = state.preset === 'all' ? texts.subtitleAllDays : (state.preset ? fill(texts.subtitleDays, { n: state.preset }) : fill(texts.subtitleRange, { from: dayLabel(state.from), to: dayLabel(state.to) }));
  return who + ', ' + when + (state.mode === 'numbers' ? ' · ' + texts.subtitleNumbers : '');
}
function renderQuantities() {
  element('subtitle').textContent = subtitle();
  renderTiles(current.total, current.list);
  renderChart(current.total, current.list);
}
function nameHtml(name, level) { return (level === 'global' ? globalMark() : '') + '<b class="name" data-level="' + escapeHtml(level) + '">' + escapeHtml(name) + '</b>'; }
function rowSpark(row, list) {
  const values = list.map(function (bucket) { return row.perBucket[bucket] || 0; });
  const maximum = Math.max.apply(null, values.concat([1]));
  const count = Math.max(list.length, 1);
  const bands = list.map(function (bucket, index) { return '<rect class="band" x="' + round(100 / count * index) + '" y="0" width="' + round(100 / count) + '" height="20"><title>' + escapeHtml(bucketLabel(bucket) + ': ' + values[index]) + '</title></rect>'; }).join('');
  const points = values.map(function (value, index) { return round(xPercent(index, count)) + ',' + round(18 - 16 * value / maximum); });
  return '<svg viewBox="0 0 100 20" preserveAspectRatio="none" width="110" height="20" aria-hidden="true"><polyline class="rowSpark" points="' + (points.length === 1 ? points[0] + ' ' + points[0] : points.join(' ')) + '"/>' + bands + '</svg>';
}
function renderPrinciples(total, list) {
  const rows = Object.keys(total.rows).map(function (id) { return total.rows[id]; });
  const isUsed = function (row) { return row.decided + row.ties + row.against > 0; };
  const used = rows.filter(isUsed).sort(function (left, right) { return (right.decided - left.decided) || (right.ties - left.ties) || left.name.localeCompare(right.name); });
  const silent = rows.filter(function (row) { return !isUsed(row); }).sort(function (left, right) { return left.name.localeCompare(right.name); });
  const showsProject = selectedFolders().length > 1;
  const isExtra = function (row, index) { return index >= VISIBLE_ROWS && row.decided < FEW_DECISIONS; };
  const extraCount = used.filter(isExtra).length;
  const body = used.map(function (row, index) {
    const project = showsProject && row.level === 'project' ? ' <span class="faint">' + escapeHtml(row.project) + '</span>' : '';
    return '<tr class="' + (isExtra(row, index) ? 'extra' : '') + '"><td><span class="nameCell">' + nameHtml(row.name, row.level) + project + '</span></td><td class="n">' + row.decided + '</td><td class="n' + (row.ties > row.decided ? ' hot' : '') + '">' + row.ties + '</td><td class="n' + (row.against > 0 ? ' hot' : '') + '">' + row.against + '</td><td>' + rowSpark(row, list) + '</td></tr>';
  }).join('');
  const silentRow = silent.length ? '<tr><td><span class="muted">' + silent.map(function (row) { return '<span class="nameCell">' + nameHtml(row.name, row.level) + '</span>'; }).join(', ') + ' <span class="faint">' + escapeHtml(texts.silentRow) + '</span></span></td><td class="n zero">0</td><td class="n zero">0</td><td class="n zero">0</td><td></td></tr>' : '';
  const more = extraCount ? '<div class="faint">' + escapeHtml(state.showAll ? texts.allRowsShown : fill(texts.moreRows, { n: extraCount, limit: FEW_DECISIONS })) + ' <button type="button" class="link" data-toggle-rows="1">' + escapeHtml(state.showAll ? texts.showFewer : texts.showAll) + '</button></div>' : '';
  element('principles').innerHTML = '<table class="' + (state.showAll ? '' : 'collapsed') + '"><thead><tr><th>' + escapeHtml(texts.colPrinciple) + '</th><th class="n">' + escapeHtml(texts.colDecided) + '</th><th class="n">' + escapeHtml(texts.colNotEnough) + '</th><th class="n">' + escapeHtml(texts.colAgainst) + '</th><th>' + escapeHtml(perUnit(texts.colTrend)) + '</th></tr></thead><tbody>' + body + silentRow + '</tbody></table>' + more;
}
function renderPairs(total) {
  const showsProject = selectedFolders().length > 1;
  const entries = Object.keys(total.pairs).map(function (id) { return total.pairs[id]; }).sort(function (left, right) { return right.count - left.count; }).slice(0, PAIR_LIMIT);
  element('pairs').innerHTML = entries.length ? '<ul class="pairs">' + entries.map(function (entry) {
    const folders = Object.keys(entry.folders).length;
    const suffix = entry.scope === 'none' ? texts.noLevel + (folders > 1 ? ', ' + fill(texts.inProjects, { n: folders }) : '') : (entry.scope === 'global' || !showsProject ? '' : entry.project);
    return '<li><span>' + entry.found.map(function (found) { return '<span class="nameCell">' + nameHtml(found.base, found.level) + '</span>'; }).join(' × ') + (suffix ? ' <span class="faint">· ' + escapeHtml(suffix) + '</span>' : '') + '</span><b class="' + (entry.count >= 2 ? 'hot' : '') + '">' + entry.count + '</b></li>';
  }).join('') + '</ul>' : '<div class="faint">' + escapeHtml(texts.pairsEmpty) + '</div>';
}
function renderUnknown(total) {
  const names = Object.keys(total.unknown).sort(function (left, right) { return (total.unknown[right] - total.unknown[left]) || left.localeCompare(right); });
  element('unknown').innerHTML = names.length ? '<div class="chips2">' + names.map(function (name) { return '<span>' + escapeHtml(name) + ' · ' + total.unknown[name] + '</span>'; }).join('') + '</div>' : '<div class="faint">' + escapeHtml(texts.unknownEmpty) + '</div>';
}
function renderWay(total, list) {
  element('wayTiles').innerHTML = WAY_TILES.map(function (tile) {
    const values = list.map(function (bucket) { const runs = (total.buckets[bucket] || emptyBucket()).skills; return tile.skills.reduce(function (sum, skill) { return sum + (runs[skill] || 0); }, 0); });
    const maximum = Math.max.apply(null, values.concat([1]));
    const count = Math.max(list.length, 1);
    const points = values.map(function (value, index) { return round(xPercent(index, count)) + ',' + round(18 - 16 * value / maximum); });
    const bands = list.map(function (bucket, index) { return '<rect class="band" x="' + round(100 / count * index) + '" y="0" width="' + round(100 / count) + '" height="20"><title>' + escapeHtml(bucketLabel(bucket) + ': ' + values[index]) + '</title></rect>'; }).join('');
    return '<div class="wayTile' + (tile.dashed ? ' dashed' : '') + '"><span class="name">' + escapeHtml(texts[tile.label]) + '</span><div class="row"><span class="count">' + values.reduce(function (sum, value) { return sum + value; }, 0) + '</span>'
      + '<svg viewBox="0 0 100 20" preserveAspectRatio="none" width="70" height="20" aria-hidden="true"><polyline class="spark' + (tile.dashed ? ' dashed' : '') + '" points="' + (points.length === 1 ? points[0] + ' ' + points[0] : points.join(' ')) + '"/>' + bands + '</svg></div></div>';
  }).join('');
}
function answersIn(folder) {
  const days = ledger.projects[folder].days;
  return Object.keys(days).reduce(function (sum, day) { return sum + (day >= state.from && day <= state.to ? days[day].answers : 0); }, 0);
}
function matchingProjects() {
  const query = element('projectSearch').value.trim().toLowerCase();
  const chosen = selectedFolders();
  const isAll = isAllSelected();
  return { query: query, folders: allFolders().filter(function (folder) { return (isAll || chosen.indexOf(folder) < 0) && ledger.projects[folder].name.toLowerCase().indexOf(query) >= 0; })
    .sort(function (left, right) { return (answersIn(right) - answersIn(left)) || ledger.projects[left].name.localeCompare(ledger.projects[right].name); }) };
}
function renderProjects() {
  const folders = allFolders();
  element('projectChips').innerHTML = isAllSelected()
    ? '<span class="chip">' + escapeHtml(fill(texts.allProjectsChip, { n: folders.length })) + '</span>'
    : selectedFolders().map(function (folder) {
      const label = escapeHtml(fill(texts.removeProject, { name: ledger.projects[folder].name }));
      return '<span class="chip">' + escapeHtml(ledger.projects[folder].name) + '<button type="button" data-remove="' + escapeHtml(folder) + '" aria-label="' + label + '">×</button></span>';
    }).join('');
  element('projectAll').textContent = fill(texts.allProjectsButton, { n: folders.length });
  const found = matchingProjects();
  element('projectMatches').innerHTML = found.folders.map(function (folder) {
    return '<button type="button" data-add="' + escapeHtml(folder) + '"><span>' + escapeHtml(ledger.projects[folder].name) + '</span><span class="count">' + escapeHtml(fill(texts.answersCount, { n: answersIn(folder) })) + '</span></button>';
  }).join('') + (found.folders.length || !found.query ? '' : '<div class="empty">' + escapeHtml(texts.noProjectMatches) + '</div>');
}
function addProject(folder) {
  state.chosen = isAllSelected() ? {} : state.chosen;
  state.chosen[folder] = true;
  element('projectSearch').value = '';
  render();
}
function removeProject(folder) {
  delete state.chosen[folder];
  state.chosen = Object.keys(state.chosen).length ? state.chosen : null;
  render();
}
function syncControls() {
  const sync = function (name, value) {
    Array.prototype.forEach.call(document.querySelectorAll('button[data-' + name + ']'), function (button) { button.classList.toggle('on', button.getAttribute('data-' + name) === value); });
  };
  sync('mode', state.mode); sync('level', state.level); sync('kind', state.kind); sync('unit', state.unit); sync('days', state.preset); sync('scheme', state.scheme);
}
function render() {
  const total = aggregate();
  const list = bucketsBetween();
  current = { total: total, list: list };
  syncControls();
  renderQuantities();
  renderHabit(total, list);
  renderPrinciples(total, list);
  renderPairs(total);
  renderUnknown(total);
  renderWay(total, list);
  renderProjects();
}
function allDays() {
  const days = [];
  allFolders().forEach(function (folder) { Object.keys(ledger.projects[folder].days).forEach(function (day) { days.push(day); }); });
  return days.sort();
}
function setPreset(preset) {
  const today = isoDay(Date.now());
  state.preset = preset; state.to = today;
  state.from = preset === 'all' ? (allDays()[0] || today) : isoDay(Date.now() - (Number(preset) - 1) * DAY);
  element('from').value = state.from; element('to').value = state.to;
}
function applyScheme(scheme, isRemembered) {
  state.scheme = scheme;
  document.documentElement.setAttribute('data-theme', scheme);
  try { if (isRemembered) { localStorage.setItem('the-way-theme', scheme); } } catch (error) { state.scheme = scheme; }
}
function startingScheme() {
  let scheme = '';
  try { scheme = localStorage.getItem('the-way-theme') || ''; } catch (error) { scheme = ''; }
  let prefersDark = false;
  try { prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (error) { prefersDark = false; }
  return scheme === 'light' || scheme === 'dark' ? scheme : (prefersDark ? 'dark' : 'light');
}
const bind = function (name, onPress) {
  Array.prototype.forEach.call(document.querySelectorAll('button[data-' + name + ']'), function (button) { button.addEventListener('click', function () { onPress(button.getAttribute('data-' + name)); }); });
};
bind('mode', function (value) { state.mode = value; syncControls(); renderQuantities(); });
bind('scheme', function (value) { applyScheme(value, true); syncControls(); });
bind('level', function (value) { state.level = value; render(); });
bind('kind', function (value) { state.kind = value; render(); });
bind('unit', function (value) { state.unit = value; render(); });
bind('days', function (value) { setPreset(value); render(); });
['from', 'to'].forEach(function (id) { element(id).addEventListener('change', function () { state[id] = element(id).value; state.preset = ''; render(); }); });
element('projectSearch').addEventListener('input', renderProjects);
element('projectSearch').addEventListener('keydown', function (event) {
  const found = matchingProjects().folders;
  if (event.key === 'Enter' && found.length) { addProject(found[0]); }
  if (event.key === 'Escape') { element('projectSearch').value = ''; renderProjects(); }
});
element('projectAll').addEventListener('click', function () { state.chosen = null; render(); });
element('projectMatches').addEventListener('click', function (event) { const found = event.target.closest('[data-add]'); if (found) { addProject(found.getAttribute('data-add')); } });
element('projectChips').addEventListener('click', function (event) { const found = event.target.closest('[data-remove]'); if (found) { removeProject(found.getAttribute('data-remove')); } });
element('principles').addEventListener('click', function (event) { if (event.target.closest('[data-toggle-rows]')) { state.showAll = !state.showAll; renderPrinciples(current.total, current.list); } });
document.addEventListener('click', function (event) {
  const button = event.target.closest ? event.target.closest('.info') : null;
  Array.prototype.forEach.call(document.querySelectorAll('.infoWrap.open'), function (wrap) { if (!button || wrap !== button.parentNode) { wrap.classList.remove('open'); } });
  if (button) { button.parentNode.classList.toggle('open'); }
});
const updatedDay = /^\d{4}-\d\d-\d\d/.test(ledger.meta.updatedAt) ? dayLabel(ledger.meta.updatedAt.slice(0, 10)) : ledger.meta.updatedAt;
const dayCount = allDays().filter(function (day, index, days) { return day !== days[index - 1]; }).length;
element('updated').textContent = fill(texts.updated, { date: updatedDay });
element('footer').textContent = fill(texts.footer, { path: ledger.meta.path, updatedAt: updatedDay, projects: allFolders().length, days: dayCount });
element('legendGlobal').innerHTML = escapeHtml(texts.legendGlobal).replace('{mark}', globalMark());
applyScheme(startingScheme(), false);
setPreset('30');
render();
})();
`;

export function writeDashboard({ ledger, ledgerPath, filePath, texts = TEXTS }) {
  const data = { ...ledger, meta: { path: ledgerPath, updatedAt: ledger.updatedAt }, texts };
  const text = (key) => escapeText(texts[key]);
  const info = (key, side, labelKey) => infoMarkup(texts, key, side, labelKey);
  const choice = (name, value, key) => `<button data-${name}="${value}">${text(key)}</button>`;
  const group = (name, label, buttons, extra = '') => `<div class="seg${extra}" role="group" aria-label="${text(label)}">${buttons.map(([value, key]) => choice(name, value, key)).join('')}</div>`;
  const sunIcon = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const moonIcon = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 10.2A6 6 0 0 1 5.8 3a6 6 0 1 0 7.2 7.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${text('documentTitle')}</title><style>${STYLE}</style></head>
<body><div class="page">
<header>
<div class="titleRow"><h1>${text('title')}</h1><span id="updated"></span></div>
<div class="tools">
${group('mode', 'modeGroup', [['shares', 'modeShares'], ['numbers', 'modeNumbers']], ' small')}
<div class="seg small icons" role="group" aria-label="${text('themeGroup')}"><button data-scheme="light" aria-label="${text('themeLight')}">${sunIcon}</button><button data-scheme="dark" aria-label="${text('themeDark')}">${moonIcon}</button></div>
</div>
</header>
<section class="filters" aria-label="${text('filtersLabel')}">
<div class="card">
<div class="cardHead"><span class="eyebrow">${text('whatTitle')}</span>${info('infoWhat', 'left')}</div>
<div class="fields">
<div class="fieldRow"><span class="label">${text('projects')}</span><div class="projectField"><div class="projectBox"><span class="chips" id="projectChips"></span><input type="text" id="projectSearch" autocomplete="off" placeholder="${text('searchProjects')}" aria-label="${text('searchLabel')}"></div><div class="matches" id="projectMatches"></div></div><button class="plain" id="projectAll"></button></div>
<div class="fieldRow wide"><div class="pair"><span class="label">${text('principles')}</span>${group('level', 'principles', [['all', 'levelAll'], ['project', 'levelProject'], ['global', 'levelGlobal']])}</div><div class="pair"><span class="labelShort">${text('list')}</span>${group('kind', 'list', [['all', 'kindAll'], ['result', 'kindResult'], ['work', 'kindWork']])}</div></div>
</div>
</div>
<div class="card whenCard">
<div class="cardHead"><span class="eyebrow">${text('whenTitle')}</span>${info('infoWhen', 'right')}</div>
<div class="fields">
<div class="fieldRow"><span class="label">${text('period')}</span>${group('days', 'period', [['7', 'days7'], ['30', 'days30'], ['90', 'days90'], ['all', 'daysAll']], ' tight')}<label class="date">${text('from')} <input type="date" id="from"></label><label class="date">${text('to')} <input type="date" id="to"></label></div>
<div class="fieldRow"><span class="label">${text('stepsOf')}</span>${group('unit', 'unitGroup', [['day', 'unitDay'], ['week', 'unitWeek'], ['month', 'unitMonth']])}</div>
</div>
</div>
</section>
<section>
<div class="sectionHead"><div class="lead"><h2>${text('howMuchTitle')}</h2><span class="muted" id="subtitle"></span></div></div>
<div class="tiles3" id="tiles"></div>
<div class="habit" id="habit"></div>
</section>
<section class="card chartCard">
<div class="chartHead"><div class="rowHead"><h2 id="chartTitle"></h2>${info('infoChart', 'left', 'infoReading')}</div><div class="legend" id="legend"></div></div>
<div id="chart"></div>
<div class="hint" id="chartHint"></div>
</section>
<section>
<div class="sectionHead"><h2>${text('whereTitle')}</h2><span class="legendGlobal" id="legendGlobal"></span></div>
<div class="whereGrid">
<article class="card panel"><div class="rowHead"><h3>${text('tableTitle')}</h3>${info('infoTable', 'left', 'infoColumns')}</div><div id="principles"></div></article>
<div class="stack">
<article class="card panel"><div class="rowHead"><h3>${text('pairsTitle')}</h3>${info('infoPairs', 'left', 'infoCounts')}</div><div id="pairs"></div></article>
<article class="card panel"><div class="rowHead"><h3>${text('unknownTitle')}</h3>${info('infoUnknown', 'left', 'infoCounts')}</div><div id="unknown"></div></article>
</div>
</div>
</section>
<section class="way">
<div class="sectionHead"><div class="lead"><h2>${text('wayTitle')}</h2>${info('infoWayInUse', 'left')}</div><span class="faint">${text('wayNote')}</span></div>
<div class="wayTiles" id="wayTiles"></div>
</section>
<footer id="footer"></footer>
</div>
<script type="application/json" id="ledger">${serialized}</script>
<script>${CLIENT_SCRIPT}</script>
</body></html>
`;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page);
}
