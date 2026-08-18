# Firebase Unified Backend Setup & Architecture

## Overview
This platform uses **Firebase as the single unified backend ecosystem** for all persistence, authentication, storage, and server-side automation.

- **Project ID**: `vaulted-byway-p6shk`
- **Database**: Cloud Firestore (`ai-studio-kirlouswaelengin-b798671c-f9e5-42e9-97dd-09b14a6dcf23`)
- **Authentication**: Firebase Authentication (Email + Password, Admin Role Verification)
- **Cloud Storage**: Firebase Cloud Storage (`vaulted-byway-p6shk.firebasestorage.app`)
- **AI Layer**: Server-Side Google Gemini API (`@google/genai`)

---

## 1. Cloud Firestore Architecture

### Collections & Data Model
- `/profiles/main-profile` — Lead engineer bio, credentials, title, contacts, availability status.
- `/projects/{projectId}` — Case studies, technical problem & solution, verified technology schemas, multi-viewport screenshots, and AI audits.
- `/skills/{skillId}` — Taxonomy categories (Web, Android, Cloud, AI) with proficiency levels and experience years.
- `/services/{serviceId}` — Engineering offerings, deliverables, and technology stacks.
- `/messages/{messageId}` — Client contact inquiries with status tracking (`unread`, `read`, `archived`).
- `/screenshotJobs/{jobId}` — Asynchronous Playwright screenshot capture pipeline jobs with step progress.
- `/activityLogs/{logId}` — Security & administrative audit logs.
- `/siteSettings/global-settings` — Global SEO titles, descriptions, and feature flags.

---

## 2. Firebase Authentication

### Security Model
- **Public Portfolio**: Open read access for published projects, profile, skills, and services.
- **Admin Control Center**: Guarded by Firebase Auth.
- **Credentials**: Email + Password authentication (`waelkirlous@gmail.com`).
- **Initial Setup**: First-time admin users can initialize or reset credentials directly via the secure Admin Login modal.

---

## 3. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated();
    }

    match /profiles/{profileId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /projects/{projectId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /messages/{messageId} {
      allow create: if request.resource.data.name is string 
                    && request.resource.data.email is string
                    && request.resource.data.message is string;
      allow read, update, delete: if isAdmin();
    }

    match /screenshotJobs/{jobId} {
      allow read, write: if isAdmin();
    }

    match /activityLogs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 4. Firebase Cloud Storage Structure

```
projects/{projectId}/
  ├── cover/              # AI-recommended high-contrast banner images
  ├── screenshots/        # Multi-viewport Playwright captures (Desktop, Laptop, Tablet, Mobile)
  └── thumbnails/         # Fast-loading optimized preview cards
profile/                  # Profile avatars and visual assets
```

---

## 5. Automated Screenshot & AI Pipeline

When an admin creates or updates a project with a live URL:
1. A new `screenshotJob` is recorded in Cloud Firestore with status `queued`.
2. The server-side Playwright worker is triggered with strict SSRF validation (blocking localhost, private IP ranges, and internal metadata endpoints).
3. Multi-viewport screenshots are captured:
   - **Desktop**: 1440x900
   - **Laptop**: 1280x800
   - **Tablet**: 768x1024
   - **Mobile**: 390x844
4. Assets are uploaded to Firebase Cloud Storage.
5. Google Gemini visual analysis scores the screenshots (Visual Quality, Composition, Typography, Readability) and recommends the optimal cover asset.
6. Firestore project document is updated atomically.

---

## 6. Environment Configuration

The following variables configure the unified Firebase and AI stack:

```env
# Gemini API Key (Server-Side Only)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
# Automatically loaded from firebase-applet-config.json
```
