import { z } from 'zod';

// ============================================
// App Specification Types
// ============================================

export const PageSpecSchema = z.object({
    path: z.string(),
    purpose: z.string(),
    components: z.array(z.string()),
});

export const EntityFieldSchema = z.object({
    name: z.string(),
    type: z.string(),
});

export const EntitySchema = z.object({
    name: z.string(),
    fields: z.array(EntityFieldSchema),
});

export const ApiSpecSchema = z.object({
    path: z.string(),
    method: z.enum(['GET', 'POST', 'PATCH', 'DELETE']),
    purpose: z.string(),
    entity: z.string().optional(),
});

export const AppSpecSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    pages: z.array(PageSpecSchema),
    entities: z.array(EntitySchema),
    apis: z.array(ApiSpecSchema),
});

export type PageSpec = z.infer<typeof PageSpecSchema>;
export type EntityField = z.infer<typeof EntityFieldSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type ApiSpec = z.infer<typeof ApiSpecSchema>;
export type AppSpec = z.infer<typeof AppSpecSchema>;

// ============================================
// Template Types
// ============================================

export type TemplateKind = 'layout' | 'component' | 'page' | 'route' | 'schema';

export interface TemplateSnippet {
    id: string;
    name: string;
    description: string;
    code: string;
    kind: TemplateKind;
}

export interface FrontendTemplate extends TemplateSnippet {
    kind: 'layout' | 'component' | 'page';
}

export interface BackendTemplate extends TemplateSnippet {
    kind: 'route' | 'schema';
}

// ============================================
// Generated Project Types
// ============================================

export const GeneratedProjectSchema = z.object({
    spec: AppSpecSchema,
    files: z.record(z.string(), z.string()),
});

export type GeneratedProject = z.infer<typeof GeneratedProjectSchema>;

// ============================================
// Project Database Types
// ============================================

export interface Project {
    id: string;
    owner_id: string;
    name: string;
    spec: AppSpec;
    created_at: string;
}

export interface ProjectFile {
    id: string;
    project_id: string;
    path: string;
    content: string;
}

export interface ProjectWithFiles extends Project {
    files: ProjectFile[];
}

// ============================================
// API Response Types
// ============================================

export interface AppSpecResponse {
    spec: AppSpec;
}

export interface GenerateAppResponse {
    projectId: string;
    files: Record<string, string>;
}

export interface ValidationResult {
    ok: boolean;
    errors: string[];
}

export interface ApiError {
    error: string;
    details?: string[];
}
