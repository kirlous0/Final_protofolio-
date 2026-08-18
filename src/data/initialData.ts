import { Profile, Project, SkillCategory, Service, Message, SiteSettings } from '../types';

export const initialProfile: Profile = {
  name: 'Kirlous Wael',
  title: 'Full Stack Web Developer & Android Developer',
  tagline: 'Engineering robust full-stack web platforms, native Android applications, and high-throughput backend services with modern architectural patterns.',
  bio: 'Full Stack Engineer and Android specialist with extensive experience designing end-to-end architectures. Proficient in TypeScript, React, Next.js, Kotlin, Jetpack Compose, Express, and distributed cloud services.',
  longBio: 'I specialize in building reliable, high-performance digital products from low-level Android lifecycle management to scalable distributed cloud backends. My background spans reactive Android UI engineering with Jetpack Compose & Kotlin Multiplatform concepts, robust full-stack web applications with React/Next.js and Node.js, and server-side AI integrations.',
  email: 'waelkirlous@gmail.com',
  location: 'Cairo, Egypt / Remote Worldwide',
  availability: 'Open for Senior Full Stack / Android Engineering roles & technical consulting',
  github: 'https://github.com/waelkirlous',
  linkedin: 'https://linkedin.com/in/kirlous-wael',
  twitter: 'https://twitter.com/kirlouswael',
  yearsExperience: 5,
  primarySkills: ['TypeScript', 'React / Next.js', 'Kotlin / Jetpack Compose', 'Node.js & Express', 'PostgreSQL', 'Android SDK', 'Cloud Architecture'],
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  resumeUrl: '#contact',
};

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'NovaTrack — Native Android Fleet & Logistics Telemetry Engine',
    slug: 'novatrack-android-fleet-telemetry',
    description: 'Real-time telemetry and background geofencing application for Android built with Kotlin, Jetpack Compose, Coroutines/Flow, and offline-first Room database sync.',
    longDescription: 'NovaTrack is an enterprise-grade Android mobility solution delivering low-power continuous location tracking, real-time geofence violation alerts, and synchronized driver state. Built strictly around Android Architecture Components (MVI/Clean Architecture), it features background worker queues that maintain telemetry buffers during low connectivity and stream batch updates to backend ingestion clusters.',
    problem: 'Fleet operations suffered data dropouts in remote zones and high battery drain during continuous GPS updates, causing driver mobile devices to overheat and lose vital route data.',
    solution: 'Designed an adaptive background sensor fusion engine using FusedLocationProviderClient with dynamic duty cycles, persistent Room queues for zero-loss offline buffering, and a clean Jetpack Compose interface with Material 3 theming.',
    features: [
      'Adaptive location sampling rate based on accelerometer motion states',
      'Offline-first synchronization with Room and WorkManager background reconciliation',
      'Declarative Compose UI with interactive route trajectory visualization',
      'Battery optimization yielding 42% lower energy draw compared to standard polling'
    ],
    category: 'Android',
    platform: 'Android',
    status: 'published',
    featured: true,
    order: 1,
    technologies: ['Kotlin', 'Jetpack Compose', 'Coroutines / Flow', 'Room DB', 'WorkManager', 'Dagger Hilt', 'Retrofit'],
    verifiedTechnologies: [
      { name: 'Kotlin', confidence: 'verified', source: 'build.gradle.kts' },
      { name: 'Jetpack Compose', confidence: 'verified', source: 'app/build.gradle.kts' },
      { name: 'Room DB', confidence: 'verified', source: 'build.gradle.kts' },
      { name: 'WorkManager', confidence: 'verified', source: 'build.gradle.kts' },
      { name: 'Dagger Hilt', confidence: 'verified', source: 'app/src/main/di' }
    ],
    githubUrl: 'https://github.com/waelkirlous/novatrack-android',
    liveUrl: 'https://novatrack-preview.kirlous.dev',
    coverImage: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      {
        id: 'img-1-1',
        url: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1200&auto=format&fit=crop&q=80',
        viewport: 'mobile',
        width: 390,
        height: 844,
        caption: 'Driver Dashboard in Jetpack Compose featuring live route telemetry and shift metrics.',
        isCover: true,
        aiScore: {
          overall: 94,
          visualQuality: 95,
          layout: 93,
          typography: 94,
          readability: 96,
          mobileUsability: 95,
          recommendationNote: 'Highest contrast visual hierarchy and clearest typography composition for mobile showcase.'
        }
      },
      {
        id: 'img-1-2',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
        viewport: 'desktop',
        width: 1440,
        height: 900,
        caption: 'Fleet Dispatcher Operations Web View connected via WebSocket streams.',
        isCover: false,
        aiScore: {
          overall: 89,
          visualQuality: 90,
          layout: 88,
          typography: 89,
          readability: 91,
          mobileUsability: 84,
          recommendationNote: 'Strong desktop telemetry layout; ideal secondary preview.'
        }
      }
    ],
    architectureNotes: 'Layered Clean Architecture (Domain, Data, Presentation). The Domain layer is pure Kotlin with zero Android framework dependencies, ensuring high unit testability and domain logic isolation.',
    engineeringHighlights: [
      'Architected custom WorkManager constraints to defer heavy payload batch uploads until Wi-Fi or charging status.',
      'Implemented unidirectional data flow (MVI) with Kotlin StateFlow to eradicate race conditions in concurrent UI state updates.',
      'Built automated unit and instrumentation test suites verifying Room migrations and geofence boundary calculations.'
    ],
    challenges: [
      'Preventing Android OS aggressive battery management from killing the foreground location tracking service during long highway drives.',
      'Resolving SQLite transaction lock contention under high-frequency location streaming.'
    ],
    seoTitle: 'NovaTrack — Android Fleet Telemetry Engine by Kirlous Wael',
    seoDescription: 'Discover NovaTrack, a production-grade native Android fleet telemetry application built with Kotlin, Jetpack Compose, and offline Room synchronization by Kirlous Wael.',
    tags: ['Android', 'Kotlin', 'Jetpack Compose', 'MVI', 'Room', 'WorkManager'],
    createdAt: '2025-11-12T10:00:00Z',
    updatedAt: '2026-02-18T14:30:00Z',
    aiAudit: {
      strengths: [
        'Exceptional native Android architectural discipline using Clean Architecture and Kotlin Flow.',
        'Clear problem-to-solution narrative with specific technical mitigations.',
        'High screenshot quality with verified multi-viewport assets.'
      ],
      weaknesses: [
        'Could include a brief interactive diagram of the sensor fusion state machine.'
      ],
      uxOpportunities: [
        'Add a tabbed interactive code snippet preview for the WorkManager background queue implementation.'
      ],
      accessibilityNotes: [
        'Compose semantics tree passes TalkBack traversal with custom content descriptions for charts.'
      ],
      seoCheck: [
        'High keyword relevance for Android Developer, Jetpack Compose, and Kotlin engineering searches.'
      ],
      verifiedScore: 96,
      lastAuditedAt: '2026-03-01T09:15:00Z'
    }
  },
  {
    id: 'proj-2',
    title: 'PulseGrid — High-Throughput Distributed Analytics & Dashboard',
    slug: 'pulsegrid-fullstack-analytics-platform',
    description: 'Full-stack cloud monitoring platform engineered with React, Next.js, Node.js, Express, PostgreSQL, and time-series aggregation pipeline.',
    longDescription: 'PulseGrid is a full-stack real-time operational dashboard for tracking API latency, cluster health, and error anomalies across distributed microservices. Features server-sent events for live streaming, sub-50ms query aggregations over partitioned PostgreSQL tables, and role-based access control with audited administrative actions.',
    problem: 'Engineering teams lacked a unified view of cross-region service latencies without paying exorbitant per-metric SaaS monitoring fees.',
    solution: 'Engineered an end-to-end full-stack analytics platform utilizing Express micro-endpoints, hypertable time-bucketing in PostgreSQL, and a reactive React/TypeScript dashboard with virtualized render lists.',
    features: [
      'Sub-50ms analytical queries over 10M+ time-series records with index partitioning',
      'Real-time anomaly detection engine streaming instant alerts via SSE',
      'Interactive drilldown visualizations with custom D3 / Recharts time brushes',
      'Granular role-based authorization with cryptographically signed session tokens'
    ],
    category: 'Full Stack',
    platform: 'Web',
    status: 'published',
    featured: true,
    order: 2,
    technologies: ['TypeScript', 'Next.js', 'React', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    verifiedTechnologies: [
      { name: 'TypeScript', confidence: 'verified', source: 'package.json' },
      { name: 'React', confidence: 'verified', source: 'package.json' },
      { name: 'Express', confidence: 'verified', source: 'package.json' },
      { name: 'PostgreSQL', confidence: 'verified', source: 'src/db/connection.ts' },
      { name: 'Docker', confidence: 'verified', source: 'Dockerfile' }
    ],
    githubUrl: 'https://github.com/waelkirlous/pulsegrid-analytics',
    liveUrl: 'https://pulsegrid-demo.kirlous.dev',
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      {
        id: 'img-2-1',
        url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
        viewport: 'desktop',
        width: 1440,
        height: 900,
        caption: 'PulseGrid Live Cluster Metrics & Incident Timeline Dashboard.',
        isCover: true,
        aiScore: {
          overall: 93,
          visualQuality: 94,
          layout: 92,
          typography: 93,
          readability: 95,
          mobileUsability: 88,
          recommendationNote: 'Balanced dark mode layout with clear information hierarchy for systems engineering.'
        }
      }
    ],
    architectureNotes: 'Backend leverages connection pooling, prepared statements, and Redis write-behind caching for hot metrics, reducing DB load spikes by 70%.',
    engineeringHighlights: [
      'Implemented streaming backpressure handling in Node.js event loops to protect against memory leak spikes.',
      'Designed zero-downtime database schema migrations for partitioned time-series tables.',
      'Strict TypeScript type-safety enforced across API contracts using shared Zod schemas.'
    ],
    challenges: [
      'Eliminating garbage collection pauses under sustained 5,000 metrics/sec ingestion bursts.',
      'Ensuring responsive UI rendering during high-frequency chart updates without frame dropping.'
    ],
    seoTitle: 'PulseGrid — Full Stack Real-Time Analytics by Kirlous Wael',
    seoDescription: 'Explore PulseGrid, a scalable full-stack metrics & time-series monitoring platform built by Kirlous Wael with React, Node.js, and PostgreSQL.',
    tags: ['Full Stack', 'TypeScript', 'Node.js', 'PostgreSQL', 'Analytics', 'React'],
    createdAt: '2025-08-20T11:00:00Z',
    updatedAt: '2026-01-14T16:00:00Z',
    aiAudit: {
      strengths: [
        'Comprehensive full-stack architecture with production-proven database optimization.',
        'High technical clarity regarding query performance and stream handling.'
      ],
      weaknesses: [
        'Add a mobile viewport screenshot to demonstrate responsive design on smaller viewports.'
      ],
      uxOpportunities: [
        'Include benchmark graph comparing PostgreSQL partitioned indexes against unindexed queries.'
      ],
      accessibilityNotes: [
        'Color palette passes 4.5:1 contrast standards for dark mode UI elements.'
      ],
      seoCheck: [
        'Excellent technical keywords and structured content hierarchy.'
      ],
      verifiedScore: 94,
      lastAuditedAt: '2026-03-01T09:20:00Z'
    }
  },
  {
    id: 'proj-3',
    title: 'AuraDoc — Server-Side AI Document Synthesizer & Extractor',
    slug: 'auradoc-ai-document-intelligence',
    description: 'Production AI document analysis platform integrating Gemini models, streaming structured extraction, and semantic citation grounding.',
    longDescription: 'AuraDoc is an intelligent workspace tool that processes complex technical PDFs, source code archives, and API contracts. Utilizing server-side Gemini integration with strict JSON schema constraints and vector embedding search, it returns auditable answers backed by exact line-referenced citations.',
    problem: 'Developers and technical reviewers spend hours manually parsing unstructured 100+ page specifications to extract dependency requirements and security obligations.',
    solution: 'Constructed a server-side AI processing pipeline using Google GenAI SDK, strict Zod validation to eliminate hallucinations, and asynchronous worker queues for long document batches.',
    features: [
      'Strict schema extraction producing zero-hallucination structured JSON specs',
      'Real-time streaming text answers with visual citation highlighting',
      'SSRF-protected URL and document ingest pipeline with payload sandboxing',
      'Automated technical audit reports with exportable markdown & PDF summaries'
    ],
    category: 'AI & Cloud',
    platform: 'Web',
    status: 'published',
    featured: true,
    order: 3,
    technologies: ['TypeScript', 'Gemini API', 'Next.js', 'Node.js', 'Tailwind CSS', 'Zod'],
    verifiedTechnologies: [
      { name: 'TypeScript', confidence: 'verified', source: 'package.json' },
      { name: 'Gemini API', confidence: 'verified', source: 'server/gemini.ts' },
      { name: 'Zod', confidence: 'verified', source: 'package.json' }
    ],
    githubUrl: 'https://github.com/waelkirlous/auradoc-ai',
    liveUrl: 'https://auradoc.kirlous.dev',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      {
        id: 'img-3-1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        viewport: 'desktop',
        width: 1440,
        height: 900,
        caption: 'AuraDoc Structured Document Inspector & Interactive Prompt Engine.',
        isCover: true,
        aiScore: {
          overall: 95,
          visualQuality: 96,
          layout: 95,
          typography: 94,
          readability: 96,
          mobileUsability: 90,
          recommendationNote: 'Clean technical aesthetic with clear emphasis on document intelligence and structured data.'
        }
      }
    ],
    architectureNotes: 'All LLM calls are orchestrated strictly server-side with exponential backoff retries and token budgeting algorithms to ensure 99.9% uptime reliability.',
    engineeringHighlights: [
      'Engineered a deterministic Zod validator that retries model generation on partial JSON parse errors.',
      'Designed an in-memory sliding token window manager preventing payload truncation.',
      'Added comprehensive SSRF guards blocking private cloud IP ranges on user-submitted URLs.'
    ],
    challenges: [
      'Managing variable latency in large context prompts while preserving responsive UX on the client.',
      'Enforcing strict JSON schema conformity across heterogeneous document formats.'
    ],
    seoTitle: 'AuraDoc — Server-Side AI Document Intelligence by Kirlous Wael',
    seoDescription: 'Explore AuraDoc, a reliable AI document analysis and extraction system built with Gemini API and TypeScript by Kirlous Wael.',
    tags: ['AI', 'Gemini API', 'TypeScript', 'Next.js', 'Zod', 'Full Stack'],
    createdAt: '2025-10-05T14:00:00Z',
    updatedAt: '2026-02-02T18:00:00Z',
    aiAudit: {
      strengths: [
        'Strict anti-hallucination architecture with verifiable schemas.',
        'High reliability focus with server-side SDK encapsulation.'
      ],
      weaknesses: [
        'Could include a live interactive playground demo within the case study.'
      ],
      uxOpportunities: [
        'Add a side-by-side diff view of raw document versus extracted structured JSON.'
      ],
      accessibilityNotes: [
        'ARIA live regions announced streaming tokens smoothly without screen reader stuttering.'
      ],
      seoCheck: [
        'High ranking relevance for AI Engineer, Gemini API, and full stack developer queries.'
      ],
      verifiedScore: 97,
      lastAuditedAt: '2026-03-01T09:25:00Z'
    }
  },
  {
    id: 'proj-4',
    title: 'KronoSync — Modern Android Habit & Focus Tracker with Kotlin Multiplatform Core',
    slug: 'kronosync-android-focus-habits',
    description: 'Privacy-focused Android productivity app featuring custom Jetpack Compose canvas circular progress timers, offline Room encryption, and Android 14+ Predictive Back transitions.',
    longDescription: 'KronoSync delivers a distraction-free, zero-tracker habit and time management experience for Android power users. It incorporates Kotlin Coroutines, encrypted Room local persistence (SQLCipher), Jetpack Glance home screen interactive widgets, and seamless backup exports.',
    problem: 'Commercial habit trackers are loaded with intrusive advertisements, compulsory cloud lock-in, and bloated background services that drain device resources.',
    solution: 'Built an open-source, lightweight native Android application prioritizing local device encryption, snappy 120Hz Jetpack Compose animations, and Material You dynamic color theming.',
    features: [
      'Dynamic Material You theming adapting to user device system wallpaper',
      'SQLCipher encrypted database protecting personal productivity journals',
      'Interactive Glance home screen widgets with one-tap habit completion',
      'Custom canvas charts visualizing 365-day habit streaks and focus trends'
    ],
    category: 'Android',
    platform: 'Android',
    status: 'published',
    featured: false,
    order: 4,
    technologies: ['Kotlin', 'Jetpack Compose', 'Room', 'SQLCipher', 'Glance Widgets', 'Coroutines'],
    verifiedTechnologies: [
      { name: 'Kotlin', confidence: 'verified', source: 'build.gradle.kts' },
      { name: 'Jetpack Compose', confidence: 'verified', source: 'build.gradle.kts' },
      { name: 'Room', confidence: 'verified', source: 'build.gradle.kts' }
    ],
    githubUrl: 'https://github.com/waelkirlous/kronosync-android',
    liveUrl: 'https://kronosync.kirlous.dev',
    coverImage: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      {
        id: 'img-4-1',
        url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=1200&auto=format&fit=crop&q=80',
        viewport: 'mobile',
        width: 390,
        height: 844,
        caption: 'Habit Matrix View in Jetpack Compose with customizable weekly intervals.',
        isCover: true,
        aiScore: {
          overall: 92,
          visualQuality: 93,
          layout: 91,
          typography: 92,
          readability: 94,
          mobileUsability: 96,
          recommendationNote: 'Excellent mobile UI demonstration with clean dark mode components.'
        }
      }
    ],
    architectureNotes: 'Engineered using Clean Architecture with Kotlin UseCases, achieving over 90% unit test code coverage on business logic layers.',
    engineeringHighlights: [
      'Created custom Compose Canvas modifiers for hardware-accelerated 120 FPS arc progress animations.',
      'Implemented Android 14 Predictive Back Gesture animations seamlessly with Compose navigation.'
    ],
    challenges: [
      'Synchronizing encrypted database transactions with Android Glance widget updates without UI thread stalls.'
    ],
    seoTitle: 'KronoSync — Android Productivity App by Kirlous Wael',
    seoDescription: 'KronoSync is an open-source, encrypted Android habit and focus tracker built with Kotlin and Jetpack Compose by Kirlous Wael.',
    tags: ['Android', 'Kotlin', 'Jetpack Compose', 'Privacy', 'Room'],
    createdAt: '2025-06-10T08:00:00Z',
    updatedAt: '2026-01-20T12:00:00Z',
    aiAudit: {
      strengths: [
        'Superb implementation of native Android Jetpack Compose best practices.',
        'Privacy-first security stance with SQLCipher integration.'
      ],
      weaknesses: [
        'Consider promoting to featured tier if Android leadership role is the primary focus.'
      ],
      uxOpportunities: [
        'Add interactive video preview or GIF showing widget update interactions.'
      ],
      accessibilityNotes: [
        'Full support for high-contrast mode and dynamic font scale adjustments up to 200%.'
      ],
      seoCheck: [
        'Clear title, description, and keywords targeting Android engineering.'
      ],
      verifiedScore: 93,
      lastAuditedAt: '2026-03-01T09:30:00Z'
    }
  }
];

export const initialSkillCategories: SkillCategory[] = [
  {
    id: 'cat-web',
    title: 'Frontend & Full-Stack Web',
    description: 'Building responsive, accessible, and fast web applications with modern component architectures.',
    skills: [
      { name: 'TypeScript & JavaScript', level: 'Expert', experienceYears: 5, iconName: 'Code', highlight: 'Strict typing, modern ESNext, AST tools' },
      { name: 'React & Next.js', level: 'Expert', experienceYears: 5, iconName: 'Layout', highlight: 'App Router, Server Components, SSR, hooks' },
      { name: 'Tailwind CSS & UI Systems', level: 'Expert', experienceYears: 4, iconName: 'Palette', highlight: 'Design tokens, dark themes, responsive layouts' },
      { name: 'Motion for React', level: 'Advanced', experienceYears: 3, iconName: 'Sparkles', highlight: 'Fluid physics, layout animations, gestures' },
      { name: 'State Management', level: 'Expert', experienceYears: 5, iconName: 'Boxes', highlight: 'Zustand, React Context, TanStack Query' }
    ]
  },
  {
    id: 'cat-android',
    title: 'Native Android & Mobile',
    description: 'Crafting responsive, battery-efficient, and elegant native Android applications.',
    skills: [
      { name: 'Kotlin', level: 'Expert', experienceYears: 4, iconName: 'Smartphone', highlight: 'Coroutines, Flow, functional idioms, DSLs' },
      { name: 'Jetpack Compose', level: 'Expert', experienceYears: 4, iconName: 'Layers', highlight: 'Declarative UI, custom Canvas modifiers, Material 3' },
      { name: 'Android Architecture', level: 'Expert', experienceYears: 4, iconName: 'Cpu', highlight: 'Clean Architecture, MVI, MVVM, UseCases' },
      { name: 'Room & SQLite', level: 'Advanced', experienceYears: 4, iconName: 'Database', highlight: 'Offline-first sync, migrations, SQLCipher' },
      { name: 'WorkManager & Services', level: 'Advanced', experienceYears: 3, iconName: 'Clock', highlight: 'Background telemetry, power-aware scheduling' },
      { name: 'Dagger Hilt & Dependency Injection', level: 'Advanced', experienceYears: 4, iconName: 'Workflow', highlight: 'Scoped bindings, multi-module dependency graphs' }
    ]
  },
  {
    id: 'cat-backend',
    title: 'Backend & Cloud Systems',
    description: 'Designing scalable APIs, data persistence layers, and server-side automation.',
    skills: [
      { name: 'Node.js & Express', level: 'Expert', experienceYears: 5, iconName: 'Server', highlight: 'REST APIs, middleware security, async workers' },
      { name: 'PostgreSQL & SQL', level: 'Advanced', experienceYears: 4, iconName: 'Database', highlight: 'Schema design, indexing strategies, time-series' },
      { name: 'Gemini API & AI Pipelines', level: 'Advanced', experienceYears: 2, iconName: 'Bot', highlight: 'Structured outputs, anti-hallucination validation, streaming' },
      { name: 'Docker & Containerization', level: 'Proficient', experienceYears: 3, iconName: 'Box', highlight: 'Multi-stage builds, container networking' },
      { name: 'Browser Automation & Playwright', level: 'Advanced', experienceYears: 2, iconName: 'Camera', highlight: 'Headless automation, multi-viewport capture, SSRF guards' }
    ]
  }
];

export const initialServices: Service[] = [
  {
    id: 'srv-1',
    title: 'Full-Stack Web Application Development',
    slug: 'full-stack-web-development',
    description: 'End-to-end web software development from database architecture and secure backend APIs to high-performance responsive user interfaces.',
    deliverables: [
      'Production-ready React / Next.js web application',
      'Secure Express / Node.js backend with PostgreSQL persistence',
      'Responsive dark/light responsive layout adhering to WCAG AA accessibility',
      'Automated testing suites and deployment configuration'
    ],
    techStack: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
    icon: 'Globe'
  },
  {
    id: 'srv-2',
    title: 'Native Android Mobile Engineering',
    slug: 'native-android-development',
    description: 'Designing and building native Android applications with Kotlin, Jetpack Compose, and offline-first architectural patterns.',
    deliverables: [
      'Modern native Android app targeting latest API levels',
      'Declarative Jetpack Compose UI with smooth 120Hz motion',
      'Offline-first synchronization with Room and WorkManager',
      'Clean MVI/MVVM architecture with high unit test coverage'
    ],
    techStack: ['Kotlin', 'Jetpack Compose', 'Room DB', 'Coroutines / Flow', 'Dagger Hilt', 'WorkManager'],
    icon: 'Smartphone'
  },
  {
    id: 'srv-3',
    title: 'AI Integration & Server-Side Pipelines',
    slug: 'ai-integration-pipelines',
    description: 'Embedding server-side intelligence into products using Gemini models with strict schema validation and zero-hallucination guarantees.',
    deliverables: [
      'Server-side Gemini API integration with zero client key exposure',
      'Strict Zod schema enforcement and error recovery',
      'Streaming responses and document intelligence processing',
      'Automated content classification and quality scoring pipelines'
    ],
    techStack: ['Gemini API', 'TypeScript', 'Zod', 'Node.js', 'Streaming SSE'],
    icon: 'Cpu'
  },
  {
    id: 'srv-4',
    title: 'API Architecture & Performance Optimization',
    slug: 'api-architecture-optimization',
    description: 'Refactoring bottlenecks, designing clean RESTful/streaming contracts, and hardening security postures.',
    deliverables: [
      'Comprehensive database query optimization and indexing',
      'Rate-limiting, SSRF security guards, and input sanitization',
      'Real-time streaming (SSE/WebSockets) integration',
      'Observability and structured logging configuration'
    ],
    techStack: ['Node.js', 'PostgreSQL', 'Express', 'Redis patterns', 'Security audits'],
    icon: 'ShieldCheck'
  }
];

export const initialMessages: Message[] = [
  {
    id: 'msg-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@innovatetech.io',
    subject: 'Senior Full Stack & Android Lead position',
    message: 'Hi Kirlous, I came across your NovaTrack and PulseGrid engineering showcases. We are expanding our engineering team for real-time mobile and web platforms and would love to connect with you.',
    projectType: 'Full-time Role',
    status: 'read',
    createdAt: '2026-03-01T14:15:00Z'
  },
  {
    id: 'msg-2',
    name: 'Marcus Vance',
    email: 'marcus@vancemedia.de',
    subject: 'Consulting: Native Android Jetpack Compose Migration',
    message: 'Hello Kirlous, we are currently planning a refactor of our legacy Android XML codebase into modern Jetpack Compose with Clean Architecture. Would you be open to technical consulting on this roadmap?',
    projectType: 'Technical Consulting',
    status: 'unread',
    createdAt: '2026-03-02T09:40:00Z'
  }
];

export const initialSiteSettings: SiteSettings = {
  siteTitle: 'Kirlous Wael — Full Stack Web & Android Developer',
  siteDescription: 'Engineering portfolio of Kirlous Wael, featuring full-stack web platforms, native Android applications, and cloud AI architecture.',
  googleAnalyticsId: '',
  enableAiChat: true,
  enableAutoScreenshots: true,
  defaultCoverViewport: 'desktop',
  contactEmailNotification: true,
};
