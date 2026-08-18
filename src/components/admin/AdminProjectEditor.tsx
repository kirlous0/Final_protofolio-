import React, { useState } from 'react';
import {
  X,
  Save,
  Sparkles,
  Plus,
  Trash2,
  Camera,
  Star,
  CheckCircle2,
  Globe,
  Smartphone,
  Layers,
  AlertCircle,
  Loader2,
  FileCode,
} from 'lucide-react';
import { Project, ProjectImage, VerifiedTechnology } from '../../types';
import { api } from '../../lib/api';

interface AdminProjectEditorProps {
  project?: Project | null;
  onSave: () => void;
  onClose: () => void;
}

export const AdminProjectEditor: React.FC<AdminProjectEditorProps> = ({
  project,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(project);

  const [activeTab, setActiveTab] = useState<'general' | 'architecture' | 'technologies' | 'gallery' | 'ai'>('general');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [description, setDescription] = useState(project?.description || '');
  const [longDescription, setLongDescription] = useState(project?.longDescription || '');
  const [problem, setProblem] = useState(project?.problem || '');
  const [solution, setSolution] = useState(project?.solution || '');
  const [category, setCategory] = useState<Project['category']>(project?.category || 'Full Stack');
  const [platform, setPlatform] = useState<Project['platform']>(project?.platform || 'Web');
  const [status, setStatus] = useState<Project['status']>(project?.status || 'published');
  const [featured, setFeatured] = useState<boolean>(project?.featured ?? true);
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl || '');
  const [coverImage, setCoverImage] = useState(project?.coverImage || '');
  const [architectureNotes, setArchitectureNotes] = useState(project?.architectureNotes || '');
  
  const [features, setFeatures] = useState<string[]>(
    project?.features?.length ? [...project.features] : ['Sub-100ms response targets', 'Comprehensive unit and integration test suite']
  );
  const [engineeringHighlights, setEngineeringHighlights] = useState<string[]>(
    project?.engineeringHighlights?.length ? [...project.engineeringHighlights] : ['Clean Domain-Driven Architecture separation']
  );
  const [challenges, setChallenges] = useState<string[]>(
    project?.challenges?.length ? [...project.challenges] : ['Memory management under high data density']
  );
  
  const [technologies, setTechnologies] = useState<string>(
    project?.technologies?.join(', ') || 'TypeScript, React, Node.js, PostgreSQL'
  );

  const [gallery, setGallery] = useState<ProjectImage[]>(
    project?.gallery ? JSON.parse(JSON.stringify(project.gallery)) : []
  );

  const handleAddFeature = () => setFeatures([...features, '']);
  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };
  const handleRemoveFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

  const handleAddHighlight = () => setEngineeringHighlights([...engineeringHighlights, '']);
  const handleUpdateHighlight = (index: number, val: string) => {
    const updated = [...engineeringHighlights];
    updated[index] = val;
    setEngineeringHighlights(updated);
  };
  const handleRemoveHighlight = (index: number) => setEngineeringHighlights(engineeringHighlights.filter((_, i) => i !== index));

  const handleAddChallenge = () => setChallenges([...challenges, '']);
  const handleUpdateChallenge = (index: number, val: string) => {
    const updated = [...challenges];
    updated[index] = val;
    setChallenges(updated);
  };
  const handleRemoveChallenge = (index: number) => setChallenges(challenges.filter((_, i) => i !== index));

  const handleSetCover = (imgUrl: string) => {
    setCoverImage(imgUrl);
    setGallery(
      gallery.map(img => ({
        ...img,
        isCover: img.url === imgUrl,
      }))
    );
  };

  const handleRemoveImage = (imgId: string) => {
    setGallery(gallery.filter(i => i.id !== imgId));
  };

  const handleAddCustomImage = () => {
    const newImg: ProjectImage = {
      id: `img-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1440&auto=format&fit=crop&q=80',
      viewport: 'desktop',
      width: 1440,
      height: 900,
      caption: 'Desktop Dashboard View',
      isCover: gallery.length === 0,
    };
    setGallery([...gallery, newImg]);
  };

  // AI Generation from Title / Description
  const handleAiEnhance = async () => {
    if (!title) {
      alert('Please enter at least a project title first.');
      return;
    }
    setAiGenerating(true);
    try {
      const aiResult = await api.aiAnalyzeProject({
        title,
        description: description || problem,
        url: liveUrl,
        githubUrl,
        technologies: technologies.split(',').map(t => t.trim()).filter(Boolean),
      });

      if (aiResult.title) setTitle(aiResult.title);
      if (aiResult.description) setDescription(aiResult.description);
      if (aiResult.problem) setProblem(aiResult.problem);
      if (aiResult.solution) setSolution(aiResult.solution);
      if (aiResult.features?.length) setFeatures(aiResult.features);
      if (aiResult.engineeringHighlights?.length) setEngineeringHighlights(aiResult.engineeringHighlights);
      if (aiResult.challenges?.length) setChallenges(aiResult.challenges);
      if (aiResult.technologies?.length) setTechnologies(aiResult.technologies.join(', '));
      if (aiResult.category) setCategory(aiResult.category);
      if (aiResult.platform) setPlatform(aiResult.platform);
    } catch (err: any) {
      alert(err.message || 'AI Enhancement failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const projectPayload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      longDescription: longDescription || description,
      problem,
      solution,
      category,
      platform,
      status,
      featured,
      githubUrl,
      liveUrl,
      coverImage: coverImage || (gallery[0]?.url) || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      gallery,
      architectureNotes,
      features: features.filter(f => f.trim().length > 0),
      engineeringHighlights: engineeringHighlights.filter(h => h.trim().length > 0),
      challenges: challenges.filter(c => c.trim().length > 0),
      technologies: techArray,
      verifiedTechnologies: techArray.map(name => ({
        name,
        category: category as any,
        confidence: 1.0,
        source: 'package.json / build.gradle',
      })),
      seoTitle: `${title} — Case Study`,
      seoDescription: description,
    };

    try {
      if (isEditing && project) {
        await api.updateProject(project.id, projectPayload);
      } else {
        await api.createProject(projectPayload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-[#242e42] bg-[#0c1017] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between border-b border-[#1a2130] bg-[#10141e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#263246] bg-[#141b28] text-amber-400 font-mono text-xs font-bold">
              KW
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Edit: ${project?.title}` : 'Create New Project Case Study'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {platform} • {category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiEnhance}
              disabled={aiGenerating}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {aiGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              <span>AI Auto-Complete</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#182030] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Editor Nav Tabs */}
        <div className="flex border-b border-[#1a2130] bg-[#090c12] px-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'general'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General & Links
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture & Case Study
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Screenshots & Gallery ({gallery.length})
          </button>
        </div>

        {/* Editor Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="NovaTrack Fleet Telemetry"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="novatrack-android-fleet"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">Platform</label>
                  <select
                    value={platform}
                    onChange={e => setPlatform(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Android">Android</option>
                    <option value="Web">Web</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="Mobile">Mobile</option>
                    <option value="API">API</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Android">Android</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="AI & Cloud">AI & Cloud</option>
                    <option value="Web">Web</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded border-[#222a3a] bg-[#121723] text-amber-500 focus:ring-0"
                    />
                    <span>Featured Showcase</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-medium text-slate-300">
                  Short Tagline / Overview *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="High-throughput telemetry and battery-aware offline synchronization engine."
                  className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/waelkirlous/project"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-medium text-slate-300">Live Demo / Play Store URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    placeholder="https://project-demo.com"
                    className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-medium text-slate-300">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={technologies}
                  onChange={e => setTechnologies(e.target.value)}
                  placeholder="Kotlin, Jetpack Compose, Coroutines, Room DB, Hilt"
                  className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Architecture & Case Study */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div>
                <label className="block font-mono text-xs font-medium text-amber-400">
                  The Engineering Problem *
                </label>
                <textarea
                  rows={3}
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Describe the architectural friction, latency bottleneck, or hardware constraints..."
                  className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-medium text-amber-400">
                  Architecture & Solution *
                </label>
                <textarea
                  rows={3}
                  value={solution}
                  onChange={e => setSolution(e.target.value)}
                  placeholder="Explain your system design, boundary isolation, caching layers, and dispatchers..."
                  className="mt-1 w-full rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Key Features List */}
              <div className="rounded-xl border border-[#202738] bg-[#0a0d14] p-4">
                <div className="flex items-center justify-between border-b border-[#182030] pb-2">
                  <span className="font-mono text-xs font-semibold text-white">Verified Features</span>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="flex items-center gap-1 font-mono text-xs text-amber-400 hover:text-amber-300"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Feature</span>
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={e => handleUpdateFeature(idx, e.target.value)}
                        placeholder="Feature description..."
                        className="flex-1 rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Highlights */}
              <div className="rounded-xl border border-[#202738] bg-[#0a0d14] p-4">
                <div className="flex items-center justify-between border-b border-[#182030] pb-2">
                  <span className="font-mono text-xs font-semibold text-white">Engineering Highlights</span>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="flex items-center gap-1 font-mono text-xs text-amber-400 hover:text-amber-300"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Highlight</span>
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {engineeringHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hl}
                        onChange={e => handleUpdateHighlight(idx, e.target.value)}
                        placeholder="Key engineering decision or metric..."
                        className="flex-1 rounded-lg border border-[#222a3a] bg-[#121723] px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Gallery & Screenshots */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Multi-Viewport Gallery</h3>
                  <p className="text-xs text-slate-400">Manage responsive screenshots and cover preview</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomImage}
                  className="flex items-center gap-1 rounded-lg bg-[#151c2a] border border-[#263348] px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-[#1b2436]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Screenshot URL</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gallery.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="relative overflow-hidden rounded-xl border border-[#202738] bg-[#0a0d14] p-3 space-y-2"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#121622]">
                      <img src={img.url} alt={img.caption} className="h-full w-full object-cover" />
                      {img.isCover && (
                        <div className="absolute top-2 left-2 rounded bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-950">
                          COVER IMAGE
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{img.viewport.toUpperCase()} ({img.width}x{img.height})</span>
                      <div className="flex items-center gap-2">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(img.url)}
                            className="text-amber-400 hover:underline"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Bottom Save / Cancel Footer */}
        <div className="flex items-center justify-between border-t border-[#1a2130] bg-[#10141e] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#252f42] bg-[#121723] px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#182030]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Case Study...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish Project'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
