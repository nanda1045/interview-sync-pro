import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string; // Markdown
  testCases: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    [language: string]: string;
  };
  companies: string[];
  hints?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    constraints: {
      type: [String],
      default: [],
    },
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    companies: {
      type: [String],
      default: [],
      index: true, // Index for efficient filtering
    },
    hints: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
ProblemSchema.index({ slug: 1 });
ProblemSchema.index({ companies: 1 });
ProblemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);

