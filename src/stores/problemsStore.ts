import { create } from "zustand";
import type { ProblemItem } from "@/features/problemsPanel/types";

type ProblemsStore = {
  problems: ProblemItem[];
  setProblems: (problems: ProblemItem[]) => void;
  clearProblems: () => void;
};

export const useProblemsStore = create<ProblemsStore>((set) => ({
  problems: [],
  setProblems: (problems) => set({ problems }),
  clearProblems: () => set({ problems: [] }),
}));
