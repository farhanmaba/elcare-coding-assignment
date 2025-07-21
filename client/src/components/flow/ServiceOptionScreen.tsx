'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useCase } from '@/context/CaseContext';
import { ServiceOption } from '@/lib/types';
import Button from '../ui/Button';
import { Radio, RadioGroup, Label } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

// All mapped services
const allServiceOptions: { id: ServiceOption; nameKey: 'theftLost' | 'dropOff' | 'swap' }[] = [
  { id: 'THEFT_LOST', nameKey: 'theftLost' },
  { id: 'DROP_OFF', nameKey: 'dropOff' },
  { id: 'SWAP', nameKey: 'swap' },
];

// All mapped colors
const colorMap: { [key: string]: string } = { 'White': 'bg-white-600', 'Red': 'bg-red-600' };

export default function ServiceOptionScreen() {
  const text = useTranslations('ServiceOptionScreen');
  const { state, setState, caseData } = useCase();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Check if the stock is available
  const { data: stockData, isLoading: isStockLoading } = useSWR(
    caseData ? `${process.env.NEXT_PUBLIC_API_URL}/api/stock/check` : null,
    (url) => fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: caseData?.data.productData.model, brand: caseData?.data.manufacturer.name }), // model: device modal + storage
    }).then(res => res.json())
  );

  if (!caseData?.data) return null;

  const { caseNumber, productData, receiver, serviceType } = caseData.data;
  const availableOptions = allServiceOptions.filter(option => option.id !== 'THEFT_LOST');

  /* Action Handlers */
  const selectService = (service: ServiceOption | null) => {
    if (service) setState(prev => ({ ...prev, selectedService: service, selectedColor: null }));
  };
  const selectColor = (color: string | null) => {
    if (color) setState(prev => ({ ...prev, selectedColor: color }));
  };
  const proceedToPayment = () => {
    setState(prev => ({ ...prev, flowStep: 'payment', paymentError: null }));
  };
  /* Action Handlers */
  
  const isSwapOptionDisabled = !isStockLoading && !stockData?.isAvailable;
  const isProceedDisabled = !isMounted || !state.selectedService || (state.selectedService === 'SWAP' && !state.selectedColor);

  return (
    <div>
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

      <h2 className="text-xl font-bold mb-6 text-center">{text('title')}</h2>

      <RadioGroup value={isMounted ? state.selectedService : null} onChange={selectService}>
        {availableOptions.map((option) => (
          <Radio key={option.id} value={option.id} disabled={option.id === 'SWAP' && isSwapOptionDisabled} className="focus:outline-none mb-4 last:mb-0 block">
            {({ checked }) => (
              <div className={twMerge("cursor-pointer rounded-lg border p-4 transition-all", checked ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500" : "border-gray-300 bg-white hover:bg-gray-50", "ui-disabled:opacity-50 ui-disabled:cursor-not-allowed ui-disabled:bg-slate-50 ui-disabled:hover:bg-slate-50 ui-disabled:border-gray-300 ui-disabled:ring-0")}>
                <Label className="font-semibold text-lg">{text(option.nameKey)}</Label>
                {option.id === 'SWAP' && isSwapOptionDisabled && (<p className="text-sm text-red-600 mt-1">{text('swapUnavailable')}</p>)}
              </div>
            )}
          </Radio>
        ))}
      </RadioGroup>

      {isMounted && state.selectedService === 'SWAP' && !isSwapOptionDisabled && (
        <div className="mt-6">
          <RadioGroup value={state.selectedColor} onChange={selectColor}>
            <Label className="block text-sm font-medium text-gray-700">{text('selectColor')}</Label>
            <div className="mt-2 flex items-center space-x-3">
              {stockData?.colors.map((color: string) => (
                <Radio key={color} value={color} title={color} className={({ checked }) => twMerge('relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none', checked && 'ring-2 ring-offset-1 ring-blue-600')}>
                  <span aria-hidden="true" className={twMerge(colorMap[color] || 'bg-black', 'h-8 w-8 rounded-full border border-black border-opacity-10')} />
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}
      
      <Button className="mt-8" onClick={proceedToPayment} disabled={isProceedDisabled}>{text('proceedToPayment')}</Button>
    </div>
  );
}