import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DraftProgram } from '../data/programDraft';
import { defaultDraft, draftFromProgram } from '../data/programDraft';
import type { StatusProgram } from '../data/loyalty';

interface ProgramCtx {
  draft: DraftProgram;
  update: (patch: Partial<DraftProgram>) => void;
  startNew: () => void;
  loadProgram: (p: StatusProgram) => void;
  reset: () => void;
}

const Ctx = createContext<ProgramCtx | null>(null);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<DraftProgram>(defaultDraft);
  const update = (patch: Partial<DraftProgram>) => setDraft((prev) => ({ ...prev, ...patch }));
  const startNew = () => setDraft(defaultDraft());
  const loadProgram = (p: StatusProgram) => setDraft(draftFromProgram(p));
  const reset = () => setDraft(defaultDraft());
  return <Ctx.Provider value={{ draft, update, startNew, loadProgram, reset }}>{children}</Ctx.Provider>;
}

export function useProgram() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgram must be used within ProgramProvider');
  return ctx;
}
