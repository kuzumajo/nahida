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

const s = JSON.stringify;

function createParseContext() {
  const includes = [] as string[];
  const codes = [] as string[];
  const resources = [] as string[];

  const importMap = new Map<string, string>();
  const resourceMap = new Map<string, string>();

  return {
    title: "",
    vocal: "",

    include(source: string) {
      if (importMap.has(source)) {
        return importMap.get(source)!;
      }
      const id = `story_${includes.length}`;
      includes.push(source);
      importMap.set(source, id);
      return id;
    },

    resource(source: string) {
      if (resourceMap.has(source)) {
        return resourceMap.get(source)!;
      }
      const item = this.include(source);
      const id = `item[${resources.length}]`;
      resources.push(item);
      resourceMap.set(source, id);
      return id;
    },

    yield(code: string) {
      codes.push(`yield ${code};`);
    },

    code(code: string) {
      codes.push(code);
    },

    codes() {
      if (resources.length > 0) {
        return [
          `const item = await ctx.load([${resources.join(", ")}]);`,
          ...codes,
        ];
      } else {
        return codes;
      }
    },

    includes() {
      return includes.map(
        (source, index) => `import story_${index} from "${source}";`
      );
    },
  };
}

type ParseContext = ReturnType<typeof createParseContext>;

function parseStoryImage(ctx: ParseContext, image: Image) {
  // ![alt](src "title")
  const alt = image.alt || "";
  const src = image.url;
  const title = image.title || "";

  if (alt === "c") {
    if (src === "#wait") {
      if (!title) throw new TypeError("#wait must have one param");
      ctx.yield(`ctx.console.wait(${+title})`);
    } else if (src === "#show") {
      ctx.code(`ctx.console.show();`);
    } else if (src === "#hide") {
      ctx.code(`ctx.console.hide();`);
    } else {
      throw new Error(`Unknown console command: ${src}`);
    }
  } else if (alt.startsWith("m")) {
    const audio = ctx.resource(`${src}?url`);
    ctx.code(`ctx.audio.playBgm(${audio});`);
  } else if (alt.startsWith("v")) {
    if (ctx.vocal) throw new TypeError("Too many vocal binded to text");
    ctx.vocal = ctx.resource(`${src}?url`);
  } else if (alt.startsWith("b")) {
    const animates = alt.split(/\s+/).slice(1).join(" ");
    const transitions = title.split(/\s+/).join(" ");
    const image = src.startsWith("#") ? s(src) : ctx.resource(`${src}?url`);
    ctx.yield(`ctx.bg.change(${image}, ${s(animates)}, ${s(transitions)})`);
  } else {
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
    if (ctx.vocal) {
      ctx.code(`ctx.audio.playVocal(${ctx.vocal});`);
      ctx.vocal = "";
    }
    ctx.yield(`ctx.console.text(${s(ctx.title)}, ${s(text)})`);
    ctx.yield(`ctx.console.idle()`);
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
  return [
    ...ctx.includes(),
    `export default async function* (ctx) {`,
    ...ctx.codes(),
    `}`,
  ].join("\n");
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
