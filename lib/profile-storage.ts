import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profile = {
  name: string;
  courseYear: string;
  school: string;
};

const STORAGE_KEY = 'ed_qr_profile';

const EMPTY_PROFILE: Profile = { name: '', courseYear: '', school: '' };

export async function getProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      courseYear:
        typeof parsed.courseYear === 'string'
          ? parsed.courseYear
          : typeof (parsed as { section?: string }).section === 'string'
            ? ((parsed as { section?: string }).section as string)
            : '',
      school: typeof parsed.school === 'string' ? parsed.school : '',
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  const clean: Profile = {
    name: profile.name.trim().slice(0, 100),
    courseYear: profile.courseYear.trim().slice(0, 100),
    school: profile.school.trim().slice(0, 100),
  };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // ignore
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}