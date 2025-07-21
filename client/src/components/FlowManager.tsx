import { useState, useEffect } from 'react';
import { useCase } from '@/context/CaseContext';
import ServiceOptionScreen from '@/components/flow/ServiceOptionScreen';
import PaymentScreen from '@/components/flow/PaymentScreen';
import FinalScreen from '@/components/flow/FinalScreen';
import CaseNotFound from '@/components/flow/CaseNotFound';

export default function FlowManager() {
  const { state, caseData } = useCase();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!caseData) {
    return <CaseNotFound />;
  }

  const renderContent = () => {
    switch (state.flowStep) {
      case 'options':
        return <ServiceOptionScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'complete':
        return <FinalScreen />;
      default:
        return null;
    }
  };

  return <div className="bg-white p-8 rounded-lg shadow-md">{renderContent()}</div>;
}