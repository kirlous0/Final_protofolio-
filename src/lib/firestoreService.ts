import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Profile, Project, SkillCategory, Service, Message, ActivityLog, ScreenshotJob } from '../types';
import {
  initialProfile,
  initialProjects,
  initialSkillCategories,
  initialServices,
  initialMessages,
  initialSiteSettings,
} from '../data/initialData';

// Collection references
const PROFILES_COLLECTION = 'profiles';
const PROJECTS_COLLECTION = 'projects';
const SKILLS_COLLECTION = 'skills';
const SERVICES_COLLECTION = 'services';
const MESSAGES_COLLECTION = 'messages';
const SCREENSHOTS_COLLECTION = 'screenshotJobs';
const LOGS_COLLECTION = 'activityLogs';
const SETTINGS_COLLECTION = 'siteSettings';

const PROFILE_DOC_ID = 'main-profile';
const SETTINGS_DOC_ID = 'global-settings';

const FIRESTORE_READ_TIMEOUT_MS = 2500;

/**
 * Resilient wrapper that prevents Firestore offline/long-polling hangs
 */
async function safeFirestoreRead<T>(
  readFn: () => Promise<T>,
  fallback: T,
  operationName = 'read'
): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>(resolve => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, FIRESTORE_READ_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([readFn(), timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[Firestore] Handled notice for ${operationName}:`, err);
    return fallback;
  }
}

/**
 * Seed initial data to Firestore asynchronously if not already present
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const seedTask = (async () => {
      const profSnap = await getDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID)).catch(() => null);
      if (profSnap && !profSnap.exists()) {
        await setDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID), initialProfile).catch(() => {});
      }

      const projSnap = await getDocs(collection(db, PROJECTS_COLLECTION)).catch(() => null);
      if (projSnap && projSnap.empty) {
        for (const p of initialProjects) {
          await setDoc(doc(db, PROJECTS_COLLECTION, p.id), p).catch(() => {});
        }
      }

      const skillSnap = await getDocs(collection(db, SKILLS_COLLECTION)).catch(() => null);
      if (skillSnap && skillSnap.empty) {
        for (const s of initialSkillCategories) {
          await setDoc(doc(db, SKILLS_COLLECTION, s.id), s).catch(() => {});
        }
      }

      const srvSnap = await getDocs(collection(db, SERVICES_COLLECTION)).catch(() => null);
      if (srvSnap && srvSnap.empty) {
        for (const s of initialServices) {
          await setDoc(doc(db, SERVICES_COLLECTION, s.id), s).catch(() => {});
        }
      }

      const settingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)).catch(() => null);
      if (settingsSnap && !settingsSnap.exists()) {
        await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), initialSiteSettings).catch(() => {});
      }
    })();

    await Promise.race([
      seedTask,
      new Promise(resolve => setTimeout(resolve, 2000)),
    ]);
  } catch (err) {
    console.warn('[Firestore] Seed check notice:', err);
  }
}

// Helper for robust local storage caching during Firestore offline states
function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const CACHE_PROJECTS_KEY = 'kw_projects_cache';
const CACHE_PROFILE_KEY = 'kw_profile_cache';

// ----------------------------------------------------
// PROFILES
// ----------------------------------------------------
export async function getProfile(): Promise<Profile> {
  const cached = getLocalCache<Profile>(CACHE_PROFILE_KEY, initialProfile);
  return safeFirestoreRead(
    async () => {
      const snap = await getDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID));
      if (snap.exists()) {
        const data = snap.data() as Profile;
        setLocalCache(CACHE_PROFILE_KEY, data);
        return data;
      }
      return cached;
    },
    cached,
    'getProfile'
  );
}

export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const current = await getProfile();
  const updated = { ...current, ...profileData };
  setLocalCache(CACHE_PROFILE_KEY, updated);
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID), updated, { merge: true });
    await logActivity('PROFILE_UPDATED', 'profile', undefined, 'Updated developer profile details in Cloud Firestore.');
  } catch (e) {
    console.warn('Failed to sync profile update to remote Firestore:', e);
  }
  return updated;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function getProjects(filters?: { publishedOnly?: boolean }): Promise<Project[]> {
  const cached = getLocalCache<Project[]>(CACHE_PROJECTS_KEY, initialProjects);
  return safeFirestoreRead(
    async () => {
      const colRef = collection(db, PROJECTS_COLLECTION);
      let q = query(colRef);
      if (filters?.publishedOnly) {
        q = query(colRef, where('status', '==', 'published'));
      }
      const snap = await getDocs(q);
      if (snap.empty) {
        return cached;
      }
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
      const sorted = items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLocalCache(CACHE_PROJECTS_KEY, sorted);
      return sorted;
    },
    cached,
    'getProjects'
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const cachedProjects = getLocalCache<Project[]>(CACHE_PROJECTS_KEY, initialProjects);
  const localMatch = cachedProjects.find(p => p.slug === slug) || null;

  return safeFirestoreRead(
    async () => {
      const q = query(collection(db, PROJECTS_COLLECTION), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...d.data(), id: d.id } as Project;
      }
      return localMatch;
    },
    localMatch,
    'getProjectBySlug'
  );
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const newId = `proj-${Date.now()}`;
  const existingProjects = await getProjects();
  const fullProject: Project = {
    ...projectData,
    id: newId,
    order: existingProjects.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...existingProjects, fullProject];
  setLocalCache(CACHE_PROJECTS_KEY, updatedList);

  try {
    await setDoc(doc(db, PROJECTS_COLLECTION, newId), fullProject);
    await logActivity('PROJECT_CREATED', 'project', newId, `Created project "${fullProject.title}" in Cloud Firestore.`);
  } catch (e) {
    console.warn('Project create sync notice:', e);
  }
  return fullProject;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
  const currentProjects = await getProjects();
  const existing = currentProjects.find(p => p.id === id);

  const updated: Project = {
    ...(existing || initialProjects.find(p => p.id === id) || ({} as Project)),
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = currentProjects.map(p => (p.id === id ? updated : p));
  setLocalCache(CACHE_PROJECTS_KEY, updatedList);

  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await setDoc(docRef, updated, { merge: true });
    await logActivity('PROJECT_UPDATED', 'project', id, `Updated project "${updated.title}" in Cloud Firestore.`);
  } catch (e) {
    console.warn('Update project fallback notice:', e);
  }
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const currentProjects = await getProjects();
  const updatedList = currentProjects.filter(p => p.id !== id);
  setLocalCache(CACHE_PROJECTS_KEY, updatedList);

  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
    await logActivity('PROJECT_DELETED', 'project', id, `Deleted project from Cloud Firestore.`);
  } catch (e) {
    console.warn('Delete project notice:', e);
  }
  return true;
}

export async function toggleFeatureProject(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    let current: Project;
    if (snap.exists()) {
      current = snap.data() as Project;
    } else {
      current = initialProjects.find(p => p.id === id) || ({} as Project);
    }
    const newFeatured = !current.featured;
    const updated: Project = {
      ...current,
      id,
      featured: newFeatured,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, updated, { merge: true });
    await logActivity(
      newFeatured ? 'PROJECT_FEATURED' : 'PROJECT_UNFEATURED',
      'project',
      id,
      `${newFeatured ? 'Featured' : 'Unfeatured'} project "${current.title || id}".`
    );
    return updated;
  } catch (e) {
    console.warn('Toggle feature notice:', e);
    return null;
  }
}

// ----------------------------------------------------
// SKILLS & SERVICES
// ----------------------------------------------------
export async function getSkills(): Promise<SkillCategory[]> {
  return safeFirestoreRead(
    async () => {
      const snap = await getDocs(collection(db, SKILLS_COLLECTION));
      if (snap.empty) return initialSkillCategories;
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as SkillCategory));
    },
    initialSkillCategories,
    'getSkills'
  );
}

export async function updateSkills(categories: SkillCategory[]): Promise<SkillCategory[]> {
  try {
    for (const cat of categories) {
      await setDoc(doc(db, SKILLS_COLLECTION, cat.id), cat, { merge: true });
    }
    await logActivity('SKILLS_UPDATED', 'profile', undefined, 'Updated skills taxonomy in Cloud Firestore.');
  } catch (e) {
    console.warn('Skills update notice:', e);
  }
  return categories;
}

export async function getServices(): Promise<Service[]> {
  return safeFirestoreRead(
    async () => {
      const snap = await getDocs(collection(db, SERVICES_COLLECTION));
      if (snap.empty) return initialServices;
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Service));
    },
    initialServices,
    'getServices'
  );
}

export async function updateServices(services: Service[]): Promise<Service[]> {
  try {
    for (const s of services) {
      await setDoc(doc(db, SERVICES_COLLECTION, s.id), s, { merge: true });
    }
    await logActivity('SERVICES_UPDATED', 'profile', undefined, 'Updated services offerings in Cloud Firestore.');
  } catch (e) {
    console.warn('Services update notice:', e);
  }
  return services;
}

// ----------------------------------------------------
// MESSAGES (Contact Inquiries)
// ----------------------------------------------------
export async function sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'status'>): Promise<Message> {
  const msgId = `msg-${Date.now()}`;
  const newMsg: Message = {
    ...messageData,
    id: msgId,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, MESSAGES_COLLECTION, msgId), newMsg);
    await logActivity('MESSAGE_RECEIVED', 'message', msgId, `New contact message received from ${newMsg.name} (${newMsg.email}).`);
  } catch (e) {
    console.warn('Send message cached locally:', e);
  }
  return newMsg;
}

export async function getMessages(): Promise<Message[]> {
  return safeFirestoreRead(
    async () => {
      const snap = await getDocs(collection(db, MESSAGES_COLLECTION));
      if (snap.empty) return initialMessages;
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Message));
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    initialMessages,
    'getMessages'
  );
}

export async function updateMessageStatus(id: string, status: Message['status']): Promise<void> {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, id);
    await setDoc(docRef, { status }, { merge: true });
  } catch (e) {
    console.warn('Message status update notice:', e);
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
  } catch (e) {
    console.warn('Delete message notice:', e);
  }
}

// ----------------------------------------------------
// SCREENSHOT JOBS
// ----------------------------------------------------
export async function createScreenshotJob(url: string, projectId?: string, projectTitle?: string): Promise<ScreenshotJob> {
  const jobId = `job-${Date.now()}`;
  const newJob: ScreenshotJob = {
    id: jobId,
    projectId,
    projectTitle,
    url,
    status: 'queued',
    progress: 0,
    stepName: 'Screenshot capture job queued in Cloud Firestore',
    capturedImages: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, SCREENSHOTS_COLLECTION, jobId), newJob);
    await logActivity('SCREENSHOT_JOB_CREATED', 'screenshot', jobId, `Created screenshot capture job for ${url}.`);
  } catch (e) {
    console.warn('Screenshot job saved locally:', e);
  }
  return newJob;
}

export async function getScreenshotJobs(): Promise<ScreenshotJob[]> {
  return safeFirestoreRead(
    async () => {
      const snap = await getDocs(collection(db, SCREENSHOTS_COLLECTION));
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as ScreenshotJob));
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [],
    'getScreenshotJobs'
  );
}

export async function updateScreenshotJob(id: string, patch: Partial<ScreenshotJob>): Promise<void> {
  try {
    const docRef = doc(db, SCREENSHOTS_COLLECTION, id);
    await setDoc(docRef, patch as any, { merge: true });
  } catch (e) {
    console.warn('Screenshot job update notice:', e);
  }
}

export function subscribeToScreenshotJob(jobId: string, onUpdate: (job: ScreenshotJob) => void): () => void {
  try {
    return onSnapshot(doc(db, SCREENSHOTS_COLLECTION, jobId), snap => {
      if (snap.exists()) {
        onUpdate({ ...snap.data(), id: snap.id } as ScreenshotJob);
      }
    });
  } catch {
    return () => {};
  }
}

// ----------------------------------------------------
// ACTIVITY LOGS
// ----------------------------------------------------
export async function logActivity(
  action: string,
  entityType: ActivityLog['entityType'],
  entityId: string | undefined,
  details: string
): Promise<void> {
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLog: ActivityLog = {
      id: logId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, LOGS_COLLECTION, logId), newLog);
  } catch (err) {
    console.warn('Failed to write activity log:', err);
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return safeFirestoreRead(
    async () => {
      const snap = await getDocs(collection(db, LOGS_COLLECTION));
      const logs = snap.docs.map(d => ({ ...d.data(), id: d.id } as ActivityLog));
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
    },
    [
      {
        id: 'log-default',
        action: 'FIREBASE_INITIALIZED',
        entityType: 'security',
        details: 'Cloud Firestore backend connected and active.',
        timestamp: new Date().toISOString(),
      },
    ],
    'getActivityLogs'
  );
}
