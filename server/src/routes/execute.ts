import express, { Request, Response } from 'express';
import axios from 'axios';
import { getLanguageId } from '../utils/judge0Languages';

const router = express.Router();

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY || '';
const JUDGE0_RAPIDAPI_HOST = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';

interface ExecuteRequest {
  language_id?: number;  // Direct language ID (Judge0 format)
  language?: string;     // Language name (backwards compatibility)
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

    const { language_id, language, source_code, stdin }: ExecuteRequest = req.body;

    // Validate required fields
    if (!source_code) {
      return res.status(400).json({ 
        error: 'Missing required field: source_code is required' 
      });
    }

    // Determine language_id: use direct language_id if provided, otherwise convert from language name
    let languageId: number;
    if (language_id !== undefined && language_id !== null) {
      languageId = language_id;
    } else if (language) {
      languageId = getLanguageId(language);
    } else {
      return res.status(400).json({ 
        error: 'Missing required field: either language_id or language is required' 
      });
    }

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

    // Poll for result until status is 'Processed' (Accepted) or 'Error'
    // Judge0 Status IDs:
    // 1: In Queue
    // 2: Processing
    // 3: Accepted (Processed successfully)
    // 4+: Various errors (Compilation Error, Runtime Error, Time Limit Exceeded, etc.)
    
    const maxAttempts = 60; // Maximum polling attempts (60 seconds)
    const pollInterval = 1000; // Poll every 1 second
    let attempts = 0;

    // Polling function using while loop
    while (attempts < maxAttempts) {
      // Wait before polling (skip delay on first attempt)
      if (attempts > 0) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

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
        const statusId = result.status.id;
        const statusDescription = result.status.description || '';

        // Check if status is 'Processed' (Accepted) or an 'Error' state
        // Status 3 = Accepted (Processed)
        // Status 4+ = Various errors
        const isProcessed = statusId === 3;
        const isError = statusId >= 4;
        const isCompleted = isProcessed || isError;

        if (isCompleted) {
          // Format and return the final result
          const output = {
            stdout: result.stdout || '',
            stderr: result.stderr || '',
            compile_output: result.compile_output || '',
            time: result.time || '0',
            memory: result.memory || 0,
            status: {
              id: statusId,
              description: statusDescription,
            },
            success: isProcessed, // true only if status is 3 (Accepted)
          };

          return res.json(output);
        }

        // Status is still in queue (1) or processing (2), continue polling
      } catch (error: any) {
        // If it's a 404, submission might not be ready yet - continue polling
        if (error.response?.status === 404) {
          // Continue polling
        } else {
          // Other errors should be thrown
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

