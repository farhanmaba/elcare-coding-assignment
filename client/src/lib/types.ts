export type ServiceOption = 'THEFT_LOST' | 'DROP_OFF' | 'SWAP';

export interface State {
  guid: string | null;
  flowStep: 'options' | 'payment' | 'complete';
  selectedService: ServiceOption | null;
  selectedColor: string | null;
  paymentError: string | null;
  selectedPaymentMethod: 'card' | 'swish';
}

export type Action =
  | { type: 'SELECT_SERVICE'; payload: ServiceOption }
  | { type: 'SELECT_COLOR'; payload: string }
  | { type: 'PROCEED_TO_PAYMENT' }
  | { type: 'PAYMENT_SUCCESS' }
  | { type: 'PAYMENT_FAIL'; payload: { message: string } }
  | { type: 'GO_TO_OPTIONS' }
  | { type: 'SELECT_PAYMENT_METHOD'; payload: 'card' | 'swish' };



export interface CaseData {
  data: {
    id: number;
    guid: string;
    caseNumber: string;
    partnerId: number;
    productData: {
      model: string;
    };
    orderData: {
      partnerSpecific: {
        insuranceLtd: {
          deductible: number;
          deposit?: number;
          redirectUrl: string;
        };
      };
    };
    serviceTypeId: number;
    serviceType: {
      name: string;
    };
    receiver: {
      name: string;
      address: string;
      postalCode: string;
      city: string;
    };
    manufacturer: {
      name: string;
    };
  };
}