const parseItemModel = (fullModel: string): { model: string, storage: string } => { // fullModel (iPhone 11 128GB)
  const lastSpaceIndex = fullModel.lastIndexOf(' ');

  // If there aren't any spaces (iPhone)
  if (lastSpaceIndex === -1) {
    return { model: fullModel, storage: '' };
  }

  const model = fullModel.substring(0, lastSpaceIndex); // iPhone 11
  const storage = fullModel.substring(lastSpaceIndex + 1); // 128GB

  // Make sure that storage includes appropriate units
  // Without this check Pro would be returned as storage in case the fullModel is Macbook Pro
  if (storage.includes('GB') || storage.includes('TB')) {
    return { model, storage };
  }

  return { model: fullModel, storage: '' };
};

export const createSoapRequestSchema = (fullModel: string, brand: string): string => {
  const { model, storage } = parseItemModel(fullModel);

  // ENV variables
  const userName = process.env.SOAP_USERNAME;
  const password = process.env.SOAP_PASSWORD;
  const sesamDb = process.env.SOAP_SESAM_DB;
  const stockName = process.env.SOAP_STOCK_NAME;

  return `<x:Envelope xmlns:x="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/" xmlns:icp="http://schemas.datacontract.org/2004/07/ICPE_Internal_API_DLL">
      <x:Header/>
      <x:Body>
          <tem:SwapStockLookUpVer2>
              <tem:Credentials>
                  <icp:Password>${password}</icp:Password>
                  <icp:SesamDb>${sesamDb}</icp:SesamDb>
                  <icp:UserName>${userName}</icp:UserName>
              </tem:Credentials>
              <tem:LookUpItem>
                  <icp:Brand>${brand}</icp:Brand>
                  <icp:Color></icp:Color>
                  <icp:Model>${model}</icp:Model>
                  <icp:StockName>${stockName}</icp:StockName>
                  <icp:Storage>${storage}</icp:Storage>
              </tem:LookUpItem>
          </tem:SwapStockLookUpVer2>
      </x:Body>
  </x:Envelope>`;
};

export const parseSoapResponse = (jsonObj: any): { isAvailable: boolean, colors: string[] } => {
  try {
    const result = jsonObj.Envelope.Body.SwapStockLookUpVer2Response.SwapStockLookUpVer2Result;

    if (!result) {
      return { isAvailable: false, colors: [] };
    }
    if (result.status !== true) {
      return { isAvailable: false, colors: [] };
    }

    const items = result.AvailableItems['WS_API_.SwapStockAvailableItemV2'];

    if (!items) {
      return { isAvailable: false, colors: [] };
    }

    const availableItems = Array.isArray(items) ? items : [items]; // Make sure that items is an array
    const colors = availableItems.map((item: any) => item.Color); // Array of colors

    return { isAvailable: colors.length > 0, colors }; // Edge case / Assumption: If colors are not available, Item is not available either.
  } catch (e) {
    console.error("Error parsing SOAP response:", e);
    return { isAvailable: false, colors: [] };
  }
};