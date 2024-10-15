import { Plugin } from "vite";

import {
  Heading,
  Image,
  Link,
  Paragraph,
  RootContent,
  ThematicBreak,
} from "mdast";
import { remark } from "remark";
import remarkInlineLinks from "remark-inline-links";
import { Command } from "../pages/game";

const s = JSON.stringify;
function ss(x: any): string {
  return Array.isArray(x)
    ? "[" + x.map((x) => ss(x)).join(",") + "]"
    : "{" +
        Object.entries(x)
          .map(([k, v]) =>
            typeof v === "string"
              ? v.startsWith("\0")
                ? `${k}:${v.slice(1)}`
                : `${k}:${s(v)}`
              : `${k}:${ss(v)}`
          )
          .join(",") +
        "}";
}

function createParseContext() {
  const codes = [] as string[];
  const spines = [] as string[];
  const imports = [] as string[];
  const resources = [] as string[];

  return {
    title: "",
    command: {} as Command,

    include(source: string) {
      const index = imports.indexOf(source);
      if (index > -1) return `__i_${index}`;
      else return `__i_${imports.push(source) - 1}`;
    },

    resource(source: string) {
      const name = this.include(`${source}?url`);
      const index = resources.indexOf(name);
      if (index > -1) return `\0_items[${index}]`;
      else return `\0_items[${resources.push(name) - 1}]`;
    },

    spine(name: string) {
      const index = spines.indexOf(name);
      if (index > -1) return `\0_spines[${index}]`;
      else return `\0_spines[${spines.push(name) - 1}]`;
    },

    yield(code: string) {
      codes.push(`yield ${code};`);
    },

    code(code: string) {
      codes.push(code);
    },

    codes() {
      return [
        ...imports.map((x, i) => `import __i_${i} from "${x}";`),
        `export default async function* (ctx) {`,
        `const [_items, _spines] = await ctx.load([${resources.join(
          ", "
        )}], [${spines.map((x) => s(x)).join(", ")}]);`,
        ...codes,
        `};`,
      ].join("\n");
    },
  };
}

type ParseContext = ReturnType<typeof createParseContext>;

/** `![alt](src "title")` */
function parseStoryImage(ctx: ParseContext, image: Image) {
  const alt = image.alt || "";
  const src = image.url;
  const title = image.title || "";
  const [name, ...alts] = alt.split(/\s+/);

  // Commands
  if (["c", "con", "console"].includes(name)) {
    if (src === "#wait") {
      if (!title) throw new TypeError("#wait must have one param");
      ctx.yield(`ctx.wait(${+title})`);
    } else if (src === "#show") {
      ctx.code(`ctx.sys.console.show();`);
    } else if (src === "#hide") {
      ctx.code(`ctx.sys.console.hide();`);
    } else {
      throw new Error(`Unknown command: ${src}`);
    }
  }
  // BGM
  else if (["m", "bgm"].includes(name)) {
    if (ctx.command.m) throw new TypeError("Too many BGM in paragraph");
    ctx.command.m = ctx.resource(src);
  }
  // Voice
  else if (["v", "voice"].includes(name)) {
    if (ctx.command.v) throw new TypeError("Too many vocal binded to text");
    ctx.command.v = ctx.resource(src);
  }
  // Background
  else if (["b", "bgm"].includes(name)) {
    if (ctx.command.b) throw new TypeError("Too many backgrounds in paragraph");
    const animates = alts.join(" ");
    const transitions = title.split(/\s+/).join(" ");
    const image = src.startsWith("#") ? src : ctx.resource(src);
    ctx.command.b = { s: image };
    if (animates) ctx.command.b.a = animates;
    if (transitions) ctx.command.b.t = transitions;
  }
  // Spine
  else if (["f", "fig", "spine"].includes(name)) {
    if (!ctx.command.f) ctx.command.f = [];
    if (!src.startsWith("#")) throw new TypeError("Spine must starts with #");
    const name = src.slice(1);
    const model = ctx.spine(name);
    const animations = alts.join(" ");
    const transitions = title.split(/\s+/).join(" ");
    const spine: (typeof ctx.command.f)[number] = { m: model as any };
    if (animations) spine.a = animations;
    if (transitions) spine.t = transitions;
    ctx.command.f.push(spine);
  }
  // Unknown
  else {
    throw new Error(`Unknown command: ${alt}`);
  }
}
function parseStoryLink(ctx: ParseContext, link: Link) {
  const alt = link.children
    .filter((x) => x.type === "text")
    .map((x) => x.value)
    .join("");
  const src = link.url;
  if (alt === "next") {
    if (!src.startsWith("#")) throw new TypeError("Next chapter must use hash");
    ctx.code(`return ${JSON.stringify(src.slice(1))};`);
  } else if (alt === "jump") {
    const jump = ctx.include(src);
    ctx.code(`yield *${jump}(ctx);`);
  } else {
    throw new Error(`Unknown jump command: ${alt}`);
  }
}
function parseStoryParagraph(ctx: ParseContext, paragraph: Paragraph) {
  let text = "";
  ctx.command = {};
  for (const child of paragraph.children) {
    if (child.type === "text") {
      text += child.value;
      continue;
    }
    if (child.type === "image") {
      parseStoryImage(ctx, child);
      continue;
    }
    if (child.type === "link") {
      parseStoryLink(ctx, child);
      continue;
    }
  }
  text = text.trim();
  if (text) {
    ctx.command.t = { t: text };
    if (ctx.title) ctx.command.t.l = ctx.title;
  }
  if (s(ctx.command) !== "{}") {
    ctx.yield(`ctx.exec(${ss(ctx.command)})`);
  }
}
function parseStoryHeading(ctx: ParseContext, heading: Heading) {
  if (heading.children.length === 1 && heading.children[0].type === "text") {
    ctx.title = heading.children[0].value;
  } else {
    throw new Error("Invalid heading");
  }
}
function parseStoryThematicBreak(
  ctx: ParseContext,
  _thematicBreak: ThematicBreak
) {
  ctx.title = "";
}
function parseStoryContents(ctx: ParseContext, contents: RootContent[]) {
  for (const content of contents) {
    if (content.type === "paragraph") {
      parseStoryParagraph(ctx, content);
      continue;
    }
    if (content.type === "heading") {
      parseStoryHeading(ctx, content);
      continue;
    }
    if (content.type === "thematicBreak") {
      parseStoryThematicBreak(ctx, content);
      continue;
    }
  }
}

function collectAsStory(ctx: ParseContext) {
  return ctx.codes();
}

async function parseStory(markdown: string) {
  const vfile = await remark().use(remarkInlineLinks).process(markdown);
  const ast = remark().parse(vfile);
  const ctx = createParseContext();
  parseStoryContents(ctx, ast.children);
  return collectAsStory(ctx);
}

export default function markdownStory(): Plugin {
  return {
    name: "markdown-story",
    async transform(code, id) {
      if (/\.md$/.test(id)) {
        return await parseStory(code);
      }
    },
  };
}
