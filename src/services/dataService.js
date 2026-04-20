import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  addDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { ensureBackendReady } from "./serviceGuards";

export async function getOrCreateUserProfile(user) {
  ensureBackendReady();
  const profileRef = doc(db, "profiles", user.uid);
  const snapshot = await getDoc(profileRef);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }

  const fallbackName = user.displayName || user.email?.split("@")[0] || "Creator";
  const profile = {
    name: fallbackName,
    email: user.email || "",
    bio: "Documenting one thoughtful creative step at a time.",
    avatar:
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=6f86a3&color=fff`,
    weeklyGoal: 5,
    followers: [],
    following: [],
    views: 0,
    createdAt: serverTimestamp(),
  };

  await setDoc(profileRef, profile);
  return { id: user.uid, ...profile };
}

export function subscribeToFeed(callback, onError) {
  ensureBackendReady();
  const feedQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(25));

  return onSnapshot(
    feedQuery,
    (snapshot) => {
      const posts = snapshot.docs.map((postDoc) => ({
        id: postDoc.id,
        ...postDoc.data(),
      }));

      callback(posts);
    },
    onError,
  );
}

export async function createPost({ user, profile, caption, imageFile, tags }) {
  ensureBackendReady();
  const extension = imageFile.name.split(".").pop();
  const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}.${extension}`);
  await uploadBytes(imageRef, imageFile);
  const imageUrl = await getDownloadURL(imageRef);

  await addDoc(collection(db, "posts"), {
    authorId: user.uid,
    authorName: profile.name,
    authorAvatar: profile.avatar,
    caption,
    imageUrl,
    imagePath: imageRef.fullPath,
    tags: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    likes: [],
    commentCount: 0,
    shareCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function toggleLike(postId, userId, hasLiked) {
  ensureBackendReady();
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function addComment(postId, profile, text) {
  ensureBackendReady();
  if (!text.trim()) {
    return null;
  }

  const commentRef = await addDoc(collection(db, "posts", postId, "comments"), {
    userId: profile.id,
    userName: profile.name,
    userAvatar: profile.avatar,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "posts", postId), {
    commentCount: increment(1),
  });

  const snapshot = await getDoc(commentRef);
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function sharePost(postId) {
  ensureBackendReady();
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    shareCount: increment(1),
  });
}

export async function deletePost(post) {
  ensureBackendReady();
  await deleteDoc(doc(db, "posts", post.id));

  if (post.imagePath) {
    const imageRef = ref(storage, post.imagePath);
    await deleteObject(imageRef);
  }
}

export async function updateUserProfile(userId, updates) {
  ensureBackendReady();
  const profileRef = doc(db, "profiles", userId);
  await updateDoc(profileRef, updates);
}

export async function toggleFollowUser(currentUserId, targetUserId, isFollowing) {
  ensureBackendReady();
  const currentProfileRef = doc(db, "profiles", currentUserId);
  const targetProfileRef = doc(db, "profiles", targetUserId);

  await updateDoc(currentProfileRef, {
    following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId),
  });

  await updateDoc(targetProfileRef, {
    followers: isFollowing ? arrayRemove(currentUserId) : arrayUnion(currentUserId),
  });
}

export async function getProfileById(userId) {
  ensureBackendReady();
  const profileSnapshot = await getDoc(doc(db, "profiles", userId));

  if (!profileSnapshot.exists()) {
    return null;
  }

  return { id: profileSnapshot.id, ...profileSnapshot.data() };
}

export async function getUserPosts(userId) {
  ensureBackendReady();
  const postsSnapshot = await getDocs(
    query(collection(db, "posts"), where("authorId", "==", userId), orderBy("createdAt", "desc")),
  );

  return postsSnapshot.docs.map((postDoc) => ({
    id: postDoc.id,
    ...postDoc.data(),
  }));
}

export async function getPostComments(postId) {
  ensureBackendReady();

  const commentsSnapshot = await getDocs(
    query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"), limit(20)),
  );

  return commentsSnapshot.docs.map((commentDoc) => ({
    id: commentDoc.id,
    ...commentDoc.data(),
  }));
}
