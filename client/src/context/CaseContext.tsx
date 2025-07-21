'use client';

import { createContext, useContext, Dispatch, SetStateAction, ReactNode } from 'react';
import { CaseData, State } from '@/lib/types';

interface CaseContextType {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  caseData: CaseData | null;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider = ({
  children,
  caseData,
  state,
  setState,
}: {
  children: ReactNode;
  caseData: CaseData | null;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
}) => {
  // Make sure that state, setState and caseData is available to all the children components by using useCase
  return (
    <CaseContext.Provider value={{ state, setState, caseData }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  
  if (context === undefined) {
    throw new Error('useCase must be used within a CaseProvider');
  }

  return context;
};