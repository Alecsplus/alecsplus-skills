---
name: holo
description: Draw a hand-drawn schema (Excalidraw style, dark theme) that explains a piece of code, a document, the conversation or a sentence, so a human understands it at a glance. Use when the user runs it, asks for a schema, a diagram or a drawing of something, or says "holo".
---

# Holo

"Help me, Obi-Wan." A holo is a drawing that appears in the middle of the table and makes a thing understood at a glance. You write it as an `.excalidraw` file, by hand, element by element; the script beside this file draws it with rough.js, in a hand-drawn line and Excalifont letters, and gives you a PNG to look at.

## Steps

1. **Read the principles** in `THE-WAY.md`, next to this file. They decide every choice below; cite them by name when they do.
2. **Take the context**: what the user points at (code, a document, the conversation, a sentence). Find the one thing the holo must say, in one sentence, for someone who meets it for the first time (ONE_HOLO, PADAWAN). If the context holds two things, say so and draw two holos, one file each.
3. **Choose where it lands**: next to what it explains, as `<topic>.excalidraw` (for `checkout.ts` explain in the same folder, as `checkout.excalidraw` or `checkout-flow.excalidraw`). If it explains the conversation or nothing that lives in the repository, ask the place once, then never again in the session.
4. **Write the source** (format below). Place every element by hand: where things stand, what is aligned, what is left empty all mean something (EVERYTHING_MEANS). Colour says what a thing is, never what is pretty. An arrow carries a verb, and so does its width, its dashes, its colour; if the sentence reads without the arrow, leave the arrow out. Words are the reader's: full sentences where a label would need the code open beside it, labels where the reader already knows the words.
5. **Render and look**: run the script, then open the PNG with the Read tool and look at it as the reader would: text cut by a card, elements overlapping, an arrow pointing at nothing, a sentence too long for its line, a thing nobody meeting it first would understand. Fix the source and render again. Two passes at most: then hand it over and say what you still see (VISIBLE).
6. **Hand it over**: the sentence the holo says, and the paths of the `.excalidraw` and the `.svg`. The PNG was for looking: delete it unless the user wants it. The source stays beside the drawing so anyone changes it, in Excalidraw (open the file at excalidraw.com) or by asking you, and renders it again (NEVER_FINAL).

## Render

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/holo/render.mjs path/to/topic.excalidraw
```

It writes `topic.svg` (self-contained, fonts embedded; it shows in any Markdown with `![](topic.svg)`) and `topic.png` if it finds Chrome or Chromium in the PATH, or in `HOLO_BROWSER`. Without a browser it says so and writes only the SVG: then look at the SVG as text and check positions by the numbers. Nothing is installed and nothing goes over the network: rough.js and the font are in `vendor/`.

## The source

An `.excalidraw` file is JSON; Excalidraw opens it and fills in what is missing. The script reads these fields:

```json
{"type": "excalidraw", "version": 2, "source": "holo",
 "appState": {"viewBackgroundColor": "#121212"},
 "elements": [
  {"id": "t1", "type": "text", "x": 40, "y": 30, "width": 200, "height": 28,
   "text": "In the repo", "fontSize": 22, "fontFamily": 5, "textAlign": "left",
   "strokeColor": "#e6e6e6"},
  {"id": "r1", "type": "rectangle", "x": 30, "y": 90, "width": 370, "height": 92,
   "strokeColor": "#2b3340", "backgroundColor": "#2b3340", "fillStyle": "solid",
   "strokeWidth": 1, "roughness": 0, "roundness": {"type": 3}},
  {"id": "a1", "type": "arrow", "x": 215, "y": 182, "width": 0, "height": 28,
   "points": [[0, 0], [0, 28]], "strokeColor": "#9a9a9a", "strokeWidth": 1.5,
   "strokeStyle": "dotted", "endArrowhead": "arrow"},
  {"id": "l1", "type": "line", "x": 440, "y": 20, "width": 0, "height": 680,
   "points": [[0, 0], [0, 680]], "strokeColor": "#9a9a9a", "strokeWidth": 2}
 ]}
```

Shapes: `rectangle`, `ellipse`, `diamond`, `line`, `arrow`, `text`, `freedraw`. Common fields: `strokeColor`, `backgroundColor` (`"transparent"` for none), `fillStyle` (`solid`, `hachure`, `cross-hatch`, `zigzag`), `strokeWidth`, `strokeStyle` (`solid`, `dashed`, `dotted`), `roughness` (0 clean, 1 hand, 2 shaky), `opacity` (0–100), `angle` in radians, `seed` (any integer; keeps the strokes the same between renders). `points` of lines and arrows are relative to `x, y`; `roundness` `{"type": 3}` rounds a rectangle, `{"type": 2}` smooths a line. Text: `fontFamily` 5 is Excalifont (the default, what Excalidraw writes today), 1 Virgil, 2 Helvetica, 3 Cascadia; `textAlign` `left`, `center`, `right`; lines break on `\n`; a text starting with spaces keeps them, so a list indents by itself. Text width is about `0.55 × fontSize` per character, height `1.25 × fontSize` per line: use them to size cards.

## What makes it alive

A holo that works is a scene, not a map: it shows a thing happening, to someone. Before placing anything, find the contrast the reader needs (without and with, before and after, here and there) and give it the whole page: two columns, a thick faint divider, a short heading over each. Then the page is a grid: **rows are the moments or the items, columns are the two sides**, and the eye reads each row left to right. What fails at a glance is a page where each column is its own flowchart: nothing lines up, so nothing compares.

- **Dense.** Cards nearly as wide as their column, text at 18, cards cut to their text with 16 px of air; rows 20 to 30 px apart; the canvas ends where the content ends. A card holds a title and a short indented list, in the reader's words. Four to six cards on a page, not twelve.
- **Colour is the row.** One colour per row, the same on both sides, so left and right are recognised as the same thing in two states: `#5e2a4b` plum, `#0f3f1b` green, `#5a4512` olive, `#2b3340` slate, `#5a1f1f` wine, on `#121212`; `strokeColor` equal to `backgroundColor` so a card has no border; white `#ffffff` for words in cards, a lighter tint of the card colour for the small words.
- **Before is dimmed.** The side that is left behind has `opacity` 55 on cards and text; the side that stays is full. What was there and is gone is a dimmed card facing an empty slot.
- **Small words in the corner.** A 13 px word at the bottom right of a card (`every time`, `written once`, `16 Sep`) says when or how often, like a date on a note.
- **Arrows between columns, white, dotted, rare.** `strokeWidth` 2, `roughness` 1, horizontal, from a row's left card to its right card: dotted when a thing becomes the other, solid when it moves. Inside a column, none: the rows already order it. Cards keep `roughness` 0: a wobbly edge on a filled card leaves double lines.

