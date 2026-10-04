import { createHash } from "node:crypto";
import * as v from "valibot";

const nonempty = v.pipe(
  v.string(),
  v.minLength(1),
  v.check((value) => value.trim().length > 0),
);
const publishedDate = v.pipe(
  v.string(),
  v.regex(/^\d{4}\.\d{2}\.\d{2}$/),
  v.check((date) => {
    const iso = date.replaceAll(".", "-");
    const parsed = new Date(`${iso}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso;
  }, "Expected a calendar date"),
);

export const article_indexEntrySchema = v.strictObject({
  slug: nonempty,
  title: nonempty,
  description: nonempty,
  date: publishedDate,
  tags: v.array(nonempty),
  keywords: v.array(nonempty),
  language: v.picklist(["en", "es"]),
  bodyText: v.string(),
});

const manifestSchema = v.strictObject({
  version: v.literal(1),
  revision: v.pipe(v.string(), v.regex(/^[a-f0-9]{64}$/)),
  articles: v.array(article_indexEntrySchema),
});

export type ArticleIndexEntry = v.InferOutput<typeof article_indexEntrySchema>;
export type ArticleManifest = v.InferOutput<typeof manifestSchema>;

export function article_createManifest(input: ArticleIndexEntry[]): ArticleManifest {
  const articles = v
    .parse(v.array(article_indexEntrySchema), input)
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  if (new Set(articles.map(({ slug }) => slug)).size !== articles.length) {
    throw new Error("Duplicate article slug");
  }
  const revision = createHash("sha256")
    .update(JSON.stringify({ version: 1, articles }))
    .digest("hex");
  return { version: 1, revision, articles };
}

export function article_parseManifest(input: unknown): ArticleManifest {
  const manifest = v.parse(manifestSchema, input);
  const canonical = article_createManifest(manifest.articles);
  if (manifest.revision !== canonical.revision) throw new Error("Article revision mismatch");
  return canonical;
}
