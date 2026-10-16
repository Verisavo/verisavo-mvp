-- Custom SQL migration file, put your code below! --
-- pgvector stores the knowledge-base embeddings (M2). Supabase keeps extensions in the "extensions" schema.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
