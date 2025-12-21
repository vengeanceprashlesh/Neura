'use client';

import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Trash2, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';

interface Project {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at?: string;
}

export function ProjectList() {
    const { currentProjectId, setCurrentProjectId, currentCode } = useAppStore();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    // Load projects list
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-save current project every 5 seconds
    useEffect(() => {
        if (!currentProjectId) return;

        const interval = setInterval(async () => {
            await saveProject();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentProjectId, currentCode]);

    const saveProject = async () => {
        if (!currentProjectId || currentProjectId.startsWith('local-')) return;

        try {
            setIsSaving(true);

            // Convert files to simple object
            const files: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                files[path] = typeof file === 'string' ? file : file.code;
            }

            await fetch(`/api/projects/${currentProjectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files })
            });
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const createProject = async () => {
        if (!newProjectName.trim()) return;

        try {
            const files: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                files[path] = typeof file === 'string' ? file : file.code;
            }

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newProjectName,
                    spec: { name: newProjectName },
                    files
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentProjectId(data.project.id);
                await loadProjects();
                setIsCreating(false);
                setNewProjectName('');
            }
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const loadProject = async (id: string) => {
        try {
            const response = await fetch(`/api/projects/${id}`);
            if (response.ok) {
                const data = await response.json();
                const { loadGeneratedFiles } = useAppStore.getState();
                loadGeneratedFiles(data.files);
                setCurrentProjectId(id);
            }
        } catch (error) {
            console.error('Failed to load project:', error);
        }
    };

    const deleteProject = async (id: string) => {
        if (!confirm('Delete this project?')) return;

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (currentProjectId === id) {
                setCurrentProjectId(null);
            }
            await loadProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300">Projects</h3>
                <div className="flex items-center gap-2">
                    {isSaving && <Loader2 size={14} className="animate-spin text-indigo-400" />}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 hover:bg-zinc-800 rounded"
                        title="New Project"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* New Project Input */}
            {isCreating && (
                <div className="p-2 border-b border-zinc-800">
                    <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onBlur={createProject}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') createProject();
                            if (e.key === 'Escape') {
                                setIsCreating(false);
                                setNewProjectName('');
                            }
                        }}
                        placeholder="Project name..."
                        className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm"
                        autoFocus
                    />
                </div>
            )}

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 size={20} className="animate-spin text-zinc-500" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8">
                        No projects yet. Create one to get started!
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className={`
                                group flex items-center gap-2 px-2 py-2 rounded cursor-pointer mb-1
                                hover:bg-zinc-800 transition-colors
                                ${currentProjectId === project.id ? 'bg-zinc-800' : ''}
                            `}
                            onClick={() => loadProject(project.id)}
                        >
                            <FolderOpen size={16} className="text-indigo-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-300 truncate">{project.name}</p>
                                <p className="text-xs text-zinc-500">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProject(project.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-red-400"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
