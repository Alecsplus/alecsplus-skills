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
  title: 'The way: report',
  searchProjects: 'Search projects',
  projectButton: 'Projects: {chosen} of {total} chosen',
  projectsHeading: 'Projects, with the answers in the chosen period',
  answersCount: '{n} answers',
  noProjectMatches: 'No project matches.',
  allProjects: 'All projects',
  from: 'From',
  to: 'to',
  days7: '7d',
  days30: '30d',
  days90: '90d',
  daysAll: 'all',
  unitDay: 'Day',
  unitWeek: 'Week',
  unitMonth: 'Month',
  monthNames: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec',
  filterShow: 'Show',
  filterPrinciples: 'Principles',
  filterList: 'List',
  filterUnit: 'Unit',
  filterPeriod: 'Period',
  scopeChat: 'Chat',
  scopeGrilling: 'Grilling',
  scopeBoth: 'Both',
  levelProject: 'Of the project',
  levelGlobal: 'Global',
  projectsOwn: 'Principles of each project, together',
  kindAll: 'All',
  kindResult: 'Result',
  kindWork: 'Work',
  partChat: 'Chat',
  partGrilling: 'Grilling and questions',
  sectionOverTime: 'Over time',
  sectionPrinciples: 'Principles',
  sectionPairs: 'When the principles did not decide',
  sectionGrilling: 'Grilling over time',
  sectionWayInUse: 'The way in use',
  tileAnswers: 'Answers',
  tileWithLine: 'With the Principles line',
  tileClosed: 'Choices closed by the principles',
  tileSaved: 'questions saved',
  tileAsked: 'Questions asked to you',
  tileGrilling: 'Grilling questions',
  tileGrillingDetail: 'recommended chosen {recommended} · other {other}<br>left open {open} · answered by themselves {self}',
  shareTitle: 'Answers with the Principles line, per {unit}',
  shareLabel: 'Share of answers with the Principles line, per {unit}',
  decidedAskedTitle: 'Choices decided by the principles and questions asked to you, per {unit}',
  decidedAskedLabel: 'Decided and asked per {unit}',
  explainAnswers: 'You see the messages that ended my turn.',
  explainWithLine: 'You see how many of them have the "Principles:" line on top.',
  explainClosed: 'You see the choices the principles decided on their own, without asking you.',
  explainAsked: 'You see the answers that ended with a question to you.',
  explainGrillingTile: 'You see the ❓ questions asked in the grilling, and how they ended.',
  explainShare: 'You see, for each {unit}, the share of my answers that had the "Principles:" line on top: 100% means all of them.',
  explainDecidedAsked: 'You see, for each {unit}, two bars: how many choices the principles closed alone and how many questions I asked you.',
  explainGrillingChart: 'You see, for each {unit}, one stacked bar: its colours are how the grilling questions ended.',
  explainWayInUse: 'You see, for each {unit}, how many times each way of working was used.',
  explainRecommended: 'You see the questions where you took the answer I recommended.',
  explainOther: 'You see the questions where you chose a different answer.',
  explainLeftOpen: 'You see the questions that got no answer yet.',
  explainSelfAnswered: 'You see the questions I closed myself with the principles, without asking you.',
  explainGrillingWith: 'You see the grilling runs done with the principles.',
  explainGrillingWithout: 'You see the grilling runs done without the principles.',
  explainSelfAnswer: 'You see the questions closed with the self-answer.',
  explainColumns: 'You see one row per principle. Decided: times the principle decided. Ties: times it was one of the two pulling in opposite directions. Against: times I chose against it and said so. #n: its line in the file.',
  explainTrend: 'The small line on the right is how often it decided, per {unit}.',
  explainPairs: 'You see the pairs of principles that pulled in opposite directions when I wrote that they did not decide, and how many times each pair came up.',
  legendShare: 'Answers with the Principles line',
  legendDecided: 'Choices closed by the principles',
  legendAsked: 'Questions asked to you',
  axisShare: 'share of answers (%)',
  axisChoices: 'number of choices or questions',
  axisQuestions: 'number of grilling questions',
  axisRuns: 'number of times',
  grillingTitle: 'How the grilling questions ended, per {unit}',
  wayInUseTitle: 'How the way was used, per {unit}',
  decided: 'decided',
  asked: 'asked',
  ties: 'ties',
  against: 'against',
  silent: 'silent',
  notInAFile: 'not in a file',
  none: 'None.',
  noData: 'No data in this range.',
  globalWithProjects: 'Global principles, with the projects that cited them',
  ownPrinciples: 'This project\'s principles',
  globalAsUsed: 'Global principles, as used here',
  decisionsPerUnit: 'decisions per {unit}',
  tiesTitle: 'The two principles that pulled in opposite directions, and how many times',
  globalSuffix: ' (global)',
  recommendedChosen: 'recommended chosen',
  otherChosen: 'other chosen',
  leftOpen: 'left open',
  answeredByThemselves: 'answered by themselves',
  grillingLabel: 'Grilling questions per {unit}',
  grillingWith: 'grilling with the principles',
  grillingWithout: 'grilling without',
  selfAnswer: 'questions closed with self-answer',
  wayInUseLabel: 'The way in use per {unit}',
  principlesWritten: 'the-way-new runs (a principle proposed): {n}',
  footer: 'Ledger: {path}, updated {updatedAt}, {projects} projects, {days} days'
};

const escapeText = (text) => String(text).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));

const STYLE = `
:root { --background:#fafaf7; --surface:#ffffff; --text:#1d2127; --muted:#6a7078; --line:#d9dcd6; --decided:#2a9d8f; --asked:#e9a23b; --ties:#7b6cd9; --against:#d64545; --neutral:#8a8f98; }
@media (prefers-color-scheme: dark) { :root { --background:#15171a; --surface:#1e2125; --text:#e6e8ea; --muted:#9aa0a8; --line:#383c42; } }
* { box-sizing:border-box; }
body { margin:0; background:var(--background); color:var(--text); font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
main { max-width:1400px; margin:0 auto; padding:16px; }
.filterBar { display:flex; flex-wrap:wrap; gap:8px 22px; padding:8px 12px; margin-bottom:16px; background:var(--surface); border:1px solid var(--line); border-radius:8px; }
.group { display:flex; flex-wrap:wrap; gap:6px; align-items:center; } .groupLabel { color:var(--muted); font-size:.8rem; font-weight:600; margin-right:2px; }
.layout { display:grid; grid-template-columns:240px minmax(0,1fr); gap:20px; align-items:start; }
aside { position:sticky; top:12px; max-height:calc(100vh - 24px); display:flex; flex-direction:column; gap:8px; }
#projectSearch { width:100%; } #projectList { overflow-y:auto; display:flex; flex-direction:column; gap:2px; }
#projectToggle { display:none; width:100%; text-align:left; }
.projectRow { display:block; width:100%; text-align:left; border:1px solid transparent; border-radius:6px; padding:5px 8px; cursor:pointer; }
.projectRow .line { display:flex; justify-content:space-between; gap:8px; } .projectRow .count { color:var(--muted); font-size:.8rem; }
.projectRow .share { display:block; height:4px; border-radius:2px; background:var(--decided); opacity:.5; margin-top:3px; min-width:1px; }
.projectRow.selected { border-color:var(--decided); background:var(--surface); }
@media (max-width:800px) { .layout { grid-template-columns:1fr; } aside { position:static; max-height:none; } #projectToggle { display:block; } #projectPanel { display:none; } #projectPanel.open { display:flex; flex-direction:column; gap:8px; } #projectList { max-height:50vh; } }
h1 { font-size:1.4rem; margin:0 0 12px; } h2.part { font-size:1.3rem; margin:36px 0 4px; padding-top:10px; border-top:2px solid var(--line); } h3.section { font-size:1.05rem; margin:24px 0 10px; color:var(--text); } h3 { font-size:.95rem; margin:14px 0 4px; color:var(--muted); font-weight:600; }
.controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
select, input, button { font:inherit; color:var(--text); background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:4px 8px; }
button.active { border-color:var(--decided); color:var(--decided); font-weight:600; }
.tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; }
.tile { background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
.tile .label { color:var(--muted); font-size:.8rem; } .tile .value { font-size:1.7rem; font-weight:650; } .tile .sub { color:var(--muted); font-size:.78rem; }
.panel { background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:8px 12px; }
svg.chart { width:100%; height:auto; display:block; } svg .grid { stroke:var(--line); stroke-dasharray:3 3; } svg .axis { stroke:var(--muted); } svg text.tick { fill:var(--muted); font-size:10px; }
.explain { color:var(--muted); font-size:.82rem; margin:2px 0 6px; } .axisLabel { color:var(--muted); font-size:.78rem; margin-top:6px; }
.legend { list-style:none; padding:0; margin:6px 0; display:flex; flex-direction:column; gap:3px; font-size:.82rem; color:var(--muted); } .legend b { color:var(--text); font-weight:600; } .legend i { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px; }
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
const texts = ledger.texts;
const fill = function (template, values) { return template.replace(/\{(\w+)\}/g, function (placeholder, key) { return String(values[key]); }); };
const NOT_IN_A_FILE = 'not in a file';
const DAY = 86400000;
const COLORS = { decided: '#2a9d8f', asked: '#e9a23b', ties: '#7b6cd9', against: '#d64545', neutral: '#8a8f98' };
const PALETTE = ['#2a9d8f', '#e9a23b', '#7b6cd9', '#4f8fd6', '#c06c9c', '#6a994e'];
const WIDTH = 640, HEIGHT = 190, LEFT = 36, TOP = 10, RIGHT = 8, BOTTOM = 24;
const CHOICE_GROUPS = ['scope', 'level', 'kind', 'unit'];
const state = { unselected: {}, from: '', to: '', preset: '30', kind: 'all', unit: 'week', scope: 'both', level: 'all' };
const element = function (id) { return document.getElementById(id); };
const isoDay = function (time) { return new Date(time).toISOString().slice(0, 10); };
const escapeHtml = function (text) { return String(text).replace(/[&<>"]/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]; }); };
const increase = function (counts, key, amount) { counts[key] = (counts[key] || 0) + amount; };
const percentage = function (part, whole) { return whole > 0 ? Math.round(100 * part / whole) + '%' : '—'; };
function bucketStart(day) {
  const date = new Date(day + 'T00:00:00Z');
  const weekDay = isoDay(date.getTime() - ((date.getUTCDay() + 6) % 7) * DAY);
  return state.unit === 'day' ? day : (state.unit === 'month' ? day.slice(0, 7) + '-01' : weekDay);
}
function bucketLabel(key) {
  const monthNames = texts.monthNames.split(' ');
  const monthName = monthNames[Number(key.slice(5, 7)) - 1];
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
function selectedFolders() { return Object.keys(ledger.projects).filter(function (folder) { return !state.unselected[folder]; }); }
function isAllSelected() { return selectedFolders().length === Object.keys(ledger.projects).length; }
function emptyBucket() { return { answers: 0, withLine: 0, closed: 0, asked: 0, recommended: 0, other: 0, open: 0, self: 0, skills: {} }; }
function rowOf(rows, level, base) {
  const id = level + ':' + base;
  rows[id] = rows[id] || { name: base, level: level, decided: 0, ties: 0, against: 0, perBucket: {}, projects: {} };
  return rows[id];
}
function aggregate() {
  const total = { answers: 0, withLine: 0, asked: 0, closed: 0, grilling: { questions: 0, withRecommendation: 0, notDecided: 0, selfAnswered: 0, chosenRecommended: 0, chosenOther: 0 }, skills: {}, rows: {}, tiePairs: {}, buckets: {} };
  selectedFolders().forEach(function (folder) {
    const projectName = ledger.projects[folder].name;
    Object.keys(ledger.projects[folder].days).forEach(function (day) {
      const facts = ledger.projects[folder].days[day];
      if (day >= state.from && day <= state.to) {
        const bucket = bucketStart(day);
        total.buckets[bucket] = total.buckets[bucket] || emptyBucket();
        const bucketEntry = total.buckets[bucket];
        total.answers += facts.answers; total.withLine += facts.withLine; total.asked += facts.questionsAsked;
        bucketEntry.answers += facts.answers; bucketEntry.withLine += facts.withLine; bucketEntry.asked += facts.questionsAsked;
        Object.keys(total.grilling).forEach(function (field) { total.grilling[field] += facts.grilling[field]; });
        bucketEntry.recommended += facts.grilling.chosenRecommended; bucketEntry.other += facts.grilling.chosenOther;
        bucketEntry.open += facts.grilling.notDecided; bucketEntry.self += facts.grilling.selfAnswered;
        Object.keys(facts.skills).forEach(function (skill) { increase(total.skills, skill, facts.skills[skill]); increase(bucketEntry.skills, skill, facts.skills[skill]); });
        Object.keys(facts.tiePairs).forEach(function (pair) {
          const fits = pair.split(' × ').every(function (key) { return passes(classify(key, folder), folder); });
          if (fits) { increase(total.tiePairs, pair, facts.tiePairs[pair]); }
        });
        ['decided', 'ties', 'against'].forEach(function (field) {
          Object.keys(facts[field]).forEach(function (key) {
            const found = classify(key, folder);
            const row = passes(found, folder) ? rowOf(total.rows, found.level, found.base) : null;
            if (row) { row[field] += facts[field][key]; }
            if (row && field === 'decided') {
              increase(row.perBucket, bucket, facts.decided[key]);
              increase(row.projects, projectName, facts.decided[key]);
              total.closed += found.level === NOT_IN_A_FILE ? 0 : facts.decided[key];
              bucketEntry.closed += found.level === NOT_IN_A_FILE ? 0 : facts.decided[key];
            }
          });
        });
      }
    });
  });
  const chosen = selectedFolders();
  const onlyFolder = chosen.length === 1 ? chosen[0] : '';
  (onlyFolder ? (filesOf(onlyFolder).project || []) : []).forEach(function (name, index) { if (passes({ base: name, level: 'project' }, onlyFolder)) { rowOf(total.rows, 'project', name).position = index + 1; } });
  ((filesOf('*').global) || []).forEach(function (name, index) { if (passes({ base: name, level: 'global' }, onlyFolder)) { rowOf(total.rows, 'global', name).position = index + 1; } });
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
function frame(bucketList, maximum, label, suffix) {
  const innerHeight = HEIGHT - TOP - BOTTOM;
  const innerWidth = WIDTH - LEFT - RIGHT;
  const step = Math.ceil(bucketList.length / 8) || 1;
  let html = '<svg class="chart" viewBox="0 0 ' + WIDTH + ' ' + HEIGHT + '" role="img" aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) + '</title>';
  html += '<line class="grid" x1="' + LEFT + '" x2="' + (WIDTH - RIGHT) + '" y1="' + TOP + '" y2="' + TOP + '"/>';
  html += '<line class="axis" x1="' + LEFT + '" x2="' + (WIDTH - RIGHT) + '" y1="' + (TOP + innerHeight) + '" y2="' + (TOP + innerHeight) + '"/>';
  html += '<text class="tick" x="' + (LEFT - 4) + '" y="' + (TOP + 4) + '" text-anchor="end">' + maximum + suffix + '</text>';
  html += '<text class="tick" x="' + (LEFT - 4) + '" y="' + (TOP + innerHeight + 4) + '" text-anchor="end">0</text>';
  bucketList.forEach(function (bucket, index) {
    if (index % step === 0) { html += '<text class="tick" x="' + (LEFT + (index + 0.5) * innerWidth / bucketList.length) + '" y="' + (HEIGHT - 8) + '" text-anchor="middle">' + bucketLabel(bucket) + '</text>'; }
  });
  return { html: html, innerHeight: innerHeight, innerWidth: innerWidth };
}
function legend(series) {
  return '<ul class="legend">' + series.map(function (entry) { return '<li><i style="background:' + entry.color + '"></i><b>' + escapeHtml(entry.label) + '</b>' + (entry.explain ? ' ' + escapeHtml(entry.explain) : '') + '</li>'; }).join('') + '</ul>';
}
function chartBlock(title, explanation, axisLabel, chartHtml) {
  return '<h3>' + escapeHtml(title) + '</h3><div class="explain">' + escapeHtml(explanation) + '</div><div class="axisLabel">↑ ' + escapeHtml(axisLabel) + '</div>' + chartHtml;
}
function barChart(bucketList, series, stacked, label) {
  let maximum = 0;
  bucketList.forEach(function (bucket) {
    const values = series.map(function (entry) { return entry.values[bucket] || 0; });
    maximum = Math.max(maximum, stacked ? values.reduce(function (sum, value) { return sum + value; }, 0) : Math.max.apply(null, values));
  });
  const drawing = frame(bucketList, Math.max(maximum, 1), label, '');
  const slot = drawing.innerWidth / (bucketList.length || 1);
  let html = drawing.html;
  bucketList.forEach(function (bucket, index) {
    const groupWidth = slot * 0.76;
    const groupX = LEFT + index * slot + (slot - groupWidth) / 2;
    let stackedHeight = 0;
    series.forEach(function (entry, seriesIndex) {
      const value = entry.values[bucket] || 0;
      const barHeight = drawing.innerHeight * value / Math.max(maximum, 1);
      const barWidth = stacked ? groupWidth : groupWidth / series.length;
      const x = stacked ? groupX : groupX + seriesIndex * barWidth;
      const y = TOP + drawing.innerHeight - barHeight - (stacked ? stackedHeight : 0);
      stackedHeight += stacked ? barHeight : 0;
      if (value > 0) { html += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(barWidth - 1, 1).toFixed(1) + '" height="' + barHeight.toFixed(1) + '" fill="' + entry.color + '"><title>' + bucketLabel(bucket) + ' · ' + escapeHtml(entry.label) + ': ' + value + '</title></rect>'; }
    });
  });
  return maximum > 0 ? html + '</svg>' + legend(series) : '<div class="empty">' + escapeHtml(texts.noData) + '</div>';
}
function lineChart(bucketList, values, label, series) {
  const drawing = frame(bucketList, 100, label, '%');
  const slot = drawing.innerWidth / (bucketList.length || 1);
  const points = bucketList.map(function (bucket, index) { return { x: LEFT + (index + 0.5) * slot, y: TOP + drawing.innerHeight * (1 - (values[bucket] || 0) / 100), bucket: bucket, value: values[bucket] || 0 }; });
  let html = drawing.html + '<polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="2" points="' + points.map(function (point) { return point.x.toFixed(1) + ',' + point.y.toFixed(1); }).join(' ') + '"/>';
  points.forEach(function (point) { html += '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="3" fill="' + COLORS.decided + '"><title>' + bucketLabel(point.bucket) + ': ' + point.value + '%</title></circle>'; });
  return html + '</svg>' + legend(series);
}
function sparkline(bucketList, perBucket) {
  const values = bucketList.map(function (bucket) { return perBucket[bucket] || 0; });
  const maximum = Math.max.apply(null, values.concat([1]));
  const points = values.map(function (value, index) { return (bucketList.length > 1 ? 100 * index / (bucketList.length - 1) : 50).toFixed(1) + ',' + (22 - 20 * value / maximum).toFixed(1); }).join(' ');
  return '<svg viewBox="0 0 100 24" preserveAspectRatio="none" width="110" height="24" role="img" aria-label="' + escapeHtml(perUnit(texts.decisionsPerUnit)) + '"><polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="1.5" points="' + points + '"/></svg>';
}
function tile(label, value, sub, explanation) {
  return '<div class="tile"><div class="label">' + escapeHtml(label) + '</div><div class="value">' + value + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '<div class="sub">' + escapeHtml(explanation) + '</div></div>';
}
function sortedEntries(counts) {
  return Object.keys(counts).map(function (key) { return [key, counts[key]]; }).sort(function (left, right) { return (right[1] - left[1]) || left[0].localeCompare(right[0]); });
}
function renderTiles(total) {
  const grilling = total.grilling;
  element('tiles').innerHTML = tile(texts.tileAnswers, total.answers, '', texts.explainAnswers)
    + tile(texts.tileWithLine, total.withLine, percentage(total.withLine, total.answers), texts.explainWithLine)
    + tile(texts.tileClosed, total.closed, escapeHtml(texts.tileSaved), texts.explainClosed)
    + tile(texts.tileAsked, total.asked, '', texts.explainAsked);
  element('tilesGrilling').innerHTML = tile(texts.tileGrilling, grilling.questions, fill(texts.tileGrillingDetail, { recommended: grilling.chosenRecommended, other: grilling.chosenOther, open: grilling.notDecided, self: grilling.selfAnswered }), texts.explainGrillingTile);
}
function renderOverTime(total, bucketList) {
  const shares = {}, decided = {}, asked = {};
  bucketList.forEach(function (bucket) {
    const entry = total.buckets[bucket] || emptyBucket();
    shares[bucket] = entry.answers > 0 ? Math.round(100 * entry.withLine / entry.answers) : 0;
    decided[bucket] = entry.closed; asked[bucket] = entry.asked;
  });
  element('overtime').innerHTML = chartBlock(perUnit(texts.shareTitle), perUnit(texts.explainShare), texts.axisShare,
      lineChart(bucketList, shares, perUnit(texts.shareLabel), [{ label: texts.legendShare, color: COLORS.decided }]))
    + chartBlock(perUnit(texts.decidedAskedTitle), perUnit(texts.explainDecidedAsked), texts.axisChoices,
      barChart(bucketList, [{ label: texts.legendDecided, color: COLORS.decided, values: decided }, { label: texts.legendAsked, color: COLORS.asked, values: asked }], false, perUnit(texts.decidedAskedLabel)));
}
function principleRow(row, bucketList, maximum, showsProjects) {
  const isSilent = row.level !== NOT_IN_A_FILE && row.decided + row.ties + row.against === 0;
  const bar = function (label, value, color) { return '<div class="bar"><span class="fill" style="width:' + Math.round(100 * value / maximum) * 0.8 + '%;background:' + color + '"></span>' + label + ' ' + value + '</div>'; };
  const projects = showsProjects ? '<div class="projects">' + sortedEntries(row.projects).map(function (pair) { return escapeHtml(pair[0]) + ' ' + pair[1]; }).join(', ') + '</div>' : '';
  return '<div class="principle"><div class="name">' + escapeHtml(row.name) + (row.position ? ' <span class="position">#' + row.position + '</span>' : '') + (isSilent ? '<span class="silent">' + escapeHtml(texts.silent) + '</span>' : '') + (row.level === NOT_IN_A_FILE ? '<span class="silent">' + escapeHtml(texts.notInAFile) + '</span>' : '') + projects + '</div>'
    + '<div>' + bar(escapeHtml(texts.decided), row.decided, COLORS.decided) + bar(escapeHtml(texts.ties), row.ties, COLORS.ties) + bar(escapeHtml(texts.against), row.against, COLORS.against) + '</div>'
    + '<div>' + sparkline(bucketList, row.perBucket) + '</div></div>';
}
function renderPrinciples(total, bucketList) {
  const rows = Object.keys(total.rows).map(function (id) { return total.rows[id]; });
  const maximum = Math.max.apply(null, rows.map(function (row) { return Math.max(row.decided, row.ties, row.against); }).concat([1]));
  const byDecisions = function (left, right) { return (right.decided - left.decided) || ((left.position || 999) - (right.position || 999)) || left.name.localeCompare(right.name); };
  const section = function (title, list, showsProjects) {
    return '<h3>' + escapeHtml(title) + '</h3>' + (list.length ? list.map(function (row) { return principleRow(row, bucketList, maximum, showsProjects); }).join('') : '<div class="empty">' + escapeHtml(texts.none) + '</div>');
  };
  const globals = rows.filter(function (row) { return row.level === 'global'; }).sort(byDecisions);
  const outside = rows.filter(function (row) { return row.level === NOT_IN_A_FILE; }).sort(byDecisions);
  const own = rows.filter(function (row) { return row.level === 'project'; }).sort(byDecisions);
  const isAll = isAllSelected();
  const showsOwn = state.level !== 'global';
  const showsGlobals = state.level !== 'project';
  const globalSection = isAll ? section(texts.globalWithProjects, globals, true) : section(texts.globalAsUsed, globals.concat(outside.map(function (row) { return Object.assign({ label: NOT_IN_A_FILE }, row); })), false);
  const ownSection = section(selectedFolders().length === 1 ? texts.ownPrinciples : texts.projectsOwn, own, isAll);
  element('principles').innerHTML = '<div class="explain">' + escapeHtml(texts.explainColumns) + ' ' + escapeHtml(perUnit(texts.explainTrend)) + '</div>' + (showsOwn && (!isAll || state.level === 'project') ? ownSection : '') + (showsGlobals ? globalSection : '');
}
function pairLabels(counts, separator) {
  const isAll = isAllSelected();
  const result = {};
  Object.keys(counts).forEach(function (pair) {
    const keys = pair.split(separator);
    const parsed = keys.map(function (key) { return /^(.*?)_([a-z]+)$/.exec(key); });
    const isEveryGlobal = parsed.every(function (match) { return Boolean(match); });
    const label = keys.map(function (key, index) { return parsed[index] ? parsed[index][1] + (isAll ? '' : texts.globalSuffix) : key; }).join(separator);
    if (!isAll || isEveryGlobal) { increase(result, label, counts[pair]); }
  });
  return result;
}
function renderPairs(total) {
  const list = function (counts, separator) {
    const entries = sortedEntries(pairLabels(counts, separator)).slice(0, 8);
    return entries.length ? '<ul class="plain">' + entries.map(function (pair) { return '<li><span>' + escapeHtml(pair[0]) + '</span><b>' + pair[1] + '</b></li>'; }).join('') + '</ul>' : '<div class="empty">' + escapeHtml(texts.none) + '</div>';
  };
  element('pairs').innerHTML = '<h3>' + escapeHtml(texts.tiesTitle) + '</h3><div class="explain">' + escapeHtml(texts.explainPairs) + '</div>' + list(total.tiePairs, ' × ');
}
function renderGrilling(total, bucketList) {
  const pick = function (field) { const values = {}; bucketList.forEach(function (bucket) { values[bucket] = (total.buckets[bucket] || emptyBucket())[field]; }); return values; };
  element('grilling').innerHTML = chartBlock(perUnit(texts.grillingTitle), perUnit(texts.explainGrillingChart), texts.axisQuestions, barChart(bucketList, [
    { label: texts.recommendedChosen, explain: texts.explainRecommended, color: COLORS.decided, values: pick('recommended') }, { label: texts.otherChosen, explain: texts.explainOther, color: COLORS.asked, values: pick('other') },
    { label: texts.leftOpen, explain: texts.explainLeftOpen, color: COLORS.ties, values: pick('open') }, { label: texts.answeredByThemselves, explain: texts.explainSelfAnswered, color: COLORS.neutral, values: pick('self') }], true, perUnit(texts.grillingLabel)));
}
function renderWayInUse(total, bucketList) {
  const series = [
    { label: texts.grillingWith, explain: texts.explainGrillingWith, skill: 'alecsplus-skills:the-way-grilling', color: COLORS.decided },
    { label: texts.grillingWithout, explain: texts.explainGrillingWithout, skill: 'mattpocock-skills:grilling', color: COLORS.asked },
    { label: texts.selfAnswer, explain: texts.explainSelfAnswer, skill: 'alecsplus-skills:the-way-self-answer', color: COLORS.neutral }
  ].map(function (entry) {
    const values = {};
    bucketList.forEach(function (bucket) { values[bucket] = (total.buckets[bucket] || emptyBucket()).skills[entry.skill] || 0; });
    return { label: entry.label, explain: entry.explain, color: entry.color, values: values };
  });
  const written = (total.skills['alecsplus-skills:the-way-new'] || 0) + (total.skills['alecsplus-skills:the-way-global-new'] || 0);
  element('wayinuse').innerHTML = chartBlock(perUnit(texts.wayInUseTitle), perUnit(texts.explainWayInUse), texts.axisRuns, barChart(bucketList, series, false, perUnit(texts.wayInUseLabel))) + '<div class="sub">' + escapeHtml(fill(texts.principlesWritten, { n: written })) + '</div>';
}
function render() {
  const total = aggregate();
  const bucketList = bucketsBetween();
  renderProjectList();
  renderTiles(total); renderOverTime(total, bucketList); renderPrinciples(total, bucketList); renderPairs(total); renderGrilling(total, bucketList); renderWayInUse(total, bucketList);
  Array.prototype.forEach.call(document.querySelectorAll('button[data-days]'), function (button) { button.className = button.getAttribute('data-days') === state.preset ? 'active' : ''; });
  CHOICE_GROUPS.forEach(function (name) {
    Array.prototype.forEach.call(document.querySelectorAll('button[data-' + name + ']'), function (button) { button.className = button.getAttribute('data-' + name) === state[name] ? 'active' : ''; });
  });
  element('partChat').hidden = state.scope === 'grilling';
  element('partGrilling').hidden = state.scope === 'chat';
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
const projectSearch = element('projectSearch');
const projectPanel = element('projectPanel');
const projectToggle = element('projectToggle');
const answersIn = function (folder) {
  const days = ledger.projects[folder].days;
  return Object.keys(days).reduce(function (sum, day) { return sum + (day >= state.from && day <= state.to ? days[day].answers : 0); }, 0);
};
function projectRow(folder, name, count, maximumCount, isChecked, showsBar) {
  return '<label class="projectRow' + (isChecked ? ' selected' : '') + '"><span class="line"><span><input type="checkbox" data-folder="' + escapeHtml(folder) + '"' + (isChecked ? ' checked' : '') + '> ' + escapeHtml(name) + '</span><span class="count">' + escapeHtml(fill(texts.answersCount, { n: count })) + '</span></span>'
    + (showsBar ? '<span class="share" style="width:' + Math.round(100 * count / maximumCount) + '%"></span>' : '') + '</label>';
}
function renderProjectList() {
  const query = projectSearch.value.trim().toLowerCase();
  const counts = {};
  Object.keys(ledger.projects).forEach(function (folder) { counts[folder] = answersIn(folder); });
  const folderOrder = Object.keys(ledger.projects).sort(function (left, right) { return (counts[right] - counts[left]) || ledger.projects[left].name.localeCompare(ledger.projects[right].name); });
  const matching = folderOrder.filter(function (folder) { return ledger.projects[folder].name.toLowerCase().indexOf(query) >= 0; });
  const totalAnswers = folderOrder.reduce(function (sum, folder) { return sum + counts[folder]; }, 0);
  const mostAnswers = Math.max.apply(null, folderOrder.map(function (folder) { return counts[folder]; }).concat([1]));
  element('projectList').innerHTML = projectRow('*', texts.allProjects, totalAnswers, 1, isAllSelected(), false)
    + (matching.length || !query ? matching.map(function (folder) { return projectRow(folder, ledger.projects[folder].name, counts[folder], mostAnswers, !state.unselected[folder], true); }).join('') : '<div class="empty">' + escapeHtml(texts.noProjectMatches) + '</div>');
  projectToggle.textContent = fill(texts.projectButton, { chosen: selectedFolders().length, total: folderOrder.length });
}
projectSearch.setAttribute('placeholder', texts.searchProjects);
element('projectHeading').textContent = texts.projectsHeading;
projectSearch.addEventListener('input', renderProjectList);
projectToggle.addEventListener('click', function () { projectPanel.classList.toggle('open'); });
element('projectList').addEventListener('change', function (event) {
  const box = event.target;
  const folder = box.getAttribute('data-folder');
  const folders = folder === '*' ? Object.keys(ledger.projects) : [folder];
  folders.forEach(function (name) { if (box.checked) { delete state.unselected[name]; } else { state.unselected[name] = true; } });
  render();
});
CHOICE_GROUPS.forEach(function (name) {
  Array.prototype.forEach.call(document.querySelectorAll('button[data-' + name + ']'), function (button) { button.addEventListener('click', function () { state[name] = button.getAttribute('data-' + name); render(); }); });
});
['from', 'to'].forEach(function (id) { element(id).addEventListener('change', function () { state[id] = element(id).value; state.preset = ''; render(); }); });
Array.prototype.forEach.call(document.querySelectorAll('button[data-days]'), function (button) { button.addEventListener('click', function () { setPreset(button.getAttribute('data-days')); render(); }); });
const dayCount = Object.keys(ledger.projects).reduce(function (sum, folder) { return sum + Object.keys(ledger.projects[folder].days).length; }, 0);
element('footer').textContent = fill(texts.footer, { path: ledger.meta.path, updatedAt: ledger.meta.updatedAt, projects: Object.keys(ledger.projects).length, days: dayCount });
setPreset('30');
render();
})();
`;

export function writeDashboard({ ledger, ledgerPath, filePath, texts = TEXTS }) {
  const data = { ...ledger, meta: { path: ledgerPath, updatedAt: ledger.updatedAt }, texts };
  const text = (key) => escapeText(texts[key]);
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c');
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${text('title')}</title><style>${STYLE}</style></head>
<body><main>
<h1>${text('title')}</h1>
<div class="filterBar">
<div class="group"><span class="groupLabel">${text('filterShow')}</span><button data-scope="chat">${text('scopeChat')}</button><button data-scope="grilling">${text('scopeGrilling')}</button><button data-scope="both">${text('scopeBoth')}</button></div>
<div class="group"><span class="groupLabel">${text('filterPrinciples')}</span><button data-level="all">${text('kindAll')}</button><button data-level="project">${text('levelProject')}</button><button data-level="global">${text('levelGlobal')}</button></div>
<div class="group"><span class="groupLabel">${text('filterList')}</span><button data-kind="all">${text('kindAll')}</button><button data-kind="result">${text('kindResult')}</button><button data-kind="work">${text('kindWork')}</button></div>
<div class="group"><span class="groupLabel">${text('filterUnit')}</span><button data-unit="day">${text('unitDay')}</button><button data-unit="week">${text('unitWeek')}</button><button data-unit="month">${text('unitMonth')}</button></div>
<div class="group"><span class="groupLabel">${text('filterPeriod')}</span><label>${text('from')} <input type="date" id="from"></label><label>${text('to')} <input type="date" id="to"></label><button data-days="7">${text('days7')}</button><button data-days="30">${text('days30')}</button><button data-days="90">${text('days90')}</button><button data-days="all">${text('daysAll')}</button></div>
</div>
<div class="layout">
<aside><button id="projectToggle"></button><div id="projectPanel"><div id="projectHeading" class="groupLabel"></div><input type="search" id="projectSearch" autocomplete="off"><div id="projectList"></div></div></aside>
<div class="content">
<div id="partChat">
<h2 class="part">${text('partChat')}</h2>
<div class="tiles" id="tiles"></div>
<h3 class="section">${text('sectionOverTime')}</h3><div class="panel" id="overtime"></div>
<h3 class="section">${text('sectionPrinciples')}</h3>
<div class="panel" id="principles"></div>
<h3 class="section">${text('sectionPairs')}</h3><div class="panel" id="pairs"></div>
</div>
<div id="partGrilling">
<h2 class="part">${text('partGrilling')}</h2>
<div class="tiles" id="tilesGrilling"></div>
<h3 class="section">${text('sectionGrilling')}</h3><div class="panel" id="grilling"></div>
<h3 class="section">${text('sectionWayInUse')}</h3><div class="panel" id="wayinuse"></div>
</div>
<footer id="footer"></footer>
</div></div>
</main>
<script type="application/json" id="ledger">${serialized}</script>
<script>${CLIENT_SCRIPT}</script>
</body></html>
`;
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page);
}
