import { NextResponse } from 'next/server';
import twoSumProblem from '../../../../../data/problems/two-sum.json';

export async function GET() {
  return NextResponse.json(twoSumProblem);
}

