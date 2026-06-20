import { updateProfile, type User } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import {
  DEFAULT_PROFILE_AVATAR_ID,
  isProfileAvatarId,
  type PlayerAvatarId,
} from "@/constants/profile-avatars";
import { getDisplayNameFromUser } from "@/services/auth-service";
import { getFirebaseDb, getFirebaseStorage } from "@/services/firebase";

export type PlayerProfile = {
  avatarId: PlayerAvatarId;
  displayName: string;
  photoURL: string;
  userId: string;
};

const PROFILE_COLLECTION = "userProfiles";
const LEADERBOARD_COLLECTION = "competitionLeaderboard";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeProfile(
  userId: string,
  data: DocumentData | null | undefined,
  fallbackName = "Player",
): PlayerProfile {
  return {
    avatarId: isProfileAvatarId(data?.avatarId)
      ? data.avatarId
      : DEFAULT_PROFILE_AVATAR_ID,
    displayName: asString(data?.displayName, fallbackName),
    photoURL: asString(data?.photoURL),
    userId,
  };
}

function getProfileDoc(userId: string) {
  return doc(getFirebaseDb(), PROFILE_COLLECTION, userId);
}

export async function loadPlayerProfile(user: User): Promise<PlayerProfile> {
  try {
    const snapshot = await getDoc(getProfileDoc(user.uid));
    const fallbackName = getDisplayNameFromUser(user) || "Player";
    return normalizeProfile(
      user.uid,
      snapshot.exists() ? snapshot.data() : null,
      fallbackName,
    );
  } catch {
    return normalizeProfile(user.uid, null, getDisplayNameFromUser(user) || "Player");
  }
}

export function watchPlayerProfile(
  user: User,
  onChange: (profile: PlayerProfile) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    getProfileDoc(user.uid),
    (snapshot) => {
      onChange(
        normalizeProfile(
          user.uid,
          snapshot.exists() ? snapshot.data() : null,
          getDisplayNameFromUser(user) || "Player",
        ),
      );
    },
    onError,
  );
}

export async function savePlayerProfile(
  user: User,
  profile: Partial<Pick<PlayerProfile, "avatarId" | "displayName" | "photoURL">>,
) {
  const displayName = profile.displayName?.trim();
  const avatarId = isProfileAvatarId(profile.avatarId)
    ? profile.avatarId
    : undefined;
  const hasPhotoURL = Object.prototype.hasOwnProperty.call(profile, "photoURL");
  const photoURL = hasPhotoURL ? profile.photoURL?.trim() ?? "" : undefined;
  const payload = {
    ...(avatarId ? { avatarId } : {}),
    ...(displayName ? { displayName } : {}),
    ...(hasPhotoURL ? { photoURL } : {}),
    updatedAt: serverTimestamp(),
    userId: user.uid,
  };

  const profileDoc = getProfileDoc(user.uid);

  await setDoc(profileDoc, payload, { merge: true });

  const leaderboardDoc = doc(getFirebaseDb(), LEADERBOARD_COLLECTION, user.uid);
  const leaderboardSnapshot = await getDoc(leaderboardDoc);
  if (leaderboardSnapshot.exists()) {
    await setDoc(
      leaderboardDoc,
      {
        ...(avatarId ? { avatarId } : {}),
        ...(displayName ? { playerName: displayName } : {}),
        ...(hasPhotoURL ? { photoURL } : {}),
        playerId: user.uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  await updateProfile(user, {
    ...(displayName ? { displayName } : {}),
    ...(hasPhotoURL ? { photoURL } : {}),
  });

  return loadPlayerProfile(user);
}

export async function uploadPlayerProfileImage(user: User, imageUri: string) {
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const contentType = blob.type || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : "jpg";
  const avatarRef = storageRef(
    getFirebaseStorage(),
    `profileImages/${user.uid}/avatar.${extension}`,
  );

  await uploadBytes(avatarRef, blob, { contentType });

  const downloadURL = await getDownloadURL(avatarRef);
  const photoURL = `${downloadURL}${downloadURL.includes("?") ? "&" : "?"}updated=${Date.now()}`;
  return savePlayerProfile(user, { photoURL });
}
