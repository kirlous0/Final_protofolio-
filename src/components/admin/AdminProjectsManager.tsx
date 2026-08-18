import React, { useState } from 'react';
import {
  Plus,
  Search,
  Star,
  Eye,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Camera,
  Copy,
  CheckCircle2,
  Globe,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Project } from '../../types';
import { api } from '../../lib/api';

interface AdminProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onRunAudit: (projectId: string) => void;
  onCaptureScreenshots: (project: Project) => void;
}

export const AdminProjectsManager: React.FC<AdminProjectsManagerProps> = ({
  projects,
  onRefresh,
  onCreateProject,
  onEditProject,
  onRunAudit,
  onCaptureScreenshots,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleFeatured = async (project: Project) => {
    setActionLoadingId(project.id);
    try {
      await api.toggleFeatureProject(project.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (project: Project) => {
    setActionLoadingId(project.id);
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateProject(project.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update project status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete project "${project.title}"?`)) return;
    setActionLoadingId(project.id);
    try {
      await api.deleteProject(project.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicate = async (project: Project) => {
    setActionLoadingId(project.id);
    try {
      await api.createProject({
        ...project,
        title: `${project.title} (Copy)`,
        slug: `${project.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        featured: false,
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate project');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;

    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    const orderedIds = newProjects.map(p => p.id);
    try {
      await api.reorderProjects(orderedIds);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reorder projects');
    }
  };

  return (
    <div id="admin-projects-tab" className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Case Studies Manager</h2>
          <p className="text-xs text-slate-400">
            Create, edit, reorder, and audit production case studies ({projects.length} total)
          </p>
        </div>

        <button
          id="admin-create-project-btn"
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-[#202738] bg-[#0c1017] p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="admin-projects-search-input"
            type="text"
            placeholder="Search projects by title, technology, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#232d40] bg-[#121723] pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            id="admin-category-filter"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-[#232d40] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Android">Android</option>
            <option value="Full Stack">Full Stack</option>
            <option value="AI & Cloud">AI & Cloud</option>
            <option value="Web">Web</option>
          </select>

          <select
            id="admin-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-[#232d40] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Projects Table / List */}
      <div className="overflow-hidden rounded-xl border border-[#202738] bg-[#0c1017]">
        <div className="divide-y divide-[#182030]">
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No projects found matching the selected filters.
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <div
                key={project.id}
                id={`admin-project-row-${project.id}`}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 sm:p-5 gap-4 transition-colors hover:bg-[#0f1420]"
              >
                {/* Left: Reorder controls + Thumbnail + Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Order Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={index === 0}
                      className="rounded p-1 text-slate-500 hover:bg-[#1a2334] hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={index === filteredProjects.length - 1}
                      className="rounded p-1 text-slate-500 hover:bg-[#1a2334] hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-[#222a3a] bg-[#121622]">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-1 left-1 rounded bg-[#090a0f]/80 px-1 py-0.2 font-mono text-[9px] text-amber-400">
                      {project.platform === 'Android' ? 'AND' : 'WEB'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white truncate">{project.title}</h3>
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-0.5 transition-colors ${
                          project.featured ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={project.featured ? 'Featured on home' : 'Click to feature'}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                      {project.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span className="text-slate-400">{project.category}</span>
                      <span>•</span>
                      <span>{project.gallery.length} Viewports</span>
                      {project.aiAudit && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">
                            AI Score: {project.aiAudit.verifiedScore}/100
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[#182030] pt-3 lg:border-t-0 lg:pt-0">
                  <button
                    onClick={() => handleToggleStatus(project)}
                    className={`rounded-lg px-2.5 py-1 font-mono text-xs transition-colors ${
                      project.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    }`}
                  >
                    {project.status === 'published' ? 'Published' : 'Draft'}
                  </button>

                  <button
                    onClick={() => onRunAudit(project.id)}
                    className="flex items-center gap-1 rounded-lg border border-[#222c3d] bg-[#121723] px-2.5 py-1 text-xs text-amber-400 hover:bg-[#182030]"
                    title="Run AI Quality Audit"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Audit</span>
                  </button>

                  <button
                    onClick={() => onCaptureScreenshots(project)}
                    className="flex items-center gap-1 rounded-lg border border-[#222c3d] bg-[#121723] px-2.5 py-1 text-xs text-blue-400 hover:bg-[#182030]"
                    title="Capture Multi-Viewport Screenshots"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Screenshots</span>
                  </button>

                  <button
                    id={`edit-project-btn-${project.id}`}
                    onClick={() => onEditProject(project)}
                    className="flex items-center gap-1 rounded-lg border border-[#2a364a] bg-[#141b28] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1a2334]"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(project)}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Duplicate Project"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(project)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                    title="Delete Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
