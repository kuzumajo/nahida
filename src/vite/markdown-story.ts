import { Plugin } from "vite";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { Heading, Image, Paragraph, RootContent, ThematicBreak } from "mdast";

function createParseContext() {
  const includes = [] as string[];
  const codes = [] as string[];

  return {
    title: "",
    vocal: "",

    include(source: string) {
      const id = includes.length;
      includes.push(source);
      return `story_${id}`;
    },

    yield(code: string) {
      codes.push(`yield ${code};`);
    },

    code(code: string) {
      codes.push(code);
    },

    codes() {
      return codes;
    },

    includes() {
      return includes.map(
        (source, index) => `import story_${index} from "${source}";`
      );
    },
  };
}

type ParseContext = ReturnType<typeof createParseContext>;

async function parseStoryImage(ctx: ParseContext, image: Image) {
  // ![alt](src "title")
  const alt = image.alt || "";
  const src = image.url;
  const title = image.title || "";

  if (alt === "c") {
    if (src === "#wait") {
      if (!title) throw new TypeError("#wait must have one param");
      ctx.yield(`ctx.console.wait(${title})`);
    } else if (src === "#show") {
      ctx.yield(`ctx.console.show()`);
    } else if (src === "#hide") {
      ctx.yield(`ctx.console.hide()`);
    } else {
      throw new Error(`Unknown console command: ${src}`);
    }
  } else {
    throw new Error(`Unknown command: ${alt}`);
  }
}
async function parseStoryParagraph(ctx: ParseContext, paragraph: Paragraph) {
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
  }
  text = text.trim();
  if (text) {
    ctx.yield(
      `ctx.console.text(${JSON.stringify(ctx.title)}, ${JSON.stringify(text)})`
    );
    ctx.yield(`ctx.console.idle()`);
  }
}
async function parseStoryHeading(ctx: ParseContext, heading: Heading) {
  if (heading.children.length === 1 && heading.children[0].type === "text") {
    ctx.title = heading.children[0].value;
  } else {
    throw new Error("Invalid heading");
  }
}
async function parseStoryThematicBreak(
  ctx: ParseContext,
  _thematicBreak: ThematicBreak
) {
  ctx.title = "";
}
async function parseStoryContents(ctx: ParseContext, contents: RootContent[]) {
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

async function collectAsStory(ctx: ParseContext) {
  return [
    ...ctx.includes(),
    `export default async function* (ctx) {`,
    ...ctx.codes(),
    `}`,
  ].join("\n");
}

function parseStory(markdown: string) {
  const ast = unified().use(remarkParse).parse(markdown);
  const ctx = createParseContext();
  parseStoryContents(ctx, ast.children);
  return collectAsStory(ctx);
}

export default function markdownStory(): Plugin {
  return {
    name: "markdown-story",
    transform(code, id) {
      if (/\.md$/.test(id)) {
        return parseStory(code);
      }
    },
  };
}
