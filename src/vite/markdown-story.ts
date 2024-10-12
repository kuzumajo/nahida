import { Plugin } from "vite";

import { unified } from "unified";
import remarkParse from "remark-parse";
import { Heading, Paragraph, RootContent } from "mdast";

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

async function parseStoryParagraph(ctx: ParseContext, paragraph: Paragraph) {
  if (
    paragraph.children.length === 1 &&
    paragraph.children[0].type === "text"
  ) {
    const title = ctx.title;
    const text = paragraph.children[0].value;
    ctx.yield(`ctx.text(${JSON.stringify(title)}, ${JSON.stringify(text)})`);
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
