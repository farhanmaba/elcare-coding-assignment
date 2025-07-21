import { Router } from 'express';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

// UUID rule for GUID
const GuidSchema = z.string().uuid({ message: "Invalid GUID format." });

router.get('/:guid', async (req, res) => {
  try {
    // Validate the GUID
    const guid = GuidSchema.parse(req.params.guid);
    
    const accessToken = process.env.CASE_API_TOKEN;
    const baseUrl = process.env.CASE_API_BASE_URL;

    if (!accessToken || !baseUrl) {
      throw new Error("API environment variables are not set properly.");
    }

    const apiUrl = `${baseUrl}/api/v3/case?accessToken=${accessToken}&guid=${guid}`;
    const response = await axios.get(apiUrl);

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 404) {
        return res.status(404).json({ message: 'Case not found' });
      }
      if (status === 429) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      }
      if (status === 500) {
        return res.status(502).json({ message: 'External API returned a server error.' });
      }
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    console.error('[api/case]:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;