// Reads the Claude Code transcripts and turns them into facts per project folder and per day.
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { basename, join } from 'node:path';

const PLACEHOLDER_NAMES = new Set(['NAME', 'NOME']);
const PRINCIPLES_LINE = /^\s*\**Princip\w*\**\s*:\s*(.+)$/i;
const NAME_PATTERN = '(?<![A-Za-z0-9_])([A-Z][A-Z0-9_]*[A-Z0-9])(?:_([a-z]+))?';
const QUESTION_ENDING = /\?[*»_"')]?\s*$/;
const GRILLING_START = /^\s*❓/;
const RECOMMENDED_LINE = /^\s*\*\*([A-D])\)/;
const SELF_ANSWERED = /already in|già dentro|Risposta già/i;
const MAXIMUM_BLOCK_LINES = 20;
const IGNORED_PERSON_TEXTS = ['<', 'Another Claude session', 'Base directory for this skill'];

export function emptyDay() {
  return {
    answers: 0, withLine: 0, decided: {}, against: {}, ties: {}, tiePairs: {}, together: {},
    questionsAsked: 0,
    grilling: { questions: 0, withRecommendation: 0, notDecided: 0, selfAnswered: 0, chosenRecommended: 0, chosenOther: 0 },
    skills: {},
  };
}

function increase(counts, key, amount = 1) {
  counts[key] = (counts[key] || 0) + amount;
}

function keyOf(name, suffix) {
  return suffix ? `${name}_${suffix}` : name;
}

function mergeCounts(target, source) {
  Object.entries(source).forEach(([key, amount]) => increase(target, key, amount));
}

export function sumDays(days, fromDay, toDay) {
  const total = emptyDay();
  Object.entries(days).filter(([day]) => day >= fromDay && day <= toDay).forEach(([, facts]) => {
    ['answers', 'withLine', 'questionsAsked'].forEach((field) => { total[field] += facts[field]; });
    ['decided', 'against', 'ties', 'tiePairs', 'together', 'skills'].forEach((field) => mergeCounts(total[field], facts[field]));
    Object.keys(total.grilling).forEach((field) => { total.grilling[field] += facts.grilling[field]; });
  });
  return total;
}

function decisionsOf(lineRest) {
  const pattern = new RegExp(`(🔻\\s*)?${NAME_PATTERN}\\s*→`, 'gu');
  return [...lineRest.matchAll(pattern)]
    .filter((match) => !PLACEHOLDER_NAMES.has(match[2]))
    .map((match) => ({ key: keyOf(match[2], match[3]), isAgainst: Boolean(match[1]) }));
}

function tieNamesOf(line, knownNames) {
  const pattern = new RegExp(NAME_PATTERN, 'gu');
  const keys = [...line.matchAll(pattern)]
    .filter((match) => match[1].length >= 3 && !PLACEHOLDER_NAMES.has(match[1]))
    .filter((match) => match[2] || knownNames.has(match[1]))
    .map((match) => keyOf(match[1], match[2]));
  return [...new Set(keys)];
}

function grillingQuestionsOf(lines, tieWords) {
  const starts = lines.map((line, index) => (GRILLING_START.test(line) ? index : -1)).filter((index) => index >= 0);
  return starts.map((start, position) => {
    const end = position + 1 < starts.length ? starts[position + 1] : lines.length;
    const block = lines.slice(start, Math.min(end, start + MAXIMUM_BLOCK_LINES));
    const blockText = block.join('\n');
    const recommendedLine = block.map((line) => RECOMMENDED_LINE.exec(line)).find((match) => match);
    const numberMatch = /Q(\d+)/.exec(block[0]);
    return {
      number: numberMatch ? Number(numberMatch[1]) : null,
      recommended: recommendedLine ? recommendedLine[1].toLowerCase() : null,
      hasRecommendation: Boolean(recommendedLine),
      isNotDecided: tieWords.some((word) => blockText.toLowerCase().includes(word)),
      isSelfAnswered: SELF_ANSWERED.test(blockText),
    };
  });
}

function textBlocksOf(entry) {
  const content = entry.message?.content;
  const blocks = Array.isArray(content) ? content : [];
  return blocks.filter((block) => block && block.type === 'text' && typeof block.text === 'string' && block.text.trim());
}

function personTextOf(entry) {
  const content = entry.message?.content;
  const texts = typeof content === 'string' ? [content]
    : (Array.isArray(content) ? content.filter((block) => block && block.type === 'text').map((block) => block.text) : []);
  return texts.join('\n').trim();
}

function recordAssistant(entry, day, context, state) {
  const texts = textBlocksOf(entry);
  const isTurn = entry.message?.stop_reason === 'end_turn' && texts.length > 0;
  let hasLine = false;
  texts.forEach((block) => {
    const lines = block.text.split('\n');
    const firstLine = lines.find((line) => line.trim());
    const match = firstLine === undefined ? null : PRINCIPLES_LINE.exec(firstLine);
    if (match) {
      hasLine = true;
      const decisions = decisionsOf(match[1]);
      decisions.forEach((decision) => increase(decision.isAgainst ? day.against : day.decided, decision.key));
      const names = [...new Set(decisions.filter((decision) => !decision.isAgainst).map((decision) => decision.key))].sort();
      names.forEach((first, index) => names.slice(index + 1).forEach((second) => increase(day.together, `${first} + ${second}`)));
    }
    lines.filter((line) => context.tieWords.some((word) => line.toLowerCase().includes(word))).forEach((line) => {
      const names = tieNamesOf(line, context.knownNames);
      names.forEach((name) => increase(day.ties, name));
      if (names.length >= 2) {
        increase(day.tiePairs, names.slice(0, 2).sort().join(' × '));
      }
    });
    grillingQuestionsOf(lines, context.tieWords).forEach((question) => {
      day.grilling.questions += 1;
      day.grilling.withRecommendation += question.hasRecommendation ? 1 : 0;
      day.grilling.notDecided += question.isNotDecided ? 1 : 0;
      day.grilling.selfAnswered += question.isSelfAnswered ? 1 : 0;
      state.pending.push({ ...question, grilling: day.grilling });
    });
  });
  const lastBlockLines = isTurn ? texts[texts.length - 1].text.split('\n').filter((line) => line.trim()) : [];
  day.answers += isTurn ? 1 : 0;
  day.withLine += isTurn && hasLine ? 1 : 0;
  day.questionsAsked += lastBlockLines.length > 0 && QUESTION_ENDING.test(lastBlockLines[lastBlockLines.length - 1]) ? 1 : 0;
  const content = Array.isArray(entry.message?.content) ? entry.message.content : [];
  content.filter((block) => block && block.type === 'tool_use' && block.name === 'Skill' && block.input?.skill)
    .forEach((block) => increase(day.skills, block.input.skill));
}

function resolveChoices(text, state) {
  const numbered = new Map();
  [...text.matchAll(/q\s*(\d+)\s*[:\-–]?\s*([a-d])\b/gi)].forEach((match) => numbered.set(Number(match[1]), match[2].toLowerCase()));
  const bareMatch = /^\s*([a-d])\b/i.exec(text);
  const isBareAllowed = numbered.size === 0 && state.pending.length === 1 && bareMatch;
  state.pending.forEach((question) => {
    const numberedLetter = question.number === null ? undefined : numbered.get(question.number);
    const letter = numberedLetter || (isBareAllowed ? bareMatch[1].toLowerCase() : undefined);
    question.grilling.chosenRecommended += letter && letter === question.recommended ? 1 : 0;
    question.grilling.chosenOther += letter && letter !== question.recommended ? 1 : 0;
  });
  state.pending = [];
}

async function scanFile(filePath, project, folderName, context) {
  const state = { pending: [] };
  const lineReader = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  for await (const line of lineReader) {
    let entry = null;
    try {
      entry = line.includes('"assistant"') || line.includes('"user"') ? JSON.parse(line) : null;
    } catch {
      entry = null;
    }
    const isMainConversation = entry && !entry.isSidechain && (entry.type === 'assistant' || entry.type === 'user');
    const time = isMainConversation ? Date.parse(entry.timestamp) : NaN;
    if (isMainConversation && !Number.isNaN(time)) {
      project.name = entry.cwd ? basename(entry.cwd) : (project.name || folderName);
      const dayName = new Date(time).toISOString().slice(0, 10);
      project.days[dayName] = project.days[dayName] || emptyDay();
      if (entry.type === 'assistant') {
        recordAssistant(entry, project.days[dayName], context, state);
      } else {
        const text = personTextOf(entry);
        const isPerson = text !== '' && !IGNORED_PERSON_TEXTS.some((start) => text.startsWith(start));
        if (isPerson) {
          resolveChoices(text, state);
        }
      }
    }
  }
}

export async function readFacts({ projectsDirectory, tieWords, knownNames }) {
  const facts = {};
  const folders = existsSync(projectsDirectory)
    ? readdirSync(projectsDirectory, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name)
    : [];
  const context = { tieWords, knownNames };
  for (const folderName of folders) {
    const project = { name: folderName, days: {} };
    const transcripts = readdirSync(join(projectsDirectory, folderName)).filter((name) => name.endsWith('.jsonl'));
    for (const transcript of transcripts) {
      await scanFile(join(projectsDirectory, folderName, transcript), project, folderName, context);
    }
    facts[folderName] = project;
  }
  return facts;
}
