import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureBackendReady } from "./serviceGuards";

const provider = new GoogleAuthProvider();
provider.addScope("email");
provider.addScope("profile");
provider.setCustomParameters({
  prompt: "select_account",
});

export function subscribeToAuthChanges(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail(email, password) {
  ensureBackendReady();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail(name, email, password) {
  ensureBackendReady();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function loginWithGoogle() {
  ensureBackendReady();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function logoutUser() {
  ensureBackendReady();
  await signOut(auth);
}
