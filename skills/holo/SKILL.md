---
name: holo
description: Draw a hand-drawn schema (Excalidraw style, dark theme) that explains a piece of code, a document, an architecture, the conversation or a sentence, so a human understands it at a glance. Use when the user runs it, asks for a schema, a diagram or a drawing of something, or says "holo".
---

# Holo

"Help me, Obi-Wan." A holo is a drawing that appears in the middle of the table and makes a thing understood at a glance. You build it with a short script on the helper module beside this file, which writes an `.excalidraw` file; `render.mjs` draws it with rough.js, in a hand-drawn line and Excalifont letters, and gives you a PNG to look at.

## Steps

1. **Read the principles** in `THE-WAY.md`, next to this file. They decide every choice below; cite them by name when they do.
2. **Say what it must make understood**, in one sentence, for someone who meets the thing for the first time (ONE_HOLO, PADAWAN). Then pick the form that says it, from the forms below. Two things to understand are two holos, one file each.
3. **Choose where it lands**: next to what it explains, as `<topic>.excalidraw` (for `checkout.ts`, in the same folder, as `checkout.excalidraw` or `checkout-flow.excalidraw`). If it explains the conversation or nothing that lives in the repository, ask the place once, then never again in the session.
4. **Write the script** (`<topic>.holo.mjs` beside the drawing) with the helper, and run it. Place every element by hand: where a thing stands, what is aligned, what is left empty all mean something (EVERYTHING_MEANS). Words are the reader's, and few: the drawing must work with them covered (AT_A_GLANCE).
5. **Look before you hand it over**: open the PNG with the Read tool and look for, on purpose: text wider than its box; boxes overlapping; an element crossing a divider; a thing inside a fence that should be outside; a corner word without room; an arrow pointing at nothing. Then the covered-words test: hide every word in your mind and ask whether the drawing still says its thing. Fix the script and render again. Two passes are normal (NEVER_FINAL).
6. **Hand it over** with one sentence, "this drawing says that …", the paths of the `.excalidraw` and the `.svg`, and one question: "does it get looked at, or read?". The reader decides whether it works, not you: expect to redo it. The PNG was for looking: delete it unless the user wants it. The source stays beside the drawing so anyone changes it, in Excalidraw (open the file at excalidraw.com), by editing the script, or by asking you.

## Forms

First what must be understood, then the form. One thing to understand = one form.

- **A change** (before and after, without and with): two columns, the same rows on both sides, a thick faint divider, the side left behind dimmed (opacity 55). The eye reads each row left to right and sees what changed.
- **A system** (what is there and how it is connected): boxes, arrows each carrying a verb, boundaries. Few boxes, few arrows.
- **Belonging** (who holds what, what lives where): fences. Every piece sits inside the fence of whoever holds it, and the meaning is in the position, inside or outside; colour confirms it. Outside every fence means nobody's.
- **N variants compared**: the same scene repeated on the page, the same pieces in the same place in every variant, so only what differs differs and the eye finds it without reading. A grid of cards with words in them is a table: HTML makes tables, a holo does not.
- **Steps in time**: one row per moment, left to right.

## Marks with a fixed meaning

Offer them as a vocabulary; a reader learns them once.

- **Dashed box** = appears by itself when needed (a standby, one more machine in the peak).
- **Person figure** = someone who has to be there, with when beside it ("at night: nobody").
- **Fence** = who hosts or keeps alive: low-opacity fill plus border, label top left. Outside every fence = nobody's.
- **Small corner word** on a card = when, or how often (`every time`, `written once`, `16 Sep`).
- **Dotted arrow** = becomes, reads; **solid arrow** = moves, sends. Arrows white, 2 px, rare: inside a column the rows already order things.

## Colour

Colour says one thing per drawing, and only one: who (two parties: neutral colours, say blue and ochre), or a judgement (good, bad, risk: green and red), or a state. Never two: if colour says who, red cannot also say danger. Pick the meaning from the form, and when it is not obvious from the drawing itself, say it in a legend at the top, before the drawing: one sample per colour, dash or figure, with the sentence of what it means. When colour is only the identity of a row, no legend.

Starting values on `#121212`: cards `#5e2a4b` plum, `#0f3f1b` green, `#5a4512` olive, `#2b3340` slate, `#5a1f1f` wine; fences `#1f4e8c` blue and `#8a5a0a` ochre; white `#ffffff` for words in cards, a lighter tint of the card's colour for corner words, `#9a9a9a` for notes. Cards have `strokeColor` equal to `backgroundColor`, no visible border, `roughness` 0: a wobbly edge on a filled card leaves double lines. Text at 18 or more, cards cut to their text, the canvas ends where the content ends.

## The script

```js
import { holo } from '${CLAUDE_PLUGIN_ROOT}/skills/holo/holo.mjs';

const page = holo();                                   // background #121212
page.legend(20, 20, [
  { sample: 'fence', color: '#1f4e8c', text: 'blue fence: the provider keeps it alive' },
  { sample: 'dashed', text: 'appears by itself in a peak or a failure' },
]);
page.fence(20, 120, 420, 360, 'the provider keeps alive', { color: '#1f4e8c' });
page.card(50, 170, 360, 'entry and balancer', { color: '#1f4e8c' });
page.slot(50, 240, 360, 50, 'one more, by itself');
page.person(50, 500, 'one person, by day');
page.arrow([440, 300], [520, 300], { dotted: true, label: 'reads' });
page.save('topic.excalidraw', { render: true });       // writes topic.excalidraw, topic.svg, topic.png
```

`page.measure(text, size)` gives the width and height a text will take (0.55 × size per character, 1.25 × size per line), to size what holds it. `page.card` returns its height, so the next element can sit under it. `page.text`, `page.line` and `page.fence` take `opacity` for what is left behind or dimmed.

## Render by hand

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/holo/render.mjs path/to/topic.excalidraw
```

It writes `topic.svg` (self-contained, fonts embedded; it shows in any Markdown with `![](topic.svg)`) and `topic.png` if it finds Chrome or Chromium in the PATH or in `HOLO_BROWSER`. Without a browser it says so and writes only the SVG: then look at the SVG as text and check positions by the numbers. Nothing is installed and nothing goes over the network: rough.js and the fonts are in `vendor/`.

The `.excalidraw` file is plain Excalidraw JSON (`rectangle`, `ellipse`, `diamond`, `line`, `arrow`, `text`, `freedraw`; `fontFamily` 5 is Excalifont; `points` relative to `x, y`; `roundness {"type": 3}` rounds a rectangle), so a file drawn in Excalidraw renders the same way, and one written by the script opens in Excalidraw.
