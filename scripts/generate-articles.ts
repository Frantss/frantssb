import { article_generate } from "@/lib/articles/article-generate";

const { manifest } = await article_generate();
console.log(`Generated ${manifest.articles.length} article(s), revision ${manifest.revision}.`);
