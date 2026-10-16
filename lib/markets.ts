// Market scopes, shared by the assistant's scope picker and the knowledge base's market tags.
// "All markets" means no filter; a knowledge-base document tagged with no market applies to every market.
export const MARKETS = [
  "All markets", "Nigeria", "Ghana", "Kenya", "South Africa", "Côte d’Ivoire",
  "Egypt", "Morocco", "Senegal", "Ethiopia", "Tanzania"
] as const;

export const ALL_MARKETS = MARKETS[0];
export const COUNTRY_MARKETS = MARKETS.slice(1) as readonly string[];
