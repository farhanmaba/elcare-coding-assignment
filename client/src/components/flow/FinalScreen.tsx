'use client';

import { useTranslations } from 'next-intl';
import { useCase } from '@/context/CaseContext';
import { useEffect } from 'react';

export default function FinalScreen() {
  const text = useTranslations('FinalScreen');
  const { state, caseData } = useCase();

  // Clear state when the case is complete
  useEffect(() => {
    const storageKey = `caseState_${caseData?.data.guid}`;
    window.localStorage.removeItem(storageKey);
  }, [caseData?.data.guid]);

  if (!caseData || !state.selectedService) {
    return null;
  }

  // Success Messages
  const getMessage = () => {
    switch (state.selectedService) {
      case 'THEFT_LOST':
        return text('theftLostSuccess');
      case 'DROP_OFF':
        return text('dropOffSuccess');
      case 'SWAP':
        const { address, postalCode, city } = caseData.data.receiver;
        const fullAddress = `${address}, ${postalCode} ${city}`;
        return text('swapSuccess', { address: fullAddress });
      default:
        return '';
    }
  };

  return (
    <div className="text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-2xl font-bold mt-4 text-slate-800">{text('title')}</h2>
      <p className="mt-2 text-slate-600">{getMessage()}</p>
    </div>
  );
}