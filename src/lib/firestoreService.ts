import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Profile, Project, SkillCategory, Service, Message, ActivityLog, ScreenshotJob, SiteSettings } from '../types';
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

/**
 * Seed initial data to Firestore if not already present
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const profSnap = await getDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID));
    if (!profSnap.exists()) {
      console.log('[Firestore] Seeding initial profile...');
      await setDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID), initialProfile);
    }

    const projSnap = await getDocs(collection(db, PROJECTS_COLLECTION));
    if (projSnap.empty) {
      console.log('[Firestore] Seeding initial projects...');
      for (const p of initialProjects) {
        await setDoc(doc(db, PROJECTS_COLLECTION, p.id), p);
      }
    }

    const skillSnap = await getDocs(collection(db, SKILLS_COLLECTION));
    if (skillSnap.empty) {
      console.log('[Firestore] Seeding initial skills...');
      for (const s of initialSkillCategories) {
        await setDoc(doc(db, SKILLS_COLLECTION, s.id), s);
      }
    }

    const srvSnap = await getDocs(collection(db, SERVICES_COLLECTION));
    if (srvSnap.empty) {
      console.log('[Firestore] Seeding initial services...');
      for (const s of initialServices) {
        await setDoc(doc(db, SERVICES_COLLECTION, s.id), s);
      }
    }

    const settingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
    if (!settingsSnap.exists()) {
      console.log('[Firestore] Seeding site settings...');
      await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), initialSiteSettings);
    }
  } catch (err) {
    console.warn('[Firestore] Seed check notice:', err);
  }
}

// ----------------------------------------------------
// PROFILES
// ----------------------------------------------------
export async function getProfile(): Promise<Profile> {
  try {
    const snap = await getDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID));
    if (snap.exists()) {
      return snap.data() as Profile;
    }
    return initialProfile;
  } catch (e) {
    console.error('Error fetching profile from Firestore:', e);
    return initialProfile;
  }
}

export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const current = await getProfile();
  const updated = { ...current, ...profileData };
  await setDoc(doc(db, PROFILES_COLLECTION, PROFILE_DOC_ID), updated, { merge: true });
  await logActivity('PROFILE_UPDATED', 'profile', undefined, 'Updated developer profile details in Cloud Firestore.');
  return updated;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function getProjects(filters?: { publishedOnly?: boolean }): Promise<Project[]> {
  try {
    const colRef = collection(db, PROJECTS_COLLECTION);
    let q = query(colRef);
    if (filters?.publishedOnly) {
      q = query(colRef, where('status', '==', 'published'));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      return initialProjects;
    }
    const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (e) {
    console.error('Error fetching projects from Firestore:', e);
    return initialProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { ...d.data(), id: d.id } as Project;
    }
    return initialProjects.find(p => p.slug === slug) || null;
  } catch (e) {
    console.error('Error finding project by slug:', e);
    return initialProjects.find(p => p.slug === slug) || null;
  }
}

export async function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const colRef = collection(db, PROJECTS_COLLECTION);
  const newId = `proj-${Date.now()}`;
  const fullProject: Project = {
    ...projectData,
    id: newId,
    order: (await getProjects()).length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, PROJECTS_COLLECTION, newId), fullProject);
  await logActivity('PROJECT_CREATED', 'project', newId, `Created project "${fullProject.title}" in Cloud Firestore.`);
  return fullProject;
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const updated: Project = {
    ...(snap.data() as Project),
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(docRef, updated as any);
  await logActivity('PROJECT_UPDATED', 'project', id, `Updated project "${updated.title}" in Cloud Firestore.`);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  const snap = await getDoc(docRef);
  const title = snap.exists() ? (snap.data() as Project).title : id;
  await deleteDoc(docRef);
  await logActivity('PROJECT_DELETED', 'project', id, `Deleted project "${title}" from Cloud Firestore.`);
  return true;
}

export async function toggleFeatureProject(id: string): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const current = snap.data() as Project;
  const newFeatured = !current.featured;
  await updateDoc(docRef, { featured: newFeatured, updatedAt: new Date().toISOString() });
  await logActivity(
    newFeatured ? 'PROJECT_FEATURED' : 'PROJECT_UNFEATURED',
    'project',
    id,
    `${newFeatured ? 'Featured' : 'Unfeatured'} project "${current.title}".`
  );
  return { ...current, featured: newFeatured };
}

// ----------------------------------------------------
// SKILLS & SERVICES
// ----------------------------------------------------
export async function getSkills(): Promise<SkillCategory[]> {
  try {
    const snap = await getDocs(collection(db, SKILLS_COLLECTION));
    if (snap.empty) return initialSkillCategories;
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as SkillCategory));
  } catch (e) {
    return initialSkillCategories;
  }
}

export async function updateSkills(categories: SkillCategory[]): Promise<SkillCategory[]> {
  for (const cat of categories) {
    await setDoc(doc(db, SKILLS_COLLECTION, cat.id), cat);
  }
  await logActivity('SKILLS_UPDATED', 'profile', undefined, 'Updated skills taxonomy in Cloud Firestore.');
  return categories;
}

export async function getServices(): Promise<Service[]> {
  try {
    const snap = await getDocs(collection(db, SERVICES_COLLECTION));
    if (snap.empty) return initialServices;
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Service));
  } catch (e) {
    return initialServices;
  }
}

export async function updateServices(services: Service[]): Promise<Service[]> {
  for (const s of services) {
    await setDoc(doc(db, SERVICES_COLLECTION, s.id), s);
  }
  await logActivity('SERVICES_UPDATED', 'profile', undefined, 'Updated services offerings in Cloud Firestore.');
  return services;
}

// ----------------------------------------------------
// MESSAGES (Contact Inquiries)
// ----------------------------------------------------
export async function sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'status'>): Promise<Message> {
  const colRef = collection(db, MESSAGES_COLLECTION);
  const msgId = `msg-${Date.now()}`;
  const newMsg: Message = {
    ...messageData,
    id: msgId,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, MESSAGES_COLLECTION, msgId), newMsg);
  await logActivity('MESSAGE_RECEIVED', 'message', msgId, `New contact message received from ${newMsg.name} (${newMsg.email}).`);
  return newMsg;
}

export async function getMessages(): Promise<Message[]> {
  try {
    const snap = await getDocs(collection(db, MESSAGES_COLLECTION));
    if (snap.empty) return initialMessages;
    const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Message));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return initialMessages;
  }
}

export async function updateMessageStatus(id: string, status: Message['status']): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  await updateDoc(docRef, { status });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
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

  await setDoc(doc(db, SCREENSHOTS_COLLECTION, jobId), newJob);
  await logActivity('SCREENSHOT_JOB_CREATED', 'screenshot', jobId, `Created screenshot capture job for ${url}.`);
  return newJob;
}

export async function getScreenshotJobs(): Promise<ScreenshotJob[]> {
  try {
    const snap = await getDocs(collection(db, SCREENSHOTS_COLLECTION));
    const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as ScreenshotJob));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return [];
  }
}

export async function updateScreenshotJob(id: string, patch: Partial<ScreenshotJob>): Promise<void> {
  const docRef = doc(db, SCREENSHOTS_COLLECTION, id);
  await updateDoc(docRef, patch as any);
}

export function subscribeToScreenshotJob(jobId: string, onUpdate: (job: ScreenshotJob) => void): () => void {
  return onSnapshot(doc(db, SCREENSHOTS_COLLECTION, jobId), snap => {
    if (snap.exists()) {
      onUpdate({ ...snap.data(), id: snap.id } as ScreenshotJob);
    }
  });
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
  try {
    const snap = await getDocs(collection(db, LOGS_COLLECTION));
    const logs = snap.docs.map(d => ({ ...d.data(), id: d.id } as ActivityLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
  } catch (e) {
    return [
      {
        id: 'log-default',
        action: 'FIREBASE_INITIALIZED',
        entityType: 'security',
        details: 'Cloud Firestore backend connected and active.',
        timestamp: new Date().toISOString(),
      },
    ];
  }
}
