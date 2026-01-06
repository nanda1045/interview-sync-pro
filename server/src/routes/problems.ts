import express, { Request, Response } from 'express';
import { Problem } from '../models/Problem';

const router = express.Router();

// GET /api/problems - Get all problems with optional company filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { company, difficulty } = req.query;
    
    const query: any = {};
    
    if (company) {
      query.companies = { $in: [company] };
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const problems = await Problem.find(query)
      .select('title slug difficulty companies')
      .sort({ createdAt: -1 })
      .lean();

    res.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/problems/:slug - Get specific problem by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const problem = await Problem.findOne({ slug }).lean();
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// GET /api/problems/companies/list - Get list of all companies
router.get('/companies/list', async (req: Request, res: Response) => {
  try {
    const companies = await Problem.distinct('companies');
    const sortedCompanies = companies.filter(Boolean).sort();
    res.json(sortedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

export default router;

