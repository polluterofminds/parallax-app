export type Character = {
  characterId: string;
  characterName: string;
  gender: string;
  age: number;
  backstory: string;
};

export type BaseCharacter = {
  keyvalues: {
    characterId: string;
  };
  name: string;
  id: string;
  cid: string;
};

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export type FCProfile = {
  username: string;
  fid: string;
  displayName: string;
};

export type Episode = {
  id: string;
  case_number: number;
  case_hash: string;
  created_at: string;
  duration: number;
};

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};
