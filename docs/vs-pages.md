# Adding a "Hallstream vs …" page

The first page is `/vs/sl-live-stream/` (`src/data/vs/sl-live-stream.ts`). The template is `src/views/Vs.astro`, rendering a `VsAlternative` object (`src/data/vs.ts`). No vs page ships until every fact about the alternative has been researched.

## 1. Research the alternative

Pick it from the AEO spot-check prompts (`../marketing-aeo.md`): the tool answer engines name when someone asks for an alternative.

Each fact the page states about it needs:

- `text`: one plain sentence
- `source`: the URL it came from, preferably the alternative's own pricing, docs or terms page
- `checked`: the day you read it, as `YYYY-MM-DD`

The page needs these facts:

- `summary`: what it is, who it is for and what it costs
- `facts.cost`, `platform`, `score`, `graphics`, `cameras`, `sports`, `accounts` and `licence`: one per row of the head-to-head table
- `strengths`: what it does better than Hallstream. Write at least one, and be fair.
- `samePc`: whether it can run on the same PC as Hallstream
- `switchStep` (optional): anything to export or cancel before switching
- `fit` (optional): the opening answer's last sentence, on which club each one suits. Without it the page says Hallstream suits a club that wants the score on screen without anyone typing it, which is wrong for an alternative that also reads the console.
- `generic` (optional): which of the shared reasons in `alwaysStrengths` (`mac`, `cameras`, `sports`) hold for this alternative. All of them when absent. Write each strength as a condition ("You want…"), since the list opens with "Pick it if one of these is true for you".

The page prints the oldest `checked` date as "details checked on …" and links every fact to its source. When you cannot find a source for a fact, leave the page unbuilt. A guess does not go on it.

## 2. Add the data and the route

1. Put the object in `src/data/vs/<slug>.ts`, exporting a `VsAlternative`.
2. Add the route to `src/i18n/routes.ts`. The template is English only, so give `pt` the same path as `en` until a Portuguese version exists, and keep `indexed: true`.
3. Add the page, `src/pages/vs/<slug>.astro`:

   ```astro
   ---
   import Vs from "@/views/Vs.astro";
   import { alt } from "@/data/vs/<slug>";
   ---
   <Vs alt={alt} route="vs<Slug>" />
   ```

4. Add the path to `src/data/pageDates.ts`, a line to `public/llms.txt`, and a share image to `scripts/og.mjs` (`vs-<slug>-en.png`, using the guide template with "Hallstream vs <name>" as the title).
5. Add the link to the footer's Guides column and to the guide's Related guides list.

## 3. Check it

- `npm run build`, `npm test`, `npm run check:links`
- Read every fact against its source once more on the day you publish, and set `checked` to that day.
- Re-check the facts every quarter, with the AEO re-run. A price or a platform list goes stale first.
