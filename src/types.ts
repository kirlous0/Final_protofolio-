export type ProjectCategory = 'Web' | 'Android' | 'Full Stack' | 'AI & Cloud' | 'Open Source';
export type PlatformType = 'Web' | 'Android' | 'Cross-Platform' | 'Backend / Cloud';
export type ProjectStatus = 'published' | 'draft' | 'archived';

export interface VerifiedTechnology {
  name: string;
  confidence: 'verified' | 'strongly_inferred' | 'weakly_inferred';
  source: string;
}

export interface ScreenshotAiScore {
  overall: number;
  visualQuality: number;
  layout: number;
  typography: number;
  readability: number;
  mobileUsability: number;
  recommendationNote: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  viewport: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'fullpage';
  width: number;
  height: number;
  caption: string;
  isCover?: boolean;
  aiScore?: ScreenshotAiScore;
}

export interface ProjectAiAudit {
  strengths: string[];
  weaknesses: string[];
  uxOpportunities: string[];
  accessibilityNotes: string[];
  seoCheck: string[];
  verifiedScore: number;
  lastAuditedAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  problem: string;
  solution: string;
  features: Array<string | { value: string; verificationStatus?: 'verified' | 'strongly_inferred' | 'weakly_inferred'; source?: string }>;
  category: ProjectCategory;
  technologies: string[];
  verifiedTechnologies: VerifiedTechnology[];
  platform: PlatformType;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  githubUrl?: string;
  liveUrl?: string;
  coverImage: string;
  gallery: ProjectImage[];
  architectureNotes?: string;
  engineeringHighlights: string[];
  challenges: string[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  aiAudit?: ProjectAiAudit;
  // GitHub Ingestion & Sync metadata
  githubRepoId?: number;
  githubRepoFullName?: string;
  githubDefaultBranch?: string;
  githubLastCommitSha?: string;
  githubLastSyncedAt?: string;
  githubSyncStatus?: 'synced' | 'outdated' | 'manual';
}

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  longBio: string;
  email: string;
  location: string;
  availability: string;
  github: string;
  linkedin: string;
  twitter: string;
  yearsExperience: number;
  primarySkills: string[];
  avatarUrl: string;
  resumeUrl: string;
}

export interface SkillItem {
  name: string;
  level: 'Expert' | 'Advanced' | 'Proficient';
  experienceYears: number;
  iconName: string;
  highlight: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  description: string;
  skills: SkillItem[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  techStack: string[];
  icon: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export type JobStatus = 'queued' | 'validating' | 'connecting' | 'capturing' | 'optimizing' | 'analyzing' | 'completed' | 'failed';

export interface ScreenshotJob {
  id: string;
  projectId?: string;
  projectTitle?: string;
  url: string;
  status: JobStatus;
  progress: number;
  stepName: string;
  errorReason?: string;
  capturedImages: ProjectImage[];
  recommendedCoverId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PortfolioOptimizationResult {
  featuredRecommendations: Array<{
    projectId: string;
    projectTitle: string;
    score: number;
    reason: string;
  }>;
  skillGaps: string[];
  contentImprovements: Array<{
    projectId: string;
    projectTitle: string;
    issue: string;
    suggestion: string;
  }>;
  overallPortfolioScore: number;
  summary: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'project' | 'screenshot' | 'ai' | 'message' | 'profile' | 'security';
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  googleAnalyticsId: string;
  enableAiChat: boolean;
  enableAutoScreenshots: boolean;
  defaultCoverViewport: 'desktop' | 'laptop' | 'tablet' | 'mobile';
  contactEmailNotification: boolean;
}

// --------------------------------------------------
// GITHUB INGESTION & PIPELINE MODELS
// --------------------------------------------------
export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  languages: string[];
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  category: ProjectCategory;
  platform: PlatformType;
  aiRecommendation?: {
    score: number;
    recommended: boolean;
    why: string[];
    strengths: string[];
    portfolioRole?: string;
  };
}

export interface GitHubEvidencePackage {
  repoId: number;
  repoFullName: string;
  repoUrl: string;
  defaultBranch: string;
  commitSha: string;
  treeFiles: string[];
  manifests: {
    packageJson?: any;
    buildGradle?: string;
  };
  readmeContent: string;
  detectedLiveUrl?: {
    url: string;
    source: string;
    isValidated: boolean;
    validationError?: string;
  };
  verifiedTechnologies: VerifiedTechnology[];
  suggestedCategory: ProjectCategory;
  suggestedPlatform: PlatformType;
}

export interface GitHubSyncDiff {
  projectId: string;
  repoFullName: string;
  hasChanges: boolean;
  addedTechnologies: string[];
  removedTechnologies: string[];
  readmeUpdated: boolean;
  summary: string;
}

export interface GitHubApiProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubApiRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface GitHubApiStatus {
  connectedUsername: string;
  hasCustomToken: boolean;
  isAuthenticated: boolean;
  authMethod: 'token' | 'public_api';
  profile?: GitHubApiProfile | null;
  rateLimit?: GitHubApiRateLimit | null;
}

