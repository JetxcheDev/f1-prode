import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "./firebase";
import { User } from "firebase/auth";

const ITEMS_COLLECTION = "items";
const USERS_COLLECTION = "users";
const PILOTS_COLLECTION = "pilots";
const RACES_COLLECTION = "races";
const VOTES_COLLECTION = "votes";
const RESULTS_COLLECTION = "results";
const SCORING_CONFIG_COLLECTION = "settings";

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Pilot {
  id?: string;
  name: string;
  team: string;
  number: number;
  country: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Race {
  id?: string;
  name: string;
  location: string;
  date: Timestamp;
  status: 'upcoming' | 'active' | 'completed';
  votingDeadline: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Vote {
  id?: string;
  userId: string;
  raceId: string;
  pole: string; // pilot id
  positions: string[]; // array of 10 pilot ids
  crashPilot: string; // pilot id
  createdAt: Timestamp;
}

export interface RaceResult {
  id?: string;
  raceId: string;
  pole: string; // pilot id
  positions: string[]; // array of pilot ids in finishing order
  crashPilot: string;
  createdAt: Timestamp;
}

export interface ScoringConfig {
  id?: string;
  polePoints: number;
  position1Points: number;
  position2Points: number;
  position3Points: number;
  position4to10Points: number;
  crashPoints: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const getItems = async () => {
  const snapshot = await getDocs(collection(firestore, ITEMS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createItem = async (item: Record<string, unknown>) => {
  return await addDoc(collection(firestore, ITEMS_COLLECTION), item);
};

export const updateItem = async (id: string, item: Record<string, unknown>) => {
  const itemRef = doc(firestore, ITEMS_COLLECTION, id);
  return await updateDoc(itemRef, item);
};

export const deleteItem = async (id: string) => {
  const itemRef = doc(firestore, ITEMS_COLLECTION, id);
  return await deleteDoc(itemRef);
};

export const createUserProfile = async (user: User, role: UserRole = 'user'): Promise<UserProfile> => {
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  const userRef = doc(firestore, USERS_COLLECTION, user.uid);
  await setDoc(userRef, userProfile);
  return userProfile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(firestore, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserRole = async (uid: string, newRole: UserRole): Promise<void> => {
  const userRef = doc(firestore, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: Timestamp.now()
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const snapshot = await getDocs(collection(firestore, USERS_COLLECTION));
  return snapshot.docs.map(doc => doc.data() as UserProfile);
};

export const hasAdminUser = async (): Promise<boolean> => {
  const adminQuery = query(
    collection(firestore, USERS_COLLECTION),
    where('role', '==', 'admin')
  );
  const adminSnapshot = await getDocs(adminQuery);
  return !adminSnapshot.empty;
};

export const ensureAdminExists = async (user: User): Promise<UserProfile> => {
  const hasAdmin = await hasAdminUser();
  const role: UserRole = hasAdmin ? 'user' : 'admin';
  return await createUserProfile(user, role);
};

export const getAllPilots = async (): Promise<Pilot[]> => {
  const snapshot = await getDocs(collection(firestore, PILOTS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pilot));
};

export const createPilot = async (pilot: Omit<Pilot, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const pilotData = {
    ...pilot,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  const docRef = await addDoc(collection(firestore, PILOTS_COLLECTION), pilotData);
  return docRef.id;
};

export const updatePilot = async (id: string, pilot: Partial<Omit<Pilot, 'id' | 'createdAt'>>): Promise<void> => {
  const pilotRef = doc(firestore, PILOTS_COLLECTION, id);
  await updateDoc(pilotRef, {
    ...pilot,
    updatedAt: Timestamp.now()
  });
};

export const deletePilot = async (id: string): Promise<void> => {
  const pilotRef = doc(firestore, PILOTS_COLLECTION, id);
  await deleteDoc(pilotRef);
};

export const getAllRaces = async (): Promise<Race[]> => {
  const snapshot = await getDocs(collection(firestore, RACES_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Race));
};

export const createRace = async (race: Omit<Race, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const raceData = {
    ...race,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  const docRef = await addDoc(collection(firestore, RACES_COLLECTION), raceData);
  return docRef.id;
};

export const updateRace = async (id: string, race: Partial<Omit<Race, 'id' | 'createdAt'>>): Promise<void> => {
  const raceRef = doc(firestore, RACES_COLLECTION, id);
  await updateDoc(raceRef, {
    ...race,
    updatedAt: Timestamp.now()
  });
};

export const deleteRace = async (id: string): Promise<void> => {
  const raceRef = doc(firestore, RACES_COLLECTION, id);
  await deleteDoc(raceRef);
};

export const getUserVoteForRace = async (userId: string, raceId: string): Promise<Vote | null> => {
  const q = query(
    collection(firestore, VOTES_COLLECTION),
    where('userId', '==', userId),
    where('raceId', '==', raceId)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Vote;
};

export const createVote = async (vote: Omit<Vote, 'id' | 'createdAt'>): Promise<string> => {
  const voteData = {
    ...vote,
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(collection(firestore, VOTES_COLLECTION), voteData);
  return docRef.id;
};

export const getRaceResult = async (raceId: string): Promise<RaceResult | null> => {
  const q = query(
    collection(firestore, RESULTS_COLLECTION),
    where('raceId', '==', raceId)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as RaceResult;
};

export const createRaceResult = async (result: Omit<RaceResult, 'id' | 'createdAt'>): Promise<string> => {
  const resultData = {
    ...result,
    createdAt: Timestamp.now()
  };
  const docRef = await addDoc(collection(firestore, RESULTS_COLLECTION), resultData);
  return docRef.id;
};

export const updateRaceResult = async (id: string, result: Partial<Omit<RaceResult, 'id' | 'createdAt'>>): Promise<void> => {
  const resultRef = doc(firestore, RESULTS_COLLECTION, id);
  await updateDoc(resultRef, result);
};

export const getVotesForRace = async (raceId: string): Promise<Vote[]> => {
  const q = query(
    collection(firestore, VOTES_COLLECTION),
    where('raceId', '==', raceId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
};

export const getAllVotes = async (): Promise<RaceResult[]> => {
  const snapshot = await getDocs(collection(firestore, VOTES_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
};

export const getAllResults = async (): Promise<RaceResult[]> => {
  const snapshot = await getDocs(collection(firestore, RESULTS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RaceResult));
};

export const getScoringConfig = async (): Promise<ScoringConfig | null> => {
  const configRef = doc(firestore, SCORING_CONFIG_COLLECTION, 'points');
  const configSnap = await getDoc(configRef);
  
  if (configSnap.exists()) {
    return { id: configSnap.id, ...configSnap.data() } as ScoringConfig;
  }
  return null;
};

export const createScoringConfig = async (config: Omit<ScoringConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const configData: Omit<ScoringConfig, 'id'> = {
    ...config,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  const configRef = doc(firestore, SCORING_CONFIG_COLLECTION, 'points');
  await setDoc(configRef, configData);
};

export const updateScoringConfig = async (config: Omit<ScoringConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const configRef = doc(firestore, SCORING_CONFIG_COLLECTION, 'points');
  const updateData = {
    ...config,
    updatedAt: Timestamp.now()
  };
  
  await updateDoc(configRef, updateData);
};

export const saveOrUpdateScoringConfig = async (config: Omit<ScoringConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const existingConfig = await getScoringConfig();
  
  if (existingConfig) {
    await updateScoringConfig(config);
  } else {
    await createScoringConfig(config);
  }
};
