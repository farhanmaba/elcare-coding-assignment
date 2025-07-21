import { Router } from 'express';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { createSoapRequestSchema, parseSoapResponse } from '../utils/soap';
import { z } from 'zod';

const router = Router();

// Schema check
const StockCheckSchema = z.object({
  model: z.string(),
  brand: z.string(),
});

router.post('/check', async (req, res) => {
  try {
    const { model, brand } = StockCheckSchema.parse(req.body);
    const xmlLookupItem = createSoapRequestSchema(model, brand);
    const endpoint = process.env.SOAP_API_ENDPOINT as string;

    if (!endpoint) {
      throw new Error("API environment variables are not set properly.");
    }

    const response = await axios.post(endpoint, xmlLookupItem, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/IInternal_API/SwapStockLookUpVer2',
      },
    });

    const parser = new XMLParser({ removeNSPrefix: true }); // Remove Namespace prefixes to get a clean JSON

    const jsonResponse = parser.parse(response.data);
    const result = parseSoapResponse(jsonResponse); // To only get what we need (isAvailable and colors)

    res.json(result);
  } catch (error) {
    console.error('[api/stock]:', error);
    res.status(500).json({ isAvailable: false, colors: [], error: 'Failed to check stock.' });
  }
});

export default router;