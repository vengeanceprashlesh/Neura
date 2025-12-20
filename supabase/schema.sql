-- =============================================
-- Neura AI App Builder - Supabase Schema
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Enable the pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- Projects Table
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id TEXT NOT NULL DEFAULT 'anonymous',
    name TEXT NOT NULL,
    description TEXT,
    spec JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- =============================================
-- Project Files Table
-- =============================================
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, path)
);

-- Index for faster file lookups
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- =============================================
-- Frontend Templates Table (for RAG)
-- =============================================
CREATE TABLE IF NOT EXISTS frontend_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('layout', 'component', 'page')),
    tags TEXT[] DEFAULT '{}',
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_frontend_templates_embedding ON frontend_templates 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- Backend Templates Table (for RAG)
-- =============================================
CREATE TABLE IF NOT EXISTS backend_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('route', 'schema')),
    tags TEXT[] DEFAULT '{}',
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_backend_templates_embedding ON backend_templates 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================
-- RPC Functions for Vector Search
-- =============================================

-- Match frontend templates by embedding similarity
CREATE OR REPLACE FUNCTION match_frontend_templates(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    code TEXT,
    kind TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ft.id,
        ft.name,
        ft.description,
        ft.code,
        ft.kind,
        1 - (ft.embedding <=> query_embedding) AS similarity
    FROM frontend_templates ft
    WHERE ft.embedding IS NOT NULL
      AND 1 - (ft.embedding <=> query_embedding) > match_threshold
    ORDER BY ft.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Match backend templates by embedding similarity
CREATE OR REPLACE FUNCTION match_backend_templates(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    code TEXT,
    kind TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bt.id,
        bt.name,
        bt.description,
        bt.code,
        bt.kind,
        1 - (bt.embedding <=> query_embedding) AS similarity
    FROM backend_templates bt
    WHERE bt.embedding IS NOT NULL
      AND 1 - (bt.embedding <=> query_embedding) > match_threshold
    ORDER BY bt.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE frontend_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_templates ENABLE ROW LEVEL SECURITY;

-- Projects: Owner can do everything, others can read public projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (true); -- For now, allow all reads

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (true);

-- Project files: Same as projects
CREATE POLICY "Users can view project files" ON project_files
    FOR SELECT USING (true);

CREATE POLICY "Users can insert project files" ON project_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update project files" ON project_files
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete project files" ON project_files
    FOR DELETE USING (true);

-- Templates: Read-only for all
CREATE POLICY "Everyone can read frontend templates" ON frontend_templates
    FOR SELECT USING (true);

CREATE POLICY "Everyone can read backend templates" ON backend_templates
    FOR SELECT USING (true);

-- =============================================
-- Updated At Trigger
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_frontend_templates_updated_at
    BEFORE UPDATE ON frontend_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_backend_templates_updated_at
    BEFORE UPDATE ON backend_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Sample Data (Optional)
-- =============================================

-- Insert some sample templates (uncomment to use)
/*
INSERT INTO frontend_templates (name, description, code, kind, tags) VALUES
('Hero Section', 'A modern hero section with gradient background', 
'export function Hero() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome</h1>
        <p className="text-xl text-indigo-100">Build something amazing</p>
      </div>
    </section>
  );
}', 'component', ARRAY['hero', 'landing', 'header']),

('Data Table', 'A responsive data table component',
'interface Column<T> { key: keyof T; label: string; }
interface DataTableProps<T> { data: T[]; columns: Column<T>[]; }

export function DataTable<T extends Record<string, any>>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-zinc-800">
            {columns.map(col => (
              <th key={String(col.key)} className="p-3 text-left text-zinc-300">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800">
              {columns.map(col => (
                <td key={String(col.key)} className="p-3 text-zinc-400">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}', 'component', ARRAY['table', 'data', 'list']);
*/
