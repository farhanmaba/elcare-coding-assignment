# Test task for the programmer

## **1. Overview**

We have insurance cases accessible through our API. Each case has a GUID. The app workflow consists of several steps and should be available for the end users via this URL: `/{guid}`. The goal of this task is to build a full-stack application that allows an end-user to manage their insurance repair case by choosing a service option and completing a payment. The application must be able to recover its state if the user closes the page and returns later.

## **2. Technical Environment & Constraints**

- **Framework & Runtime:**
  - **Backend:** Next.js or Node.js.
  - **Frontend:** Next.js.
  - **UI/UX**: Tailwind.css or antd framework
- **Styling:** Any styling solution based on your UI/UX pick.
- **API Calls:** The backend should be able to communicate with several third-party services (API mocks are provided below).

## **4. Core User Flow & Screen routing**

The user navigates to the application URL: `/{guid}`.

The application fetches the corresponding `Case` data from the core system API.

1. **Endpoint:** `GET https://91756214-c8b7-4f77-9a62-1d35945632fe.mock.pstmn.io/api/v3/case?accessToken=testToken&guid={guid}`
2. **Sample** `Case` **JSON Response:** See **Appendix A**.
3. **Error Handling:** If a case is not found, the application should display a clear "Case not found" error message.
4. **Initial Screen Routing**

- The application must read the `serviceTypeId` from the fetched `Case` object and route the user accordingly. The routing logic depends on the `partnerId` (`case.data.partnerId`). There are three service options: `THEFT_LOST`, `DROP_OFF`, and `SWAP` with ids unique per partner. 
- **The logic per service type ids:**
  - `THEFT_LOST` **(**`serviceTypeId: 1`**):** Proceed directly to the **Payment Screen**.
  - `DROP_OFF` **(**`serviceTypeId: 2`**) &** `SWAP` **(**`serviceTypeId: 3`**):** Proceed to the **Service Option Screen**.

1. **Service Option Screen**

- This screen is only shown for cases with `serviceTypeId` of `DROP_OFF` or `SWAP`.
- It must present the user with available service choices: "Theft/Lost," "Drop-off," and "Swap." The UI is up to the candidate - dropdown, tile / cards.
- **Selection Logic:** The user can either finalize a selection saved in the case object or pick another that differs from their original `serviceTypeId`. 
- **"Swap" Option Logic:**
  - When the user considers the "Swap" option, the backend must perform a stock check by calling the external SOAP API. The value for model is taken from the case object: `productData.model`
  - **Stock API Details:** See **Appendix B**. The backend is expected to construct and send a raw SOAP XML request.
  - If the SOAP response indicates no items are available (`<AvailableItems>` is empty) or the call fails (`status` is `false`), the "Swap" option must be visibly disabled on the frontend with a generic error message (e.g., "This option is currently unavailable for your device model.").
  - If items are available, the user must be able to select a color from the returned list before proceeding.
- A "Proceed to Payment" button should become active only after a valid selection is made.
- **Payment Screen**

- **Price Calculation:** The total price must be calculated and clearly displayed. This can be done on the client-side. All prices are in SEK, and no VAT handling is required.
  - `THEFT_LOST`**:** Price = `deductible`
  - `DROP_OFF`**:** Price = `deductible`
  - `SWAP`**:** Price = `deductible` + `deposit`
- **Payment Methods:** The user must be able to choose between "Bank Card" and "Swish".
- **Payment Form:** This is a mock integration. The candidate should display a form appropriate to the chosen method.
  - **Bank Card:** Show fields for Card Number, Expiry Date, and CVV.
  - **Swish:** Show a field for a phone number.
  - Each form should have a single "Pay" button to simulate a successful payment. This test task only needs to consider the successful payment flow.
  - **Submission** **of the card payment form should always return success, the swish form will always return payment error.**
- **Post-Payment / Final Screen**

- Upon a successful payment simulation:
  - The application should check for the `redirectUrl` property in the `Case` object.
  - If the URL exists and is not empty, the user should be redirected to that URL.
  - If the `redirectUrl` is missing or empty, display a final success message. The message text depends on the service option chosen:
    - **THEFT_LOST:** "Theft-lost handling is completed successfully."
    - **DROP_OFF:** "Drop-off handling is completed successfully."
    - **SWAP:** "Swap handling is completed successfully. The replacement unit will be sent to [Customer Address]." (The address should be populated from the `case.data.receiver` object).
- Upon an errored payment simulation an error message should be shown along with the payment option choice screen, so the user can pick the card payment.

## **5. State Persistence & Restoration**

- The user's progress (e.g., selected service option, chosen color) must be saved so they can close the page and continue later.
- The candidate can choose any tool for state persistence on the frontend (e.g., `localStorage`). No backend API for saving progress is required, but the candidate may implement one if they wish.
- The saved state does not need to expire.
- State restoration is only required for the same user on the same browser; multi-device restoration is not needed.
- The saved state should be cleared upon successful completion of the flow.

## 7. Internationalization

- **Language:** The application should be in English. Building the application to be ready for internationalization (i18n) is considered a significant advantage, but is not a strict requirement.

## 8. Deliverables & Evaluation

- **Format:** The candidate should provide a link to a public GitHub repository containing their full-stack application.
- **Deadline:** The deadline is flexible and can be discussed.

### **Appendix A: Sample** `Case` **JSON Object**

*Response from* `GET /api/v3/case`

```
{  "data": {    "id": 2943749,    "guid": "ea1d5e29-9e0d-4ff5-ae4c-197920a7def9",    "partnerId": 1010,    "productData": {      "model": "iPhone 11 128GB"    },    "orderData": {      "partnerSpecific": {        "insuranceLtd": {          "deductible": "3000",          "deposit": "500",          "redirectUrl": "https://www.google.com/"        }      }    },    "serviceTypeId": 2,    "receiver": {      "name": "Peter Testsen",      "address": "Testvegen 36",      "postalCode": "2840",      "city": "Reinsvoll"    },    "manufacturer": {      "name": "Apple"    }  } } 
```

*(Note: The above JSON is truncated for brevity. The candidate should refer to the full object provided separately for all fields.)*

### **Appendix B: Stock Lookup SOAP API**

- **Endpoint:** `POST https://91756214-c8b7-4f77-9a62-1d35945632fe.mock.pstmn.io/API/Internal_API.svc/soap`
- **Headers:**
  - `Content-Type: text/xml; charset=utf-8`
  - `SOAPAction: http://tempuri.org/IInternal_API/SwapStockLookUpVer2`
- **Sample Request Body:**

```
<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:icp="http://schemas.datacontract.org/2004/07/ICPE_Internal_API_DLL">    <x:Header/>    <x:Body>        <tem:SwapStockLookUpVer2>            <tem:Credentials>                <icp:Password>Test</icp:Password>                <icp:SesamDb>Sesam31</icp:SesamDb>                <icp:UserName>CloudUser</icp:UserName>            </tem:Credentials>            <tem:LookUpItem>                <icp:Brand>Apple</icp:Brand>                <icp:Color></icp:Color>                <icp:Model>iPhone 11</icp:Model>                <icp:StockName>GjensidigeSE</icp:StockName>                <icp:Storage>128GB</icp:Storage>            </tem:LookUpItem>        </tem:SwapStockLookUpVer2>    </x:Body> </x:Envelope> 
```

- **Sample Success Response Body:**

```
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">    <s:Body>        <SwapStockLookUpVer2Response xmlns="http://tempuri.org/">            <SwapStockLookUpVer2Result xmlns:a="http://schemas.datacontract.org/2004/07/API_WebServer" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">                <AvailableItems xmlns="http://schemas.datacontract.org/2004/07/ICPE_Internal_API_DLL">                    <WS_API_.SwapStockAvailableItemV2>                        <Color>White</Color>                    </WS_API_.SwapStockAvailableItemV2>                    <WS_API_.SwapStockAvailableItemV2>                        <Color>Red</Color>                    </WS_API_.SwapStockAvailableItemV2>                </AvailableItems>                <status>true</status>            </SwapStockLookUpVer2Result>        </SwapStockLookUpVer2Response>    </s:Body> </s:Envelope>
```

### Appendix C: Postman collection with mock servers

https://elcare.postman.co/workspace/Elcare-Nordic~d8fe81a0-04b6-41a4-857e-5cad0794420a/collection/385264-e7cc6313-7665-4f6d-8386-111491d52d1e?action=share&creator=385264&active-environment=385264-0e685e4a-4f09-4577-b87c-b19ab4ca44d7
