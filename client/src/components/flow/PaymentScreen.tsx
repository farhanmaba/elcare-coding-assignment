'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCase } from '@/context/CaseContext';
import { ServiceOption } from '@/lib/types';
import Button from '../ui/Button';

const CardForm = ({ onPay }: { onPay: () => void }) => {
  const text = useTranslations('PaymentScreen');
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">{text('cardNumber')}</label>
        <input type="text" id="card-number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="0000 0000 0000 0000" />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">{text('expiryDate')}</label>
          <input type="text" id="expiry-date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="MM/YY" />
        </div>
        <div className="flex-1">
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">{text('cvv')}</label>
          <input type="text" id="cvv" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="123" />
        </div>
      </div>

      <Button onClick={onPay} className="mt-4">{text('pay')}</Button>
    </div>
  );
};

const SwishForm = ({ onPay }: { onPay: () => void }) => {
  const text = useTranslations('PaymentScreen');
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">{text('phoneNumber')}</label>
        <input type="tel" id="phone-number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="070 123 45 67" />
      </div>

      <Button onClick={onPay} className="mt-4">{text('pay')}</Button>
    </div>
  );
};

export default function PaymentScreen() {
  const text = useTranslations('PaymentScreen');
  const { state, setState, caseData } = useCase();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!caseData?.data || !state.selectedService) return null;

  const { deductible, deposit } = caseData.data.orderData.partnerSpecific.insuranceLtd;
  const { caseNumber, productData, receiver, serviceTypeId, serviceType } = caseData.data;

  const calculatePrice = (service: ServiceOption): number => {
    if (service === 'SWAP') return deductible + (deposit || 0);
    return deductible;
  };

  const totalPrice = calculatePrice(state.selectedService);

  /* Action Handlers */
  const goToOptions = () => setState(prev => ({ ...prev, flowStep: 'options' }));
  const selectPaymentMethod = (method: 'card' | 'swish') => setState(prev => ({ ...prev, selectedPaymentMethod: method, paymentError: null }));
  const submitPayment = () => {
    if (state.selectedPaymentMethod === 'card') {
      setState(prev => ({ ...prev, flowStep: 'complete' }));
    } else {
      setState(prev => ({ ...prev, paymentError: text('swishPaymentFailed') }));
    }
  };
  /* Action Handlers */

  const displayPaymentMethod = isMounted ? state.selectedPaymentMethod : 'card';

  return (
    <div>
      {serviceTypeId !== 1 && (
        <div className="mb-4">
          <button onClick={goToOptions} className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
            {text('backToOptions')}
          </button>
        </div>
      )}

      <div className="mb-6 border-b border-slate-200 pb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{text('caseDetails')}</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold">{text('caseNumber')}</span> {caseNumber}</p>
          <p><span className="font-semibold">{text('device')}</span> {productData.model}</p>
          <p><span className="font-semibold">{text('serviceType')}</span> {serviceType.name}</p>
          <p><span className="font-semibold">{text('recipient')}</span> {receiver.name}</p>
          <p><span className="font-semibold">{text('address')}</span> {`${receiver.address}, ${receiver.postalCode} ${receiver.city}`}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 text-center">{text('title')}</h2>

      <div className="text-center text-3xl font-light mb-8">{text('totalPrice', { price: totalPrice.toFixed(2) })}</div>
      {state.paymentError && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{state.paymentError}</span></div>)}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{text('payWith')}</h3>
        <div className="flex space-x-4">
          <button onClick={() => selectPaymentMethod('card')} className={`flex-1 p-4 border rounded-lg ${displayPaymentMethod === 'card' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}>{text('bankCard')}</button>
          <button onClick={() => selectPaymentMethod('swish')} className={`flex-1 p-4 border rounded-lg ${displayPaymentMethod === 'swish' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}>{text('swish')}</button>
        </div>
      </div>
      
      <div className="mt-8">
        {displayPaymentMethod === 'card' ? <CardForm onPay={submitPayment} /> : <SwishForm onPay={submitPayment} />}
      </div>
    </div>
  );
}