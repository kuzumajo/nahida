import { Plugin } from "vite";

import {
  Code,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Paragraph,
  RootContent,
  ThematicBreak,
} from "mdast";
import { remark } from "remark";
import remarkInlineLinks from "remark-inline-links";
import { Command } from "../pages/game";

const s = JSON.stringify;
function ss(x: any): string {
  return typeof x === "string"
    ? x.startsWith("\0")
      ? x.slice(1)
      : s(x)
    : Array.isArray(x)
    ? "[" + x.map((x) => ss(x)).join(",") + "]"
    : "{" +
      Object.entries(x)
        .map(([k, v]) => `${k}:${ss(v)}`)
        .join(",") +
      "}";
}

type Selection = {
  text: string;
  action: string[];
};

function createParseContext() {
  const codes = [] as string[];
  const spines = [] as string[];
  const imports = [] as string[];
  const resources = [] as string[];

  return {
    title: "",
    command: {} as Command,
    selections: [] as Selection[],

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
    } else if (src === "#noskip") {
      ctx.command.n = 1;
    } else {
      throw new Error(`Unknown command: ${src}`);
    }
  }
  // BGM
  else if (["m", "bgm"].includes(name)) {
    if (ctx.command.m) throw new TypeError("Too many BGM in paragraph");
    if (src === "#mute") {
      ctx.code(`ctx.sys.audio.pauseBgm();`);
    } else {
      ctx.command.m = ctx.resource(src);
    }
  }
  // Voice
  else if (["v", "voice"].includes(name)) {
    if (ctx.command.v) throw new TypeError("Too many vocal binded to text");
    ctx.command.v = ctx.resource(src);
  }
  // Sound Effects
  else if (["x", "sfx"].includes(name)) {
    if (!ctx.command.x) ctx.command.x = [];
    ctx.command.x.push(ctx.resource(src));
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
  } else if (["o", "video"].includes(name)) {
    if (ctx.command.o) throw new TypeError("Too many video in paragraph");
    ctx.command.o = ctx.resource(src);
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
    if (src.startsWith("#")) {
      ctx.code(`return ${s(src.slice(1))};`);
    } else {
      ctx.code(`return yield *${ctx.include(src)}(ctx);`);
    }
  } else if (alt === "jump") {
    if (src.startsWith("#"))
      throw new TypeError("You cannot jump to another chapter");
    ctx.code(`yield *${ctx.include(src)}(ctx);`);
  } else {
    throw new Error(`Unknown jump command: ${alt}`);
  }
}
function parseStoryParagraph(ctx: ParseContext, paragraph: Paragraph) {
  let tmp = "";
  const text = [] as string[];
  ctx.command = {};
  for (const child of paragraph.children) {
    if (child.type === "text") {
      tmp += child.value;
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
    if (child.type === "inlineCode") {
      if (tmp) text.push(tmp);
      text.push(`\0${child.value}`);
      tmp = "";
      continue;
    }
  }
  if (tmp) text.push(tmp);
  if (text.length === 1 && !text[0].startsWith("\0")) {
    if (text[0].trim()) {
      ctx.command.t = { t: text[0].trim() };
      if (ctx.title) ctx.command.t.l = ctx.title;
    }
  } else if (text.length > 0) {
    ctx.command.t = {
      t: "\0(" + text.map((x) => ss(x)).join("+") + ").trim()",
    };
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
function parseStoryListItem(ctx: ParseContext, listItem: ListItem) {
  if (listItem.children.length !== 1)
    throw new Error("ListItem must contain exactly one paragraph");
  const para = listItem.children[0];
  if (para.type !== "paragraph")
    throw new Error("ListItem must contain exactly one paragraph");

  const selection = <Selection>{ text: "", action: [] };
  ctx.selections.push(selection);

  for (const child of para.children) {
    if (child.type === "text") {
      selection.text += child.value;
    } else if (child.type === "link") {
      const alt = child.children
        .filter((x) => x.type === "text")
        .map((x) => x.value)
        .join("");
      if (alt === "next") {
        if (child.url.startsWith("#")) {
          selection.action.push(`return ${s(child.url.slice(1))}`);
        } else {
          selection.action.push(
            `return yield *${ctx.include(child.url)}(ctx);`
          );
        }
      } else if (alt === "jump") {
        if (child.url.startsWith("#"))
          throw new TypeError("Cannot jump to another chapter");
        selection.action.push(`yield *${ctx.include(child.url)}(ctx);`);
      }
    } else if (child.type === "inlineCode") {
      selection.action.push(child.value);
    }
  }

  selection.text = selection.text.trim();
}
function parseStoryList(ctx: ParseContext, list: List) {
  ctx.selections = [];
  for (const child of list.children) {
    parseStoryListItem(ctx, child);
  }
  ctx.yield(`ctx.select([${ctx.selections.map((x) => s(x.text)).join(", ")}])`);
  if (ctx.selections.some((x) => x.action.length > 0)) {
    ctx.code(`switch (ctx.selection) {`);
    ctx.selections.forEach((selection, i) => {
      ctx.code(`case ${i}: {`);
      for (const action of selection.action) {
        ctx.code(action);
      }
      ctx.code("break; }");
    });
    ctx.code(`}`);
  }
}
function parseStoryCode(ctx: ParseContext, code: Code) {
  ctx.code(code.value);
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
    if (content.type === "list" && !content.ordered) {
      parseStoryList(ctx, content);
      continue;
    }
    if (content.type === "code") {
      parseStoryCode(ctx, content);
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
