"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { CaseData, State } from '@/lib/types';
import { CaseProvider } from '@/context/CaseContext';
import FlowManager from '@/components/FlowManager';
import { useTranslations } from 'next-intl';

// Starting point for the interactive state of the app
const initialState: State = {
  guid: null,
  flowStep: 'options',
  selectedService: null,
  selectedColor: null,
  paymentError: null,
  selectedPaymentMethod: 'card',
};

export default function CasePage() {
  const params = useParams();
  const guid = params.guid as string;

  const text = useTranslations();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    if (!guid) return;

    // To handle race conditions as we are working with a few data requests
    // We do not want the data to bleed through different requests if the user moves on to making new requests
    let isStale = false;

    setIsLoading(true);
    setError(null);
    setState(initialState);

    const fetchAndInitialize = async () => {
      try {
        // Fetch data for the GUID
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/case/${guid}`;
        const response = await axios.get(apiUrl);
        const currentCaseData: CaseData = response.data;

        if (isStale) return;
        setCaseData(currentCaseData);

        // Check localStorage for saved state for the current GUID
        const storageKey = `caseState_${guid}`;
        let finalInitialState: State | null = null;
        const storedValue = window.localStorage.getItem(storageKey);

        // Update the initial state to the saved state from localStorage
        if (storedValue) {
          const parsed = JSON.parse(storedValue);

          if (parsed.guid === guid) {
            finalInitialState = parsed;
          }
        }

        // If localStorage is empty for the current GUID, create a new state
        if (!finalInitialState) {
          const cleanState = { ...initialState, guid: guid };

          if (currentCaseData.data.serviceTypeId === 1) {
            finalInitialState = { ...cleanState, flowStep: 'payment', selectedService: 'THEFT_LOST' };
          } else if (currentCaseData.data.serviceTypeId === 2) {
            finalInitialState = { ...cleanState, selectedService: 'DROP_OFF' };
          } else {
            finalInitialState = { ...cleanState, selectedService: 'SWAP' };
          }
        }

        // Set the state
        setState(finalInitialState);
      } catch (err) {
        if (isStale) return;

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError(text('CaseNotFound.description'));
        } else {
          setError(text('Error.unexpectedError'));
        }
      } finally {
        if (!isStale) {
          setIsLoading(false);
        }
      }
    };

    fetchAndInitialize();

    return () => {
      isStale = true;
    };
  }, [guid, text]);

  // Update localStorage state
  useEffect(() => {
    if (state.guid && state.guid === guid) {
      window.localStorage.setItem(`caseState_${state.guid}`, JSON.stringify(state));
    }
  }, [state, guid]);

  // Clean state and redirect if the flow is complete
  useEffect(() => {
    const redirectUrl = caseData?.data.orderData.partnerSpecific.insuranceLtd.redirectUrl;

    if (state.flowStep === 'complete' && redirectUrl) {
      const timer = setTimeout(() => {
        window.localStorage.removeItem(`caseState_${state.guid}`);
        window.location.href = redirectUrl;
      }, 5000); // 5 seconds delayed redirect so we can see the completion screen

      return () => clearTimeout(timer);
    }
  }, [state.flowStep, state.guid, caseData]);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-center mb-8 text-slate-700">
        {text('Layout.title')}
      </h1>
      <CaseProvider caseData={caseData} state={state} setState={setState}>
        {isLoading && <p className="text-center">{text('State.loading')}</p>}
        {error && <p className="text-red-600 text-center">{error}</p>}
        {!isLoading && !error && state.guid && <FlowManager />}
      </CaseProvider>
    </main>
  );
}