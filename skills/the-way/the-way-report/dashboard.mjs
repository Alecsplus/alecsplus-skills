// Writes the self-contained dashboard.html from the whole ledger: inline CSS and JS, the data inside the page.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const STYLE = `
:root { --background:#fafaf7; --surface:#ffffff; --text:#1d2127; --muted:#6a7078; --line:#d9dcd6; --decided:#2a9d8f; --asked:#e9a23b; --ties:#7b6cd9; --against:#d64545; --neutral:#8a8f98; }
@media (prefers-color-scheme: dark) { :root { --background:#15171a; --surface:#1e2125; --text:#e6e8ea; --muted:#9aa0a8; --line:#383c42; } }
* { box-sizing:border-box; }
body { margin:0; background:var(--background); color:var(--text); font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
main { max-width:1100px; margin:0 auto; padding:16px; }
h1 { font-size:1.4rem; margin:0 0 12px; } h2 { font-size:1.1rem; margin:28px 0 10px; } h3 { font-size:.95rem; margin:14px 0 4px; color:var(--muted); font-weight:600; }
.controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
select, input, button { font:inherit; color:var(--text); background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:4px 8px; }
button.active { border-color:var(--decided); color:var(--decided); font-weight:600; }
.tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; }
.tile { background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
.tile .label { color:var(--muted); font-size:.8rem; } .tile .value { font-size:1.7rem; font-weight:650; } .tile .sub { color:var(--muted); font-size:.78rem; }
.panel { background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:8px 12px; }
svg.chart { width:100%; height:auto; display:block; } svg .grid { stroke:var(--line); stroke-dasharray:3 3; } svg .axis { stroke:var(--muted); } svg text.tick { fill:var(--muted); font-size:10px; }
.legend { display:flex; flex-wrap:wrap; gap:12px; font-size:.8rem; color:var(--muted); } .legend i { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px; }
.principle { display:grid; grid-template-columns:minmax(150px,1.1fr) 3fr 120px; gap:10px; align-items:center; padding:6px 0; border-top:1px solid var(--line); }
.principle:first-child { border-top:0; } .principle .name { font-weight:600; } .principle .position, .principle .projects { color:var(--muted); font-size:.78rem; font-weight:400; }
.silent { color:var(--muted); font-size:.75rem; border:1px solid var(--line); border-radius:10px; padding:0 6px; margin-left:4px; }
.bar { display:flex; align-items:center; gap:6px; font-size:.75rem; color:var(--muted); height:12px; margin:1px 0; } .bar span.fill { display:block; height:8px; border-radius:3px; min-width:1px; }
.columns { display:grid; grid-template-columns:1fr 1fr; gap:16px; } ul.plain { list-style:none; padding:0; margin:0; } ul.plain li { display:flex; justify-content:space-between; border-top:1px solid var(--line); padding:3px 0; }
.empty { color:var(--muted); padding:8px 0; } footer { color:var(--muted); font-size:.8rem; margin-top:30px; }
@media (max-width:600px) { .principle { grid-template-columns:1fr; } .columns { grid-template-columns:1fr; } }
`;

const CLIENT_SCRIPT = String.raw`
(function () {
const ledger = JSON.parse(document.getElementById('ledger').textContent);
const NOT_IN_A_FILE = 'not in a file';
const DAY = 86400000;
const COLORS = { decided: '#2a9d8f', asked: '#e9a23b', ties: '#7b6cd9', against: '#d64545', neutral: '#8a8f98' };
const PALETTE = ['#2a9d8f', '#e9a23b', '#7b6cd9', '#4f8fd6', '#c06c9c', '#6a994e'];
const WIDTH = 640, HEIGHT = 190, LEFT = 36, TOP = 10, RIGHT = 8, BOTTOM = 24;
const state = { project: '*', from: '', to: '', preset: '30' };
const element = function (id) { return document.getElementById(id); };
const isoDay = function (time) { return new Date(time).toISOString().slice(0, 10); };
const escapeHtml = function (text) { return String(text).replace(/[&<>"]/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]; }); };
const increase = function (counts, key, amount) { counts[key] = (counts[key] || 0) + amount; };
const percentage = function (part, whole) { return whole > 0 ? Math.round(100 * part / whole) + '%' : '—'; };
function weekStart(day) {
  const date = new Date(day + 'T00:00:00Z');
  return isoDay(date.getTime() - ((date.getUTCDay() + 6) % 7) * DAY);
}
function filesOf(folder) { return ledger.files[folder] || {}; }
function classify(key, folder) {
  const match = /^(.*?)_([a-z]+)$/.exec(key);
  const globalNames = (filesOf('*').global) || [];
  const projectNames = filesOf(folder).project || [];
  const isGlobal = Boolean(match) && globalNames.indexOf(match[1]) >= 0;
  const isProject = !match && projectNames.indexOf(key) >= 0;
  return { base: match ? match[1] : key, level: isGlobal ? 'global' : (isProject ? 'project' : NOT_IN_A_FILE) };
}
function selectedFolders() { return state.project === '*' ? Object.keys(ledger.projects) : [state.project]; }
function emptyWeek() { return { answers: 0, withLine: 0, closed: 0, asked: 0, recommended: 0, other: 0, open: 0, self: 0, skills: {} }; }
function rowOf(rows, level, base) {
  const id = level + ':' + base;
  rows[id] = rows[id] || { name: base, level: level, decided: 0, ties: 0, against: 0, weekly: {}, projects: {} };
  return rows[id];
}
function aggregate() {
  const total = { answers: 0, withLine: 0, asked: 0, closed: 0, grilling: { questions: 0, withRecommendation: 0, notDecided: 0, selfAnswered: 0, chosenRecommended: 0, chosenOther: 0 }, skills: {}, rows: {}, tiePairs: {}, together: {}, weeks: {} };
  selectedFolders().forEach(function (folder) {
    const projectName = ledger.projects[folder].name;
    Object.keys(ledger.projects[folder].days).forEach(function (day) {
      const facts = ledger.projects[folder].days[day];
      if (day >= state.from && day <= state.to) {
        const week = weekStart(day);
        total.weeks[week] = total.weeks[week] || emptyWeek();
        const weekEntry = total.weeks[week];
        total.answers += facts.answers; total.withLine += facts.withLine; total.asked += facts.questionsAsked;
        weekEntry.answers += facts.answers; weekEntry.withLine += facts.withLine; weekEntry.asked += facts.questionsAsked;
        Object.keys(total.grilling).forEach(function (field) { total.grilling[field] += facts.grilling[field]; });
        weekEntry.recommended += facts.grilling.chosenRecommended; weekEntry.other += facts.grilling.chosenOther;
        weekEntry.open += facts.grilling.notDecided; weekEntry.self += facts.grilling.selfAnswered;
        Object.keys(facts.skills).forEach(function (skill) { increase(total.skills, skill, facts.skills[skill]); increase(weekEntry.skills, skill, facts.skills[skill]); });
        Object.keys(facts.tiePairs).forEach(function (pair) { increase(total.tiePairs, pair, facts.tiePairs[pair]); });
        Object.keys(facts.together).forEach(function (pair) { increase(total.together, pair, facts.together[pair]); });
        ['decided', 'ties', 'against'].forEach(function (field) {
          Object.keys(facts[field]).forEach(function (key) {
            const found = classify(key, folder);
            const row = rowOf(total.rows, found.level, found.base);
            row[field] += facts[field][key];
            if (field === 'decided') {
              increase(row.weekly, week, facts.decided[key]);
              increase(row.projects, projectName, facts.decided[key]);
              total.closed += found.level === NOT_IN_A_FILE ? 0 : facts.decided[key];
              weekEntry.closed += found.level === NOT_IN_A_FILE ? 0 : facts.decided[key];
            }
          });
        });
      }
    });
  });
  const isAll = state.project === '*';
  const files = filesOf(state.project);
  (isAll ? [] : (files.project || [])).forEach(function (name, index) { rowOf(total.rows, 'project', name).position = index + 1; });
  ((filesOf('*').global) || []).forEach(function (name, index) { rowOf(total.rows, 'global', name).position = index + 1; });
  return total;
}
function weeksBetween() {
  const list = [];
  for (let time = Date.parse(weekStart(state.from) + 'T00:00:00Z'); time <= Date.parse(state.to + 'T00:00:00Z') && list.length < 300; time += 7 * DAY) { list.push(isoDay(time)); }
  return list;
}
function frame(weekList, maximum, label, suffix) {
  const innerHeight = HEIGHT - TOP - BOTTOM;
  const innerWidth = WIDTH - LEFT - RIGHT;
  const step = Math.ceil(weekList.length / 8) || 1;
  let html = '<svg class="chart" viewBox="0 0 ' + WIDTH + ' ' + HEIGHT + '" role="img" aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) + '</title>';
  html += '<line class="grid" x1="' + LEFT + '" x2="' + (WIDTH - RIGHT) + '" y1="' + TOP + '" y2="' + TOP + '"/>';
  html += '<line class="axis" x1="' + LEFT + '" x2="' + (WIDTH - RIGHT) + '" y1="' + (TOP + innerHeight) + '" y2="' + (TOP + innerHeight) + '"/>';
  html += '<text class="tick" x="' + (LEFT - 4) + '" y="' + (TOP + 4) + '" text-anchor="end">' + maximum + suffix + '</text>';
  html += '<text class="tick" x="' + (LEFT - 4) + '" y="' + (TOP + innerHeight + 4) + '" text-anchor="end">0</text>';
  weekList.forEach(function (week, index) {
    if (index % step === 0) { html += '<text class="tick" x="' + (LEFT + (index + 0.5) * innerWidth / weekList.length) + '" y="' + (HEIGHT - 8) + '" text-anchor="middle">' + week.slice(5) + '</text>'; }
  });
  return { html: html, innerHeight: innerHeight, innerWidth: innerWidth };
}
function legend(series) {
  return '<div class="legend">' + series.map(function (entry) { return '<span><i style="background:' + entry.color + '"></i>' + escapeHtml(entry.label) + '</span>'; }).join('') + '</div>';
}
function barChart(weekList, series, stacked, label) {
  let maximum = 0;
  weekList.forEach(function (week) {
    const values = series.map(function (entry) { return entry.values[week] || 0; });
    maximum = Math.max(maximum, stacked ? values.reduce(function (sum, value) { return sum + value; }, 0) : Math.max.apply(null, values));
  });
  const drawing = frame(weekList, Math.max(maximum, 1), label, '');
  const slot = drawing.innerWidth / (weekList.length || 1);
  let html = drawing.html;
  weekList.forEach(function (week, index) {
    const groupWidth = slot * 0.76;
    const groupX = LEFT + index * slot + (slot - groupWidth) / 2;
    let stackedHeight = 0;
    series.forEach(function (entry, seriesIndex) {
      const value = entry.values[week] || 0;
      const barHeight = drawing.innerHeight * value / Math.max(maximum, 1);
      const barWidth = stacked ? groupWidth : groupWidth / series.length;
      const x = stacked ? groupX : groupX + seriesIndex * barWidth;
      const y = TOP + drawing.innerHeight - barHeight - (stacked ? stackedHeight : 0);
      stackedHeight += stacked ? barHeight : 0;
      if (value > 0) { html += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(barWidth - 1, 1).toFixed(1) + '" height="' + barHeight.toFixed(1) + '" fill="' + entry.color + '"><title>' + week + ' · ' + escapeHtml(entry.label) + ': ' + value + '</title></rect>'; }
    });
  });
  return maximum > 0 ? html + '</svg>' + legend(series) : '<div class="empty">No data in this range.</div>';
}
function lineChart(weekList, values, label) {
  const drawing = frame(weekList, 100, label, '%');
  const slot = drawing.innerWidth / (weekList.length || 1);
  const points = weekList.map(function (week, index) { return { x: LEFT + (index + 0.5) * slot, y: TOP + drawing.innerHeight * (1 - (values[week] || 0) / 100), week: week, value: values[week] || 0 }; });
  let html = drawing.html + '<polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="2" points="' + points.map(function (point) { return point.x.toFixed(1) + ',' + point.y.toFixed(1); }).join(' ') + '"/>';
  points.forEach(function (point) { html += '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="3" fill="' + COLORS.decided + '"><title>' + point.week + ': ' + point.value + '%</title></circle>'; });
  return html + '</svg>';
}
function sparkline(weekList, weekly) {
  const values = weekList.map(function (week) { return weekly[week] || 0; });
  const maximum = Math.max.apply(null, values.concat([1]));
  const points = values.map(function (value, index) { return (weekList.length > 1 ? 100 * index / (weekList.length - 1) : 50).toFixed(1) + ',' + (22 - 20 * value / maximum).toFixed(1); }).join(' ');
  return '<svg viewBox="0 0 100 24" preserveAspectRatio="none" width="110" height="24" role="img" aria-label="decisions per week"><polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="1.5" points="' + points + '"/></svg>';
}
function tile(label, value, sub) {
  return '<div class="tile"><div class="label">' + escapeHtml(label) + '</div><div class="value">' + value + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
}
function sortedEntries(counts) {
  return Object.keys(counts).map(function (key) { return [key, counts[key]]; }).sort(function (left, right) { return (right[1] - left[1]) || left[0].localeCompare(right[0]); });
}
function renderTiles(total) {
  const grilling = total.grilling;
  element('tiles').innerHTML = tile('Answers', total.answers, '')
    + tile('With the Principles line', total.withLine, percentage(total.withLine, total.answers))
    + tile('Choices closed by the principles', total.closed, 'questions saved')
    + tile('Questions asked to you', total.asked, '')
    + tile('Grilling questions', grilling.questions, 'recommended chosen ' + grilling.chosenRecommended + ' · other ' + grilling.chosenOther + '<br>left open ' + grilling.notDecided + ' · answered by themselves ' + grilling.selfAnswered);
}
function renderOverTime(total, weekList) {
  const shares = {}, decided = {}, asked = {};
  weekList.forEach(function (week) {
    const entry = total.weeks[week] || emptyWeek();
    shares[week] = entry.answers > 0 ? Math.round(100 * entry.withLine / entry.answers) : 0;
    decided[week] = entry.closed; asked[week] = entry.asked;
  });
  element('overtime').innerHTML = '<h3>Answers with the Principles line, per week</h3>' + lineChart(weekList, shares, 'Share of answers with the Principles line, per week')
    + '<h3>Choices decided by the principles and questions asked to you, per week</h3>'
    + barChart(weekList, [{ label: 'decided', color: COLORS.decided, values: decided }, { label: 'asked', color: COLORS.asked, values: asked }], false, 'Decided and asked per week');
}
function principleRow(row, weekList, maximum, showsProjects) {
  const isSilent = row.level !== NOT_IN_A_FILE && row.decided + row.ties + row.against === 0;
  const bar = function (label, value, color) { return '<div class="bar"><span class="fill" style="width:' + Math.round(100 * value / maximum) * 0.8 + '%;background:' + color + '"></span>' + label + ' ' + value + '</div>'; };
  const projects = showsProjects ? '<div class="projects">' + sortedEntries(row.projects).map(function (pair) { return escapeHtml(pair[0]) + ' ' + pair[1]; }).join(', ') + '</div>' : '';
  return '<div class="principle"><div class="name">' + escapeHtml(row.name) + (row.position ? ' <span class="position">#' + row.position + '</span>' : '') + (isSilent ? '<span class="silent">silent</span>' : '') + (row.level === NOT_IN_A_FILE ? '<span class="silent">' + NOT_IN_A_FILE + '</span>' : '') + projects + '</div>'
    + '<div>' + bar('decided', row.decided, COLORS.decided) + bar('ties', row.ties, COLORS.ties) + bar('against', row.against, COLORS.against) + '</div>'
    + '<div>' + sparkline(weekList, row.weekly) + '</div></div>';
}
function renderPrinciples(total, weekList) {
  const rows = Object.keys(total.rows).map(function (id) { return total.rows[id]; });
  const maximum = Math.max.apply(null, rows.map(function (row) { return Math.max(row.decided, row.ties, row.against); }).concat([1]));
  const byDecisions = function (left, right) { return (right.decided - left.decided) || ((left.position || 999) - (right.position || 999)) || left.name.localeCompare(right.name); };
  const section = function (title, list, showsProjects) {
    return '<h3>' + title + '</h3>' + (list.length ? list.map(function (row) { return principleRow(row, weekList, maximum, showsProjects); }).join('') : '<div class="empty">None.</div>');
  };
  const globals = rows.filter(function (row) { return row.level === 'global'; }).sort(byDecisions);
  const outside = rows.filter(function (row) { return row.level === NOT_IN_A_FILE; }).sort(byDecisions);
  const own = rows.filter(function (row) { return row.level === 'project'; }).sort(byDecisions);
  element('principles').innerHTML = state.project === '*'
    ? section('Global principles, with the projects that cited them', globals, true)
    : section('This project\'s principles', own, false) + section('Global principles, as used here', globals.concat(outside.map(function (row) { return Object.assign({ label: NOT_IN_A_FILE }, row); })), false);
}
function pairLabels(counts, separator) {
  const isAll = state.project === '*';
  const result = {};
  Object.keys(counts).forEach(function (pair) {
    const keys = pair.split(separator);
    const parsed = keys.map(function (key) { return /^(.*?)_([a-z]+)$/.exec(key); });
    const isEveryGlobal = parsed.every(function (match) { return Boolean(match); });
    const label = keys.map(function (key, index) { return parsed[index] ? parsed[index][1] + (isAll ? '' : ' (global)') : key; }).join(separator);
    if (!isAll || isEveryGlobal) { increase(result, label, counts[pair]); }
  });
  return result;
}
function renderPairs(total) {
  const list = function (counts, separator) {
    const entries = sortedEntries(pairLabels(counts, separator)).slice(0, 8);
    return entries.length ? '<ul class="plain">' + entries.map(function (pair) { return '<li><span>' + escapeHtml(pair[0]) + '</span><b>' + pair[1] + '</b></li>'; }).join('') + '</ul>' : '<div class="empty">None.</div>';
  };
  element('pairs').innerHTML = '<div class="columns"><div><h3>Ties: pairs the principles could not separate</h3>' + list(total.tiePairs, ' × ') + '</div><div><h3>Together: names cited on the same line</h3>' + list(total.together, ' + ') + '</div></div>';
}
function renderGrilling(total, weekList) {
  const pick = function (field) { const values = {}; weekList.forEach(function (week) { values[week] = (total.weeks[week] || emptyWeek())[field]; }); return values; };
  element('grilling').innerHTML = barChart(weekList, [
    { label: 'recommended chosen', color: COLORS.decided, values: pick('recommended') }, { label: 'other chosen', color: COLORS.asked, values: pick('other') },
    { label: 'left open', color: COLORS.ties, values: pick('open') }, { label: 'answered by themselves', color: COLORS.neutral, values: pick('self') }], true, 'Grilling questions per week');
}
function renderWayInUse(total, weekList) {
  const series = [
    { label: 'grilling with the principles', skill: 'alecsplus-skills:the-way-grilling', color: COLORS.decided },
    { label: 'grilling without', skill: 'mattpocock-skills:grilling', color: COLORS.asked },
    { label: 'questions closed with self-answer', skill: 'alecsplus-skills:the-way-self-answer', color: COLORS.neutral }
  ].map(function (entry) {
    const values = {};
    weekList.forEach(function (week) { values[week] = (total.weeks[week] || emptyWeek()).skills[entry.skill] || 0; });
    return { label: entry.label, color: entry.color, values: values };
  });
  const written = (total.skills['alecsplus-skills:the-way-new'] || 0) + (total.skills['alecsplus-skills:the-way-global-new'] || 0);
  element('wayinuse').innerHTML = barChart(weekList, series, false, 'The way in use per week') + '<div class="sub">Principles written: ' + written + '</div>';
}
function render() {
  const total = aggregate();
  const weekList = weeksBetween();
  renderTiles(total); renderOverTime(total, weekList); renderPrinciples(total, weekList); renderPairs(total); renderGrilling(total, weekList); renderWayInUse(total, weekList);
  Array.prototype.forEach.call(document.querySelectorAll('button[data-days]'), function (button) { button.className = button.getAttribute('data-days') === state.preset ? 'active' : ''; });
}
function allDays() {
  const days = [];
  Object.keys(ledger.projects).forEach(function (folder) { Object.keys(ledger.projects[folder].days).forEach(function (day) { days.push(day); }); });
  return days.sort();
}
function setPreset(preset) {
  const today = isoDay(Date.now());
  const days = allDays();
  state.preset = preset; state.to = today;
  state.from = preset === 'all' ? (days[0] || today) : isoDay(Date.now() - (Number(preset) - 1) * DAY);
  element('from').value = state.from; element('to').value = state.to;
}
const select = element('project');
const answersOf = function (folder) { return Object.keys(ledger.projects[folder].days).reduce(function (sum, day) { return sum + ledger.projects[folder].days[day].answers; }, 0); };
const folderOrder = Object.keys(ledger.projects).sort(function (left, right) { return (answersOf(right) - answersOf(left)) || ledger.projects[left].name.localeCompare(ledger.projects[right].name); });
select.innerHTML = '<option value="*">All projects</option>' + folderOrder.map(function (folder) { return '<option value="' + escapeHtml(folder) + '">' + escapeHtml(ledger.projects[folder].name) + ' (' + answersOf(folder) + ')</option>'; }).join('');
select.addEventListener('change', function () { state.project = select.value; render(); });
['from', 'to'].forEach(function (id) { element(id).addEventListener('change', function () { state[id] = element(id).value; state.preset = ''; render(); }); });
Array.prototype.forEach.call(document.querySelectorAll('button[data-days]'), function (button) { button.addEventListener('click', function () { setPreset(button.getAttribute('data-days')); render(); }); });
const dayCount = Object.keys(ledger.projects).reduce(function (sum, folder) { return sum + Object.keys(ledger.projects[folder].days).length; }, 0);
element('footer').textContent = 'Ledger: ' + ledger.meta.path + ', updated ' + ledger.meta.updatedAt + ', ' + Object.keys(ledger.projects).length + ' projects, ' + dayCount + ' days';
setPreset('30');
render();
})();
`;

export function writeDashboard({ ledger, ledgerPath, filePath }) {
  const data = { ...ledger, meta: { path: ledgerPath, updatedAt: ledger.updatedAt } };
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The way: report</title><style>${STYLE}</style></head>
<body><main>
<h1>The way: report</h1>
<div class="controls">
<label>Project <select id="project"></select></label>
<label>From <input type="date" id="from"></label><label>to <input type="date" id="to"></label>
<button data-days="7">7d</button><button data-days="30">30d</button><button data-days="90">90d</button><button data-days="all">all</button>
</div>
<h2>Tiles</h2><div class="tiles" id="tiles"></div>
<h2>Over time</h2><div class="panel" id="overtime"></div>
<h2>Principles</h2><div class="panel" id="principles"></div>
<h2>Pairs</h2><div class="panel" id="pairs"></div>
<h2>Grilling over time</h2><div class="panel" id="grilling"></div>
<h2>The way in use</h2><div class="panel" id="wayinuse"></div>
<footer id="footer"></footer>
</main>
<script type="application/json" id="ledger">${serialized}</script>
<script>${CLIENT_SCRIPT}</script>
</body></html>
`;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page);
}
