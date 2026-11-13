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
  moreProjects: 'More projects',
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
  sectionLineOverTime: 'The Principles line over time',
  sectionClosedAskedOverTime: 'Choices closed and questions asked over time',
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
  tileGrillingDetail: 'recommended chosen {recommended} · other {other} · no answer read {unanswered}<br>among them: the principles did not decide {open} · answer already in it {self}',
  shareTitle: 'Share of answers with the Principles line, per {unit}',
  shareLabel: 'Share of answers with the Principles line, per {unit}',
  decidedAskedTitle: 'Choices decided by the principles and questions asked to you, per {unit}',
  decidedAskedLabel: 'Decided and asked per {unit}',
  tileTrend: 'trend per {unit}',
  tileTrendPoint: '{part} (of {whole})',
  tileTrendAll: 'the faint line is the same count with no Principles or List filter',
  explainAnswers: 'You see the messages that ended my turn.',
  explainWithLine: 'You see how many of them have the "Principles:" line on top.',
  explainWithLineFiltered: 'You see how many of them have the "Principles:" line on top citing at least one principle {which}.',
  shareFiltered: 'Only the lines citing at least one principle {which} count.',
  sharePoint: '{share}% ({part} of {whole})',
  citesProject: 'from the project\'s file',
  citesGlobal: 'from the global file',
  citesResult: 'in the Result list',
  citesWork: 'in the Work list',
  countedSince: 'counted from {date}',
  notFiltered: 'Does not depend on the Principles and List filters.',
  explainClosed: 'You see the choices a principle written in a file decided on its own, without asking you; it follows the Principles and List filters.',
  explainAsked: 'You see the answers that ended with a question to you.',
  explainGrillingTile: 'You see the ❓ grilling questions and how you answered them. The second line counts some of the same questions again, by what they said.',
  explainShare: 'You see, for each {unit}, the share of my answers that had the "Principles:" line on top: 100% means all of them. A {unit} without answers has no point.',
  explainDecidedAsked: 'You see, for each {unit}, two bars: how many choices the principles closed alone and how many questions I asked you.',
  explainGrillingChart: 'You see, for each {unit}, one stacked bar as tall as the grilling questions: its colours are how you answered them.',
  explainWayInUse: 'You see, for each {unit}, how many times each way of working was used.',
  explainRecommended: 'You see the questions where you took the answer I recommended.',
  explainOther: 'You see the questions where you chose a different answer.',
  explainNoAnswer: 'You see the questions whose reply named no option: no reply yet, or a reply in words.',
  explainGrillingWith: 'You see the grilling runs done with the principles.',
  explainGrillingWithout: 'You see the grilling runs done without the principles.',
  explainSelfAnswer: 'You see how many times the self-answer skill ran.',
  explainColumns: 'You see one row per principle. Decided: times the principle decided. Ties: times it was named where the principles did not decide. Against: times I chose against it and said so. #n: its place in the file.',
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
  notInAFileGroup: 'Names cited that no file has, or cited at the wrong level (not counted in the choices closed)',
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
  noAnswer: 'no answer read',
  grillingLabel: 'Grilling questions per {unit}',
  grillingWith: 'grilling with the principles',
  grillingWithout: 'grilling without',
  selfAnswer: 'self-answer runs',
  wayInUseLabel: 'The way in use per {unit}',
  principlesWritten: 'the-way-new and the-way-global-new runs (a principle proposed): {n}',
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
.switch { font-size:.8rem; color:var(--muted); cursor:pointer; }
.projectRow .share { display:block; height:4px; border-radius:2px; background:var(--decided); opacity:.5; margin-top:3px; min-width:1px; }
.projectRow.selected { border-color:var(--decided); background:var(--surface); }
@media (max-width:800px) { .layout { grid-template-columns:1fr; } aside { position:static; max-height:none; } #projectToggle { display:block; } #projectPanel { display:none; } #projectPanel.open { display:flex; flex-direction:column; gap:8px; } #projectList { max-height:50vh; } }
h1 { font-size:1.4rem; margin:0 0 12px; } h2.part { font-size:1.3rem; margin:36px 0 4px; padding-top:10px; border-top:2px solid var(--line); } h3.section { font-size:1.05rem; margin:24px 0 10px; color:var(--text); } h3 { font-size:.95rem; margin:14px 0 4px; color:var(--muted); font-weight:600; }
.controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
select, input, button { font:inherit; color:var(--text); background:var(--surface); border:1px solid var(--line); border-radius:6px; padding:4px 8px; }
button.active { border-color:var(--decided); color:var(--decided); font-weight:600; }
h3.tilesLabel { margin:12px 0 6px; } #tilesChatRow h3.tilesLabel { margin-top:0; }
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
const GRILLING_WITHOUT_SKILLS = ['mattpocock-skills:grilling', 'grilling'];
const state = { single: '*', multiple: false, unselected: {}, from: '', to: '', preset: '30', kind: 'all', unit: 'week', scope: 'both', level: 'all' };
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
function selectedFolders() {
  const folders = Object.keys(ledger.projects);
  return state.multiple ? folders.filter(function (folder) { return !state.unselected[folder]; }) : (state.single === '*' ? folders : [state.single]);
}
function isAllSelected() { return selectedFolders().length === Object.keys(ledger.projects).length; }
function emptyBucket() { return { answers: 0, withLine: 0, cited: 0, counted: 0, closed: 0, closedAll: 0, asked: 0, questions: 0, recommended: 0, other: 0, skills: {} }; }
// The key of lineCites for the Principles and List filters; '*/*' is no filter, the whole withLine.
function citeKey() { return (state.level === 'all' ? '*' : state.level) + '/' + (state.kind === 'all' ? '*' : state.kind); }
function isFiltered() { return citeKey() !== '*/*'; }
function citedWhich() {
  const level = { all: '', project: texts.citesProject, global: texts.citesGlobal }[state.level];
  const kind = { all: '', result: texts.citesResult, work: texts.citesWork }[state.kind];
  return [level, kind].filter(Boolean).join(' ');
}
function dayLabel(day) { return Number(day.slice(8, 10)) + ' ' + texts.monthNames.split(' ')[Number(day.slice(5, 7)) - 1] + ' ' + day.slice(0, 4); }
function rowOf(rows, level, base) {
  const id = level + ':' + base;
  rows[id] = rows[id] || { name: base, level: level, decided: 0, ties: 0, against: 0, perBucket: {}, projects: {} };
  return rows[id];
}
function aggregate() {
  const total = { answers: 0, withLine: 0, cited: 0, counted: 0, firstCounted: '', isMissingCites: false, asked: 0, closed: 0, grilling: { questions: 0, withRecommendation: 0, notDecided: 0, selfAnswered: 0, chosenRecommended: 0, chosenOther: 0 }, skills: {}, rows: {}, tiePairs: {}, buckets: {} };
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
        // A day saved before lineCites existed is known only when it had no line at all; otherwise it stays out of the count, no estimate.
        const hasCites = !isFiltered() || Boolean(facts.lineCites) || facts.withLine === 0;
        const cited = isFiltered() ? (facts.lineCites || {})[citeKey()] || 0 : facts.withLine;
        const counted = hasCites ? facts.answers : 0;
        total.cited += cited; total.counted += counted; bucketEntry.cited += cited; bucketEntry.counted += counted;
        total.isMissingCites = total.isMissingCites || !hasCites;
        total.firstCounted = facts.lineCites && (!total.firstCounted || day < total.firstCounted) ? day : total.firstCounted;
        Object.keys(total.grilling).forEach(function (field) { total.grilling[field] += facts.grilling[field]; });
        bucketEntry.recommended += facts.grilling.chosenRecommended; bucketEntry.other += facts.grilling.chosenOther;
        bucketEntry.questions += facts.grilling.questions;
        Object.keys(facts.skills).forEach(function (skill) { increase(total.skills, skill, facts.skills[skill]); increase(bucketEntry.skills, skill, facts.skills[skill]); });
        Object.keys(facts.tiePairs).forEach(function (pair) {
          const found = pair.split(' × ').map(function (key) { return classify(key, folder); });
          const fits = found.every(function (entry) { return passes(entry, folder); });
          const label = found.map(function (entry) { return entry.base + (entry.level === 'global' ? texts.globalSuffix : ''); }).join(' × ');
          if (fits) { increase(total.tiePairs, label, facts.tiePairs[pair]); }
        });
        ['decided', 'ties', 'against'].forEach(function (field) {
          Object.keys(facts[field]).forEach(function (key) {
            const found = classify(key, folder);
            const row = passes(found, folder) ? rowOf(total.rows, found.level, found.base) : null;
            if (row) { row[field] += facts[field][key]; }
            if (field === 'decided') { bucketEntry.closedAll += found.level === NOT_IN_A_FILE ? 0 : facts.decided[key]; }
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
  const points = bucketList.map(function (bucket, index) { return { x: LEFT + (index + 0.5) * slot, y: TOP + drawing.innerHeight * (1 - (values[bucket] ? values[bucket].share : 0) / 100), bucket: bucket, value: values[bucket] }; })
    .filter(function (point) { return point.value !== undefined; });
  let html = drawing.html + '<polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="2" points="' + points.map(function (point) { return point.x.toFixed(1) + ',' + point.y.toFixed(1); }).join(' ') + '"/>';
  points.forEach(function (point) { html += '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="3" fill="' + COLORS.decided + '"><title>' + bucketLabel(point.bucket) + ': ' + escapeHtml(fill(texts.sharePoint, point.value)) + '</title></circle>'; });
  return html + '</svg>' + legend(series);
}
function sparkline(bucketList, perBucket) {
  const values = bucketList.map(function (bucket) { return perBucket[bucket] || 0; });
  const maximum = Math.max.apply(null, values.concat([1]));
  const points = values.map(function (value, index) { return (bucketList.length > 1 ? 100 * index / (bucketList.length - 1) : 50).toFixed(1) + ',' + (22 - 20 * value / maximum).toFixed(1); }).join(' ');
  return '<svg viewBox="0 0 100 24" preserveAspectRatio="none" width="110" height="24" role="img" aria-label="' + escapeHtml(perUnit(texts.decisionsPerUnit)) + '">' + trendTitle(perUnit(texts.decisionsPerUnit), bucketList, values) + '<polyline fill="none" stroke="' + COLORS.decided + '" stroke-width="1.5" points="' + points + '"/></svg>';
}
function trendTitle(label, bucketList, values) {
  return '<title>' + escapeHtml(label) + ' — ' + bucketList.map(function (bucket, index) { return bucketLabel(bucket) + ': ' + values[index]; }).join(', ') + '</title>';
}
function trendPoints(values, maximum) {
  return values.map(function (value, index) { return (values.length > 1 ? 100 * index / (values.length - 1) : 50).toFixed(1) + ',' + (26 - 24 * value / maximum).toFixed(1); }).join(' ');
}
function tileTrend(bucketList, total, field, color, wholeField) {
  const seriesOf = function (name) { return bucketList.map(function (bucket) { return (total.buckets[bucket] || emptyBucket())[name]; }); };
  const values = seriesOf(field);
  const wholeValues = wholeField && isFiltered() ? seriesOf(wholeField) : null;
  const maximum = Math.max.apply(null, (wholeValues || values).concat([1]));
  const titleValues = wholeValues ? values.map(function (value, index) { return fill(texts.tileTrendPoint, { part: value, whole: wholeValues[index] }); }) : values;
  const faintLine = wholeValues ? '<polyline fill="none" stroke="currentColor" opacity="0.25" stroke-width="1.5" vector-effect="non-scaling-stroke" points="' + trendPoints(wholeValues, maximum) + '"/>' : '';
  const explanation = wholeValues ? '<div class="sub">' + escapeHtml(texts.tileTrendAll) + '</div>' : '';
  return '<div class="sub">' + escapeHtml(perUnit(texts.tileTrend)) + '</div><svg class="tile-trend" viewBox="0 0 100 28" preserveAspectRatio="none" width="100%" height="28" role="img" aria-label="' + escapeHtml(perUnit(texts.tileTrend)) + '">' + trendTitle(perUnit(texts.tileTrend), bucketList, titleValues) + faintLine + '<polyline fill="none" stroke="' + color + '" stroke-width="1.5" vector-effect="non-scaling-stroke" points="' + trendPoints(values, maximum) + '"/></svg>' + explanation;
}
function tile(label, value, sub, explanation, trend) {
  return '<div class="tile"><div class="label">' + escapeHtml(label) + '</div><div class="value">' + value + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '<div class="sub">' + escapeHtml(explanation) + '</div>' + trend + '</div>';
}
function sortedEntries(counts) {
  return Object.keys(counts).map(function (key) { return [key, counts[key]]; }).sort(function (left, right) { return (right[1] - left[1]) || left[0].localeCompare(right[0]); });
}
function renderTiles(total, bucketList) {
  const grilling = total.grilling;
  const independent = isFiltered() ? '<div class="sub">' + escapeHtml(texts.notFiltered) + '</div>' : '';
  const countedSince = isFiltered() && total.isMissingCites ? ' · ' + escapeHtml(fill(texts.countedSince, { date: total.firstCounted ? dayLabel(total.firstCounted) : '—' })) : '';
  const withLineExplanation = isFiltered() ? fill(texts.explainWithLineFiltered, { which: citedWhich() }) : texts.explainWithLine;
  element('tiles').innerHTML = tile(texts.tileAnswers, total.answers, '', texts.explainAnswers, independent + tileTrend(bucketList, total, 'answers', COLORS.neutral))
    + tile(texts.tileWithLine, total.cited, percentage(total.cited, total.counted) + countedSince, withLineExplanation, tileTrend(bucketList, total, 'cited', COLORS.decided, 'withLine'));
  element('tilesGrilling').innerHTML = tile(texts.tileClosed, total.closed, escapeHtml(texts.tileSaved), texts.explainClosed, tileTrend(bucketList, total, 'closed', COLORS.decided, 'closedAll'))
    + tile(texts.tileAsked, total.asked, '', texts.explainAsked, independent + tileTrend(bucketList, total, 'asked', COLORS.asked))
    + tile(texts.tileGrilling, grilling.questions, fill(texts.tileGrillingDetail, { recommended: grilling.chosenRecommended, other: grilling.chosenOther, unanswered: grilling.questions - grilling.chosenRecommended - grilling.chosenOther, open: grilling.notDecided, self: grilling.selfAnswered }), texts.explainGrillingTile, independent + tileTrend(bucketList, total, 'questions', COLORS.ties));
}
function independentOfFilters(explanation) { return explanation + (isFiltered() ? ' ' + texts.notFiltered : ''); }
function renderOverTime(total, bucketList) {
  const shares = {}, decided = {}, asked = {};
  bucketList.forEach(function (bucket) {
    const entry = total.buckets[bucket] || emptyBucket();
    if (entry.counted > 0) { shares[bucket] = { share: Math.round(100 * entry.cited / entry.counted), part: entry.cited, whole: entry.counted }; }
    decided[bucket] = entry.closed; asked[bucket] = entry.asked;
  });
  const shareExplanation = perUnit(texts.explainShare) + (isFiltered() ? ' ' + fill(texts.shareFiltered, { which: citedWhich() }) : '');
  element('overtime').innerHTML = chartBlock(perUnit(texts.shareTitle), shareExplanation, texts.axisShare,
      lineChart(bucketList, shares, perUnit(texts.shareLabel), [{ label: texts.legendShare, color: COLORS.decided }]));
  element('decidedAsked').innerHTML = chartBlock(perUnit(texts.decidedAskedTitle), perUnit(texts.explainDecidedAsked), texts.axisChoices,
      barChart(bucketList, [{ label: texts.legendDecided, color: COLORS.decided, values: decided }, { label: texts.legendAsked, color: COLORS.asked, values: asked }], false, perUnit(texts.decidedAskedLabel)));
}
function principleRow(row, bucketList, maximum, showsProjects) {
  const isSilent = row.level !== NOT_IN_A_FILE && row.decided + row.ties + row.against === 0;
  const bar = function (label, value, color) { return '<div class="bar"><span class="fill" style="width:' + Math.round(100 * value / maximum) * 0.8 + '%;background:' + color + '"></span>' + label + ' ' + value + '</div>'; };
  const projects = showsProjects ? '<div class="projects">' + sortedEntries(row.projects).map(function (pair) { return escapeHtml(pair[0]) + ' ' + pair[1]; }).join(', ') + '</div>' : '';
  return '<div class="principle"><div class="name">' + escapeHtml(row.name) + (row.position ? ' <span class="position">#' + row.position + '</span>' : '') + (isSilent ? '<span class="silent">' + escapeHtml(texts.silent) + '</span>' : '') + projects + '</div>'
    + '<div>' + bar(escapeHtml(texts.decided), row.decided, COLORS.decided) + bar(escapeHtml(texts.ties), row.ties, COLORS.ties) + bar(escapeHtml(texts.against), row.against, COLORS.against) + '</div>'
    + '<div>' + sparkline(bucketList, row.perBucket) + '</div></div>';
}
function renderPrinciples(total, bucketList) {
  const rows = Object.keys(total.rows).map(function (id) { return total.rows[id]; });
  const maximum = Math.max.apply(null, rows.map(function (row) { return Math.max(row.decided, row.ties, row.against); }).concat([1]));
  const byDecisions = function (left, right) { return (right.decided - left.decided) || ((left.position || 999) - (right.position || 999)) || left.name.localeCompare(right.name); };
  const showsProjects = selectedFolders().length > 1;
  const section = function (title, list) {
    return '<h3>' + escapeHtml(title) + '</h3>' + (list.length ? list.map(function (row) { return principleRow(row, bucketList, maximum, showsProjects); }).join('') : '<div class="empty">' + escapeHtml(texts.none) + '</div>');
  };
  const ofLevel = function (level) { return rows.filter(function (row) { return row.level === level; }).sort(byDecisions); };
  const outside = ofLevel(NOT_IN_A_FILE);
  const ownSection = state.level !== 'global' ? section(selectedFolders().length === 1 ? texts.ownPrinciples : texts.projectsOwn, ofLevel('project')) : '';
  const globalSection = state.level !== 'project' ? section(showsProjects ? texts.globalWithProjects : texts.globalAsUsed, ofLevel('global')) : '';
  const outsideSection = outside.length ? section(texts.notInAFileGroup, outside) : '';
  element('principles').innerHTML = '<div class="explain">' + escapeHtml(texts.explainColumns) + ' ' + escapeHtml(perUnit(texts.explainTrend)) + '</div>' + ownSection + globalSection + outsideSection;
}
function renderPairs(total) {
  const entries = sortedEntries(total.tiePairs).slice(0, 8);
  const list = entries.length ? '<ul class="plain">' + entries.map(function (pair) { return '<li><span>' + escapeHtml(pair[0]) + '</span><b>' + pair[1] + '</b></li>'; }).join('') + '</ul>' : '<div class="empty">' + escapeHtml(texts.none) + '</div>';
  element('pairs').innerHTML = '<h3>' + escapeHtml(texts.tiesTitle) + '</h3><div class="explain">' + escapeHtml(texts.explainPairs) + '</div>' + list;
}
function renderGrilling(total, bucketList) {
  const pick = function (field) { const values = {}; bucketList.forEach(function (bucket) { values[bucket] = (total.buckets[bucket] || emptyBucket())[field]; }); return values; };
  const unanswered = {};
  bucketList.forEach(function (bucket) { const entry = total.buckets[bucket] || emptyBucket(); unanswered[bucket] = entry.questions - entry.recommended - entry.other; });
  element('grilling').innerHTML = chartBlock(perUnit(texts.grillingTitle), independentOfFilters(perUnit(texts.explainGrillingChart)), texts.axisQuestions, barChart(bucketList, [
    { label: texts.recommendedChosen, explain: texts.explainRecommended, color: COLORS.decided, values: pick('recommended') }, { label: texts.otherChosen, explain: texts.explainOther, color: COLORS.asked, values: pick('other') },
    { label: texts.noAnswer, explain: texts.explainNoAnswer, color: COLORS.neutral, values: unanswered }], true, perUnit(texts.grillingLabel)));
}
function renderWayInUse(total, bucketList) {
  const series = [
    { label: texts.grillingWith, explain: texts.explainGrillingWith, skills: ['alecsplus-skills:the-way-grilling'], color: COLORS.decided },
    { label: texts.grillingWithout, explain: texts.explainGrillingWithout, skills: GRILLING_WITHOUT_SKILLS, color: COLORS.asked },
    { label: texts.selfAnswer, explain: texts.explainSelfAnswer, skills: ['alecsplus-skills:the-way-self-answer'], color: COLORS.neutral }
  ].map(function (entry) {
    const values = {};
    bucketList.forEach(function (bucket) {
      const runs = (total.buckets[bucket] || emptyBucket()).skills;
      values[bucket] = entry.skills.reduce(function (sum, skill) { return sum + (runs[skill] || 0); }, 0);
    });
    return { label: entry.label, explain: entry.explain, color: entry.color, values: values };
  });
  const written = (total.skills['alecsplus-skills:the-way-new'] || 0) + (total.skills['alecsplus-skills:the-way-global-new'] || 0);
  element('wayinuse').innerHTML = chartBlock(perUnit(texts.wayInUseTitle), independentOfFilters(perUnit(texts.explainWayInUse)), texts.axisRuns, barChart(bucketList, series, false, perUnit(texts.wayInUseLabel))) + '<div class="sub">' + escapeHtml(fill(texts.principlesWritten, { n: written })) + '</div>';
}
function render() {
  const total = aggregate();
  const bucketList = bucketsBetween();
  renderProjectList();
  renderTiles(total, bucketList); renderOverTime(total, bucketList); renderPrinciples(total, bucketList); renderPairs(total); renderGrilling(total, bucketList); renderWayInUse(total, bucketList);
  Array.prototype.forEach.call(document.querySelectorAll('button[data-days]'), function (button) { button.className = button.getAttribute('data-days') === state.preset ? 'active' : ''; });
  CHOICE_GROUPS.forEach(function (name) {
    Array.prototype.forEach.call(document.querySelectorAll('button[data-' + name + ']'), function (button) { button.className = button.getAttribute('data-' + name) === state[name] ? 'active' : ''; });
  });
  element('partChat').hidden = state.scope === 'grilling';
  element('tilesChatRow').hidden = state.scope === 'grilling';
  element('partGrilling').hidden = state.scope === 'chat';
  element('tilesGrillingRow').hidden = state.scope === 'chat';
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
  const box = state.multiple ? '<input type="checkbox" data-folder="' + escapeHtml(folder) + '"' + (isChecked ? ' checked' : '') + '> ' : '';
  return '<label class="projectRow' + (isChecked ? ' selected' : '') + '" data-folder="' + escapeHtml(folder) + '"><span class="line"><span>' + box + escapeHtml(name) + '</span><span class="count">' + escapeHtml(fill(texts.answersCount, { n: count })) + '</span></span>'
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
  element('projectList').innerHTML = projectRow('*', texts.allProjects, totalAnswers, 1, state.multiple ? isAllSelected() : state.single === '*', false)
    + (matching.length || !query ? matching.map(function (folder) { return projectRow(folder, ledger.projects[folder].name, counts[folder], mostAnswers, state.multiple ? !state.unselected[folder] : state.single === folder, true); }).join('') : '<div class="empty">' + escapeHtml(texts.noProjectMatches) + '</div>');
  projectToggle.textContent = fill(texts.projectButton, { chosen: selectedFolders().length, total: folderOrder.length });
}
projectSearch.setAttribute('placeholder', texts.searchProjects);
element('projectHeading').textContent = texts.projectsHeading;
element('multipleLabel').textContent = texts.moreProjects;
projectSearch.addEventListener('input', renderProjectList);
projectToggle.addEventListener('click', function () { projectPanel.classList.toggle('open'); });
element('projectsMultiple').addEventListener('change', function (event) {
  state.multiple = event.target.checked;
  state.unselected = {};
  if (state.multiple && state.single !== '*') { Object.keys(ledger.projects).forEach(function (folder) { if (folder !== state.single) { state.unselected[folder] = true; } }); }
  render();
});
element('projectList').addEventListener('click', function (event) {
  const row = event.target.closest ? event.target.closest('.projectRow') : null;
  if (row && !state.multiple) { state.single = row.getAttribute('data-folder'); projectPanel.classList.remove('open'); render(); }
});
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
const dayCount = allDays().filter(function (day, index, days) { return day !== days[index - 1]; }).length;
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
<aside><button id="projectToggle"></button><div id="projectPanel"><label class="switch"><input type="checkbox" id="projectsMultiple"> <span id="multipleLabel"></span></label><div id="projectHeading" class="groupLabel"></div><input type="search" id="projectSearch" autocomplete="off"><div id="projectList"></div></div></aside>
<div class="content">
<div id="tilesChatRow"><h3 class="tilesLabel">${text('partChat')}</h3><div class="tiles" id="tiles"></div></div>
<div id="tilesGrillingRow"><h3 class="tilesLabel">${text('partGrilling')}</h3><div class="tiles" id="tilesGrilling"></div></div>
<div id="partChat">
<h2 class="part">${text('partChat')}</h2>
<h3 class="section">${text('sectionLineOverTime')}</h3><div class="panel" id="overtime"></div>
<h3 class="section">${text('sectionPrinciples')}</h3>
<div class="panel" id="principles"></div>
<h3 class="section">${text('sectionPairs')}</h3><div class="panel" id="pairs"></div>
</div>
<div id="partGrilling">
<h2 class="part">${text('partGrilling')}</h2>
<h3 class="section">${text('sectionClosedAskedOverTime')}</h3><div class="panel" id="decidedAsked"></div>
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
