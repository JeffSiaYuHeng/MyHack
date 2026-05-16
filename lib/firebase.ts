import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ─── MVP Collection Registry ──────────────────────────────────────────────────

const MVP_COLLECTIONS = [
  "programs",
  "applications",
  "cohorts",
  "companies",
  "mentors",
  "relationships",
  "meetings",
  "users",
] as const;

export type MvpCollectionName = (typeof MVP_COLLECTIONS)[number];

// ─── Firebase Config Status ───────────────────────────────────────────────────

const REQUIRED_CONFIG_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export interface FirebaseConfigStatus {
  ready: boolean;
  missingKeys: string[];
}

export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  const missingKeys = REQUIRED_CONFIG_KEYS.filter(
    (key) => !process.env[key]
  );
  return { ready: missingKeys.length === 0, missingKeys };
}

// ─── Safe Collection Write ────────────────────────────────────────────────────

export interface CollectionWriteResult {
  ok: boolean;
  collectionName: string;
  fallbackUsed: boolean;
  id?: string;
  error?: string;
}

export async function safeWrite(
  collectionName: MvpCollectionName,
  data: Record<string, unknown>
): Promise<CollectionWriteResult> {
  if (!(MVP_COLLECTIONS as ReadonlyArray<string>).includes(collectionName)) {
    return {
      ok: false,
      collectionName,
      fallbackUsed: true,
      error: `Collection '${collectionName}' is not a documented MVP collection`,
    };
  }
  const configStatus = getFirebaseConfigStatus();
  if (!configStatus.ready) {
    return {
      ok: false,
      collectionName,
      fallbackUsed: true,
      error: `Firebase config incomplete. Missing: ${configStatus.missingKeys.join(", ")}`,
    };
  }
  try {
    const ref = await addDoc(collection(db, collectionName), data);
    return { ok: true, collectionName, fallbackUsed: false, id: ref.id };
  } catch (err) {
    return {
      ok: false,
      collectionName,
      fallbackUsed: true,
      error: err instanceof Error ? err.message : "Firestore write failed",
    };
  }
}

// ─── Legacy Helpers ───────────────────────────────────────────────────────────

export async function saveResult(collectionName: string, data: Record<string, unknown>) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export { db, auth };
