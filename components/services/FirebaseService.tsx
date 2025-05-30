import { collection, query, where, getDocs, doc, getDoc, DocumentReference, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config/firebase';

const CATEGORIES_CACHE_KEY = 'CACHED_CATEGORIES';
const DUAS_CACHE_KEY = 'CACHED_DUAS';
const INSTRUCTIONS_CACHE_KEY = 'CACHED_INSTRUCTIONS';
const MADHAB_CATEGORIES_CACHE_KEY = 'CACHED_MADHAB_CATEGORIES';
const ADHAN_SOUNDS_CACHE_KEY = 'CACHED_ADHAN_SOUNDS';

export interface PrayerStepData {
  id: string;
  name: string;
  title: string;
  description: string;
  rakat_number: string;
}

export interface PrayerInstructionData {
  id: string;
  name: string;
  title: string;
  prayer_steps: PrayerStepData[];
  categoryId: string;
  coming_soon: boolean;
}

export interface MadhabCategoryData {
  id: string;
  name: string;
  available: boolean;
  prayers: PrayerInstructionData[];
  order: number;
}

export interface CategoryData {
  id: string;
  order: number;
  name: string;
  description: string;
  color: string;
  image: string;
  image_url: string;
  available: boolean;
  type: string;
}

export interface DuaData {
  id: string;
  category: string;
  order: number;
  available: boolean;
  title: string;
  type: string;
  arabic_text: string;
  english_transliteration: string;
  english_translation: string;
  audio?: {
    file?: string;
    url?: string;
  };
  reference: string;
  coming_soon: boolean;
}

export interface CountryData {
  id: string;
  name: string;
  flag: string; // url
}

export interface AdhanSoundData {
  id: string;
  name: string;
  order: number;
  sound: string;
  country: CountryData;
}

const checkInternetConnection = async () => {
  try {
    await fetch('https://www.google.com');
    return true;
  } catch (error) {
    return false;
  }
};

const getCachedCategories = async (): Promise<CategoryData[]> => {
  const cachedData = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
  return cachedData ? JSON.parse(cachedData) : [];
};

export const getCachedDuasByCategory = async (categoryId: string): Promise<DuaData[]> => {
  const cachedData = await AsyncStorage.getItem(`${DUAS_CACHE_KEY}_${categoryId}`);
  return cachedData ? JSON.parse(cachedData) : [];
};

export const getCachedInstructionsByCategory = async (categoryId: string): Promise<PrayerInstructionData[]> => {
  const cachedData = await AsyncStorage.getItem(`${INSTRUCTIONS_CACHE_KEY}_${categoryId}`);
  return cachedData ? JSON.parse(cachedData) : [];
};

const fetchCategoriesFromFirebase = async (): Promise<CategoryData[]> => {
  const categoriesRef = collection(db, 'dua_categories');
  const q = query(categoriesRef, where("available", "==", true));
  const querySnapshot = await getDocs(q);
  
  const categories = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const data = doc.data() as CategoryData;
    return {
      id: doc.id,
      ...data,
      image: (!data.image || data.image === "") ? data.image_url : data.image
    };
  }));

  return categories.sort((a, b) => a.order - b.order);
};

const fetchDuasByCategoryFromFirebase = async (categoryId: string): Promise<DuaData[]> => {
  const duasRef = collection(db, 'duas');
  const categoryRef = doc(db, 'dua_categories', categoryId);
  const q = query(duasRef, where("available", "==", true), where("category", "==", categoryRef));
  const querySnapshot = await getDocs(q);
  
  const duas = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const data = doc.data() as DuaData;
    let audioData = data.audio;

    return {
      id: doc.id,
      ...data,
      category: categoryId, // Store the category as a string ID
      audio: audioData,
      coming_soon: data.coming_soon
    };
  }));

  // Sort the duas by order number in ascending order
  return duas.sort((a, b) => a.order - b.order);
};

const fetchInstructionsByCategoryFromFirebase = async (categoryId: string): Promise<PrayerInstructionData[]> => {
  const instructionsRef = collection(db, 'prayer_instructions');
  const categoryRef = doc(db, 'dua_categories', categoryId);
  const q = query(instructionsRef, where("category", "==", categoryRef));
  const querySnapshot = await getDocs(q);
  
  const instructions = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const data = doc.data();

    const stepRefs = data.prayer_steps as DocumentReference[];
    const prayerSteps = await fetchPrayerSteps(stepRefs);

    let categoryId = "";
    if (data.category && data.category instanceof DocumentReference) {
      categoryId = data.category.id;
    }
    return {
      id: doc.id,
      name: data.name,
      title: data.title,
      prayer_steps: prayerSteps,
      categoryId: categoryId,
      coming_soon: data.coming_soon
    } as PrayerInstructionData;
  }));

  return instructions;
};

export const fetchCategories = async (
  setCategories: (categories: CategoryData[]) => void
): Promise<{ error: string | null }> => {
  try {
    const cachedCategories = await getCachedCategories();
    setCategories(cachedCategories);

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      // console.log('Device is offline, using cached data');
      return { error: cachedCategories.length ? null : 'No internet connection and no cached data available.' };
    }

    // console.log('Device is online, fetching categories from Firebase');
    const fetchedCategories = await fetchCategoriesFromFirebase();

    await AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(fetchedCategories));
    setCategories(fetchedCategories);
    
    // console.log('Updated categories from Firebase');
    return { error: null };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { error: 'Failed to fetch categories. Please try again later.' };
  }
};

export const fetchDuasByCategory = async (
  categoryId: string,
  setDuas: (duas: DuaData[]) => void
): Promise<{ error: string | null }> => {
  try {
    const cachedDuas = await getCachedDuasByCategory(categoryId);
    setDuas(cachedDuas);

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      // console.log('Device is offline, using cached data');
      return { error: cachedDuas.length ? null : 'No internet connection and no cached data available.' };
    }

    // console.log('Device is online, fetching duas from Firebase');
    const fetchedDuas = await fetchDuasByCategoryFromFirebase(categoryId);

    await AsyncStorage.setItem(`${DUAS_CACHE_KEY}_${categoryId}`, JSON.stringify(fetchedDuas));
    setDuas(fetchedDuas);
    
    // console.log('Updated duas from Firebase');
    return { error: null };
  } catch (error) {
    console.error("Error fetching duas:", error);
    return { error: 'Failed to fetch duas. Please try again later.' };
  }
};

export const fetchInstructionsByCategory = async (
  categoryId: string,
  setInstructions: (instructions: PrayerInstructionData[]) => void
): Promise<{ error: string | null }> => {
  try {
    const cachedInstructions = await getCachedInstructionsByCategory(categoryId);
    setInstructions(cachedInstructions);

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      // console.log('Device is offline, using cached data');
      return { error: cachedInstructions.length ? null : 'No internet connection and no cached data available.' };
    }

    // console.log('Device is online, fetching instructions from Firebase');
    const fetchedInstructions = await fetchInstructionsByCategoryFromFirebase(categoryId);

    await AsyncStorage.setItem(`${INSTRUCTIONS_CACHE_KEY}_${categoryId}`, JSON.stringify(fetchedInstructions));
    setInstructions(fetchedInstructions);
    
    // console.log('Updated instructions from Firebase');
    return { error: null };
  } catch (error) {
    console.error("Error fetching instructions:", error);
    return { error: 'Failed to fetch instructions. Please try again later.' };
  }
}

export const encodeForStorage = (url: string) => url.replace(/%2F/g, '%252F');
export const decodeAfterRetrieval = (url: string) => url.replace(/%252F/g, '%2F');

const getCachedMadhabCategories = async (): Promise<MadhabCategoryData[]> => {
  const cachedData = await AsyncStorage.getItem(MADHAB_CATEGORIES_CACHE_KEY);
  return cachedData ? JSON.parse(cachedData) : [];
};

const fetchPrayerSteps = async (stepRefs: DocumentReference[]): Promise<PrayerStepData[]> => {
  const prayerSteps = await Promise.all(
    stepRefs.map(async (stepRef) => {
      const stepDoc = await getDoc(stepRef);
      if (stepDoc.exists()) {
        const data = stepDoc.data();
        if (data.image && data.image.file) {
          data.image.file = encodeForStorage(data.image.file);
        }

        return {
          id: stepDoc.id,
          ...data
        } as PrayerStepData;
      }
      return null;
    })
  );
  return prayerSteps.filter((step): step is PrayerStepData => step !== null);
};

const fetchPrayerInstructions = async (prayerRefs: DocumentReference[]): Promise<PrayerInstructionData[]> => {
  const prayerInstructions = await Promise.all(
    prayerRefs.map(async (ref) => {
      const prayerDoc = await getDoc(ref);
      if (prayerDoc.exists()) {
        const data = prayerDoc.data();
        const stepRefs = data.prayer_steps as DocumentReference[];
        const prayerSteps = await fetchPrayerSteps(stepRefs);

        let categoryId = "";
        if (data.category && data.category instanceof DocumentReference) {
          categoryId = data.category.id;
        }
        return {
          id: prayerDoc.id,
          name: data.name,
          title: data.title,
          prayer_steps: prayerSteps,
          categoryId: categoryId,
          coming_soon: data.coming_soon
        } as PrayerInstructionData;
      }
      return null;
    })
  );
  return prayerInstructions.filter((prayer): prayer is PrayerInstructionData => prayer !== null);
};

const fetchMadhabCategoriesFromFirebase = async (): Promise<MadhabCategoryData[]> => {
  const madhabCategoriesRef = collection(db, 'madhab_categories');
  const q = query(madhabCategoriesRef, where("available", "==", true));
  const querySnapshot = await getDocs(q);
  
  const madhabCategories = await Promise.all(querySnapshot.docs.map(async (doc) => {
    const data = doc.data();
    const prayerRefs = data.prayers as DocumentReference[];
    const prayerInstructions = await fetchPrayerInstructions(prayerRefs);

    return {
      id: doc.id,
      name: data.name,
      available: data.available,
      order: data.order,
      prayers: prayerInstructions,
    } as MadhabCategoryData;
  }));

  return madhabCategories.sort((a, b) => a.order - b.order);
};

export const fetchMadhabCategories = async (
  setMadhabCategories: (categories: MadhabCategoryData[]) => void
): Promise<{ error: string | null }> => {
  try {
    const cachedMadhabCategories = await getCachedMadhabCategories();
    setMadhabCategories(cachedMadhabCategories);

    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      // console.log('Device is offline, using cached data');
      return { error: cachedMadhabCategories.length ? null : 'No internet connection and no cached data available.' };
    }

    // console.log('Device is online, fetching Madhab categories from Firebase');
    const fetchedMadhabCategories = await fetchMadhabCategoriesFromFirebase();

    await AsyncStorage.setItem(MADHAB_CATEGORIES_CACHE_KEY, JSON.stringify(fetchedMadhabCategories));
    setMadhabCategories(fetchedMadhabCategories);
    
    // console.log('Updated Madhab categories from Firebase');
    return { error: null };
  } catch (error) {
    console.error("Error fetching Madhab categories:", error);
    return { error: 'Failed to fetch Madhab categories. Please try again later.' };
  }
};


export interface UserReportData {
  name: string;
  email: string;
  content: string;
}
export const writeUserReport = async (reportData: UserReportData): Promise<{ error: string | null }> => {
  try {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return { error: 'No internet connection. Please try again when you\'re online.' };
    }

    const userReportsRef = collection(db, 'user_reports');
    await addDoc(userReportsRef, reportData);
    
    console.log('User report submitted successfully');
    return { error: null };
  } catch (error) {
    console.error("Error submitting user report:", error);
    return { error: 'Failed to submit user report. Please try again later.' };
  }
};

const getCachedAdhanSounds = async (): Promise<AdhanSoundData[]> => {
  const cachedData = await AsyncStorage.getItem(ADHAN_SOUNDS_CACHE_KEY);
  return cachedData ? JSON.parse(cachedData) : [];
};

const fetchCountryData = async (countryRef: DocumentReference): Promise<CountryData | null> => {
  try {
    const countryDoc = await getDoc(countryRef);
    if (countryDoc.exists()) {
      const data = countryDoc.data();
      return {
        id: countryDoc.id,
        name: data.name,
        flag: data.flag
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
};

const fetchAdhanSoundsFromFirebase = async (): Promise<AdhanSoundData[]> => {
  const adhanSoundsRef = collection(db, 'adhan_sounds');
  const querySnapshot = await getDocs(adhanSoundsRef);
  
  const adhanSounds = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
    const data = docSnapshot.data();
    let countryData = null;
    
    if (data.country) {
      countryData = await fetchCountryData(data.country);
    }

    return {
      id: docSnapshot.id,
      name: data.name,
      order: data.order,
      sound: data.sound,
      country: countryData
    } as AdhanSoundData;
  }));

  return adhanSounds.sort((a, b) => a.order - b.order);
};

export const fetchAdhanSounds = async (
  setAdhanSounds: (adhanSounds: AdhanSoundData[]) => void
): Promise<{ error: string | null }> => {
  try {
    const cachedAdhanSounds = await getCachedAdhanSounds();
    setAdhanSounds(cachedAdhanSounds);
    console.log('adhanSounds', cachedAdhanSounds);
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      return { error: cachedAdhanSounds.length ? null : 'No internet connection and no cached data available.' };
    }

    const fetchedAdhanSounds = await fetchAdhanSoundsFromFirebase();
    await AsyncStorage.setItem(ADHAN_SOUNDS_CACHE_KEY, JSON.stringify(fetchedAdhanSounds));
    setAdhanSounds(fetchedAdhanSounds);
    
    return { error: null };
  } catch (error) {
    console.error("Error fetching adhan sounds:", error);
    return { error: 'Failed to fetch adhan sounds. Please try again later.' };
  }
};