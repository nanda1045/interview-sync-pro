import express, { Request, Response } from 'express';
import axios from 'axios';
import { getLanguageId } from '../utils/judge0Languages';

const router = express.Router();

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY || '';
const JUDGE0_RAPIDAPI_HOST = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';

interface ExecuteRequest {
  language: string;
  source_code: string;
  stdin?: string;
}

interface Judge0Submission {
  token: string;
}

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

// POST /api/execute - Execute code using Judge0
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if Judge0 API is configured
    if (!JUDGE0_RAPIDAPI_KEY || JUDGE0_RAPIDAPI_KEY === 'your-rapidapi-key-here') {
      return res.status(503).json({
        error: 'Judge0 API not configured',
        message: 'Please configure JUDGE0_RAPIDAPI_KEY in server/.env',
      });
    }

    const { language, source_code, stdin }: ExecuteRequest = req.body;

    if (!language || !source_code) {
      return res.status(400).json({ 
        error: 'Missing required fields: language and source_code are required' 
      });
    }

    const languageId = getLanguageId(language);

    // Create submission
    const submissionResponse = await axios.post<Judge0Submission>(
      `${JUDGE0_API_URL}/submissions`,
      {
        source_code,
        language_id: languageId,
        stdin: stdin || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_RAPIDAPI_KEY,
          'X-RapidAPI-Host': JUDGE0_RAPIDAPI_HOST,
        },
        params: {
          base64_encoded: 'false',
          wait: 'false', // We'll poll for results
        },
      }
    );

    const token = submissionResponse.data.token;

    // Poll for result (with timeout)
    const maxAttempts = 30;
    const pollInterval = 1000; // 1 second
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      try {
        const resultResponse = await axios.get<Judge0Result>(
          `${JUDGE0_API_URL}/submissions/${token}`,
          {
            headers: {
              'X-RapidAPI-Key': JUDGE0_RAPIDAPI_KEY,
              'X-RapidAPI-Host': JUDGE0_RAPIDAPI_HOST,
            },
            params: {
              base64_encoded: 'false',
            },
          }
        );

        const result = resultResponse.data;

        // Check if result is ready (status id 1-3 means in queue/processing)
        // Status id 4+ means completed (success, error, etc.)
        if (result.status.id >= 4) {
          // Format the response
          const output = {
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            compile_output: result.compile_output || '',
            message: result.message || '',
            status: {
              id: result.status.id,
              description: result.status.description,
            },
            time: result.time || '0',
            memory: result.memory || 0,
            success: result.status.id === 3, // Status 3 = Accepted
          };

          return res.json(output);
        }
      } catch (error: any) {
        // If it's a 404, submission might not be ready yet
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      attempts++;
    }

    // Timeout
    return res.status(504).json({
      error: 'Execution timeout',
      message: 'Code execution took too long to complete',
    });
  } catch (error: any) {
    console.error('Error executing code:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'Judge0 API error',
        message: error.response.data?.message || error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to execute code',
    });
  }
});

export default router;

