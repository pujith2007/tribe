import { backendReady, firebaseSetupMessage } from "./firebase";

export function ensureBackendReady() {
  if (!backendReady) {
    throw new Error(firebaseSetupMessage);
  }
}

export function getFriendlyError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "permission-denied") {
    return "You do not have permission for that action yet.";
  }

  if (error.code === "unavailable") {
    return "The backend is temporarily unavailable. Please try again.";
  }

  if (error.code === "auth/invalid-credential") {
    return "Those login details look incorrect. Please try again.";
  }

  if (error.code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before finishing.";
  }

  return error.message || fallbackMessage;
}
