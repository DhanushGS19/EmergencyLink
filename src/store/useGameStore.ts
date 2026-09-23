import { create } from 'zustand';

type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface GameState {
  currentLevel: Level; // 0 = Main Menu
  unlockedLevels: Level[];
  setLevel: (level: Level) => void;
  unlockLevel: (level: Level) => void;
  // Abilities for Level 2
  abilities: {
    trunkSwing: boolean;
    tuskClimb: boolean;
    earGlide: boolean;
  };
  unlockAbility: (ability: keyof GameState['abilities']) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentLevel: 0,
  unlockedLevels: [1, 2, 3, 4, 5, 6], // Unlock all levels for the prototype testing
  setLevel: (level) => set({ currentLevel: level }),
  unlockLevel: (level) =>
    set((state) => ({
      unlockedLevels: state.unlockedLevels.includes(level)
        ? state.unlockedLevels
        : [...state.unlockedLevels, level],
    })),
  abilities: {
    trunkSwing: false,
    tuskClimb: false,
    earGlide: false,
  },
  unlockAbility: (ability) =>
    set((state) => ({
      abilities: {
        ...state.abilities,
        [ability]: true,
      },
    })),
}));
