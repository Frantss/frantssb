import { sql, type SQLWrapper } from "drizzle-orm";

type FullTextConfig = string | SQLWrapper;
type WeightedText = { text: string | SQLWrapper; weight: "A" | "B" | "C" | "D" };

export function db_fullTextVector(
  config: FullTextConfig,
  fields: [WeightedText, ...WeightedText[]],
) {
  return sql.join(
    fields.map(
      ({ text, weight }) => sql`setweight(to_tsvector(${config}::regconfig, ${text}), ${weight})`,
    ),
    sql` || `,
  );
}

export function db_fullTextQuery(config: FullTextConfig, text: string) {
  return sql`websearch_to_tsquery(${config}::regconfig, ${text})`;
}

export function db_fullTextMatches(vector: SQLWrapper, query: SQLWrapper) {
  return sql<boolean>`${vector} @@ ${query}`;
}

export function db_fullTextRank(vector: SQLWrapper, query: SQLWrapper) {
  return sql<number>`ts_rank(${vector}, ${query})`;
}
