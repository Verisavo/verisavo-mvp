// Market scopes, shared by the assistant's scope picker and the knowledge base's market tags.
// "All markets" means no filter; a knowledge-base document tagged with no market applies to every market.
export const MARKETS = [
  "All markets", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
  "Central African Republic", "Chad", "Comoros", "Côte d’Ivoire", "DR Congo", "Djibouti", "Egypt", "Equatorial Guinea",
  "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia",
  "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria",
  "Republic of the Congo", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia",
  "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
] as const;

export const ALL_MARKETS = MARKETS[0];
export const COUNTRY_MARKETS = MARKETS.slice(1) as readonly string[];

// Industry sectors a knowledge-base document can be tagged with. A label for admins: it doesn't change the answers.
export const GENRES = [
  "Agriculture", "Food & FMCG", "Retail", "Finance & Fintech", "Telecoms & Technology", "Health", "Energy",
  "Transport & Logistics", "Real Estate", "Education", "Other"
] as const;
