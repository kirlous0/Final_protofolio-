import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a binary File or Blob to Firebase Cloud Storage
 */
export async function uploadProjectMedia(
  projectId: string,
  file: File | Blob,
  folder: 'cover' | 'screenshots' | 'thumbnails' = 'screenshots',
  fileName?: string
): Promise<string> {
  const name = fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.png`;
  const storageRef = ref(storage, `projects/${projectId}/${folder}/${name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

/**
 * Upload a Base64 data URL string to Firebase Cloud Storage
 */
export async function uploadBase64Image(
  path: string,
  base64DataUrl: string
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadString(storageRef, base64DataUrl, 'data_url');
  return await getDownloadURL(snapshot.ref);
}

/**
 * Upload a profile avatar to Firebase Cloud Storage
 */
export async function uploadProfileAvatar(file: File | Blob): Promise<string> {
  const name = `avatar-${Date.now()}.png`;
  const storageRef = ref(storage, `profile/${name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
