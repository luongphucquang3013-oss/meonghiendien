import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseCustomConfig } from '../types.ts';

// Cấu hình Firebase cố định lưu trực tiếp trong mã nguồn
export const FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: "AIzaSyCsacFzgeLzuM8hXzEV-dzVEcpDqPJ76NE",
  authDomain: "esp32-test-36152.firebaseapp.com",
  projectId: "esp32-test-36152",
  storageBucket: "esp32-test-36152.firebasestorage.app",
  messagingSenderId: "816661796884",
  appId: "1:816661796884:web:9e8f3e4071a4bc329cef01",
};

// Dọn dẹp key cũ trong LocalStorage để tránh xung đột
try {
  localStorage.removeItem('smarttest_firebase_config');
} catch {}

let appInstance: any = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let isConfigured = false;

try {
  if (!getApps().length) {
    appInstance = initializeApp(FIREBASE_CONFIG);
  } else {
    appInstance = getApp();
  }
  authInstance = getAuth(appInstance);
  firestoreInstance = getFirestore(appInstance);
  isConfigured = true;
  console.log('Firebase đã khởi tạo với project cố định:', FIREBASE_CONFIG.projectId);
} catch (error) {
  console.error('Khởi tạo Firebase thất bại:', error);
  isConfigured = false;
}

export const auth = authInstance;
export const db = firestoreInstance;
export const isFirebaseActive = isConfigured;
export const activeProjectId = FIREBASE_CONFIG.projectId;
export const DEFAULT_FIREBASE_CONFIG = FIREBASE_CONFIG;

// Compatibility stubs
export function getSavedFirebaseConfig(): FirebaseCustomConfig {
  return FIREBASE_CONFIG;
}
export function saveFirebaseConfig(_config: FirebaseCustomConfig) {}
export function clearFirebaseConfig() {}
