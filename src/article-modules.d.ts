declare module "virtual:article-metadata" {
  const metadata: {
    revision: string;
    articles: import("@/lib/articles/article-metadata").Article[];
  };
  export default metadata;
}
