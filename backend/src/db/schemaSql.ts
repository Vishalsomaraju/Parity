// Parity PostgreSQL + pgvector Database Schema
export const SCHEMA_SQL = `-- Parity Database Schema (PostgreSQL + pgvector)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  document_type VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  page_count INT NOT NULL DEFAULT 1,
  clause_count INT NOT NULL DEFAULT 0,
  error_message TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark Corpus Table
CREATE TABLE IF NOT EXISTS benchmark_clauses (
  id VARCHAR(64) PRIMARY KEY,
  document_type VARCHAR(64) NOT NULL,
  clause_type VARCHAR(64) NOT NULL,
  reference_text TEXT NOT NULL,
  plain_language_meaning TEXT NOT NULL,
  common_risk_patterns JSONB DEFAULT '[]'::jsonb,
  source_attribution TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Cosine Index on Benchmark Embeddings
CREATE INDEX IF NOT EXISTS idx_benchmarks_embedding_hnsw
ON benchmark_clauses
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Extracted & Scored Clauses Table
CREATE TABLE IF NOT EXISTS clauses (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number INT NOT NULL DEFAULT 1,
  section_title VARCHAR(255),
  clause_index INT NOT NULL,
  clause_type VARCHAR(64) NOT NULL,
  clause_text TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  embedding vector(768),
  similarity_score NUMERIC(5,4),
  nearest_benchmark_id VARCHAR(64) REFERENCES benchmark_clauses(id),
  risk_tier VARCHAR(32),
  risk_explanation TEXT,
  plain_meaning TEXT,
  why_it_matters TEXT,
  reason_codes JSONB DEFAULT '[]'::jsonb,
  evidence_status VARCHAR(32) DEFAULT 'grounded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clauses_document_id ON clauses(document_id);
CREATE INDEX IF NOT EXISTS idx_clauses_hash ON clauses(content_hash);

-- Fine Print, Translated Table
CREATE TABLE IF NOT EXISTS fine_print (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  tier VARCHAR(32) NOT NULL,
  related_clause_index INT NOT NULL,
  related_clause_type VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Obligations Table
CREATE TABLE IF NOT EXISTS obligations (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  party VARCHAR(32) NOT NULL, -- 'your' or 'their'
  description TEXT NOT NULL,
  clause_index INT,
  is_critical BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Timeline Milestones Table
CREATE TABLE IF NOT EXISTS timelines (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  milestone VARCHAR(255) NOT NULL,
  timing VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'explicit_date', 'duration', 'inferred'
  description TEXT NOT NULL,
  relative_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Key Terms Table
CREATE TABLE IF NOT EXISTS key_terms (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE UNIQUE,
  parties JSONB DEFAULT '[]'::jsonb,
  duration TEXT,
  payment TEXT,
  notice_period TEXT,
  penalties TEXT,
  renewal TEXT,
  jurisdiction TEXT,
  deposit TEXT,
  important_dates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comparison Results Table
CREATE TABLE IF NOT EXISTS comparison_results (
  id VARCHAR(64) PRIMARY KEY,
  document_a_id VARCHAR(64) NOT NULL,
  document_b_id VARCHAR(64) NOT NULL,
  label_a VARCHAR(255) NOT NULL,
  label_b VARCHAR(255) NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  summary JSONB NOT NULL,
  topics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contextual Q&A Audit Log
CREATE TABLE IF NOT EXISTS qa_interactions (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status VARCHAR(32) NOT NULL,
  supporting_clause_id VARCHAR(64),
  page_number INT,
  verbatim_quote TEXT,
  limitation_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fine_print_document_id ON fine_print(document_id);
CREATE INDEX IF NOT EXISTS idx_obligations_document_id ON obligations(document_id);
CREATE INDEX IF NOT EXISTS idx_timelines_document_id ON timelines(document_id);
CREATE INDEX IF NOT EXISTS idx_comparison_results_docs ON comparison_results(document_a_id, document_b_id);
CREATE INDEX IF NOT EXISTS idx_qa_interactions_document_id ON qa_interactions(document_id);
`;
