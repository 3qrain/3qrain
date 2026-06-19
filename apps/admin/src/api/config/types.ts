export interface PersonalInfo {
  name: string;
  email: string;
  avatar: string;
  bio: string;
}

export interface Appearance {
  theme: "system" | "light" | "dark";
}

export interface FullConfig {
  personalInfo: PersonalInfo;
  appearance: Appearance;
}
