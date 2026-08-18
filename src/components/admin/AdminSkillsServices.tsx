import React, { useState } from 'react';
import { Plus, Trash2, Save, Layers, Briefcase, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { SkillCategory, Service } from '../../types';
import { api } from '../../lib/api';

interface AdminSkillsServicesProps {
  skills: SkillCategory[];
  services: Service[];
  onRefresh: () => void;
}

export const AdminSkillsServices: React.FC<AdminSkillsServicesProps> = ({
  skills: initialSkills,
  services: initialServices,
  onRefresh,
}) => {
  const [skills, setSkills] = useState<SkillCategory[]>([...initialSkills]);
  const [services, setServices] = useState<Service[]>([...initialServices]);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [skillsSuccess, setSkillsSuccess] = useState(false);
  const [servicesSuccess, setServicesSuccess] = useState(false);

  // Skill management
  const handleAddSkill = (catIndex: number) => {
    const updated = [...skills];
    updated[catIndex].skills.push({
      name: 'New Skill',
      level: 'Proficient',
      experienceYears: 2,
      highlight: 'Production experience and clean architecture.',
      iconName: 'Code',
    });
    setSkills(updated);
  };

  const handleRemoveSkill = (catIndex: number, skillIndex: number) => {
    const updated = [...skills];
    updated[catIndex].skills.splice(skillIndex, 1);
    setSkills(updated);
  };

  const handleUpdateSkill = (catIndex: number, skillIndex: number, field: string, value: any) => {
    const updated = [...skills];
    (updated[catIndex].skills[skillIndex] as any)[field] = value;
    setSkills(updated);
  };

  const handleSaveSkills = async () => {
    setSavingSkills(true);
    try {
      await api.updateSkills(skills);
      setSkillsSuccess(true);
      onRefresh();
      setTimeout(() => setSkillsSuccess(false), 2500);
    } catch (e) {
      alert('Failed to save skills');
    } finally {
      setSavingSkills(false);
    }
  };

  // Service management
  const handleAddService = () => {
    setServices([
      ...services,
      {
        id: `srv-${Date.now()}`,
        title: 'New Engineering Service',
        description: 'Comprehensive software engineering and technical architecture.',
        icon: 'Globe',
        deliverables: ['Production deployment', 'Comprehensive testing'],
        techStack: ['TypeScript', 'React'],
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  const handleSaveServices = async () => {
    setSavingServices(true);
    try {
      await api.updateServices(services);
      setServicesSuccess(true);
      onRefresh();
      setTimeout(() => setServicesSuccess(false), 2500);
    } catch (e) {
      alert('Failed to save services');
    } finally {
      setSavingServices(false);
    }
  };

  return (
    <div id="admin-skills-services-tab" className="space-y-12">
      {/* Section 1: Skills Taxonomy */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Skills Taxonomy & Experience</h2>
            <p className="text-xs text-slate-400">
              Manage technical skill levels, verified highlights, and category taxonomy.
            </p>
          </div>

          <button
            onClick={handleSaveSkills}
            disabled={savingSkills}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {savingSkills ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Skills Taxonomy</span>
          </button>
        </div>

        {skillsSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Skills taxonomy saved successfully!</span>
          </div>
        )}

        <div className="space-y-6">
          {skills.map((cat, catIdx) => (
            <div key={cat.id} className="rounded-2xl border border-[#202738] bg-[#0c1017] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#182030] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{cat.title}</h3>
                  <p className="text-xs text-slate-400">{cat.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill(catIdx)}
                  className="flex items-center gap-1 font-mono text-xs text-amber-400 hover:text-amber-300"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-xl border border-[#1b2232] bg-[#10141e] p-3 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={e => handleUpdateSkill(catIdx, sIdx, 'name', e.target.value)}
                        className="font-semibold text-white bg-transparent border-b border-[#253246] px-1 py-0.5 w-32 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(catIdx, sIdx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={skill.level}
                        onChange={e => handleUpdateSkill(catIdx, sIdx, 'level', e.target.value)}
                        className="rounded border border-[#20293a] bg-[#141b27] px-2 py-1 font-mono text-[10px] text-amber-300 focus:outline-none"
                      >
                        <option value="Expert">Expert</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Proficient">Proficient</option>
                      </select>

                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={skill.experienceYears}
                        onChange={e => handleUpdateSkill(catIdx, sIdx, 'experienceYears', Number(e.target.value))}
                        className="w-16 rounded border border-[#20293a] bg-[#141b27] px-2 py-1 font-mono text-[10px] text-white focus:outline-none"
                      />
                      <span className="font-mono text-[10px] text-slate-500">Yrs</span>
                    </div>

                    <textarea
                      rows={2}
                      value={skill.highlight}
                      onChange={e => handleUpdateSkill(catIdx, sIdx, 'highlight', e.target.value)}
                      placeholder="Skill highlight..."
                      className="w-full rounded border border-[#20293a] bg-[#141b27] px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Services */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Services & Engineering Scopes</h2>
            <p className="text-xs text-slate-400">
              Manage professional engineering services, deliverables, and tech stack chips.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddService}
              className="flex items-center gap-1 rounded-lg border border-[#263246] bg-[#121723] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#182030]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </button>

            <button
              onClick={handleSaveServices}
              disabled={savingServices}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {savingServices ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Services</span>
            </button>
          </div>
        </div>

        {servicesSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Engineering services saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((srv, idx) => (
            <div key={srv.id || idx} className="rounded-2xl border border-[#202738] bg-[#0c1017] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={srv.title}
                  onChange={e => {
                    const updated = [...services];
                    updated[idx].title = e.target.value;
                    setServices(updated);
                  }}
                  className="font-bold text-base text-white bg-transparent border-b border-[#253246] px-1 py-0.5 focus:outline-none focus:border-amber-500 w-full"
                />
                <button
                  onClick={() => handleRemoveService(idx)}
                  className="p-1 text-slate-500 hover:text-red-400 shrink-0 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <textarea
                rows={2}
                value={srv.description}
                onChange={e => {
                  const updated = [...services];
                  updated[idx].description = e.target.value;
                  setServices(updated);
                }}
                className="w-full rounded-lg border border-[#20293a] bg-[#121723] px-3 py-2 text-xs text-slate-300 focus:outline-none"
              />

              <div>
                <label className="block font-mono text-[11px] font-medium text-slate-400 mb-1">
                  Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={srv.deliverables.join('\n')}
                  onChange={e => {
                    const updated = [...services];
                    updated[idx].deliverables = e.target.value.split('\n').filter(Boolean);
                    setServices(updated);
                  }}
                  className="w-full rounded-lg border border-[#20293a] bg-[#121723] px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-medium text-slate-400 mb-1">
                  Tech Stack (Comma-separated)
                </label>
                <input
                  type="text"
                  value={srv.techStack.join(', ')}
                  onChange={e => {
                    const updated = [...services];
                    updated[idx].techStack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setServices(updated);
                  }}
                  className="w-full rounded-lg border border-[#20293a] bg-[#121723] px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
