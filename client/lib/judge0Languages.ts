// Language mapping from LeetCode-style names to Judge0 language IDs
// Reference: https://ce.judge0.com/languages

export const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  'python': 71,      // Python 3
  'python3': 71,     // Python 3
  'java': 62,        // Java
  'cpp': 54,         // C++17
  'c++': 54,         // C++17
  'c': 50,           // C
  'javascript': 63,  // Node.js
  'js': 63,          // Node.js
  'typescript': 74,  // TypeScript
  'ts': 74,          // TypeScript
  'csharp': 51,      // C#
  'go': 60,          // Go
  'rust': 73,        // Rust
  'ruby': 72,        // Ruby
  'swift': 83,       // Swift
  'kotlin': 78,      // Kotlin
  'php': 68,         // PHP
  'scala': 81,       // Scala
  'perl': 85,        // Perl
};

// Display names for language selector
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  'python3': 'Python 3',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'java': 'Java',
  'cpp': 'C++',
  'c': 'C',
  'csharp': 'C#',
  'go': 'Go',
  'rust': 'Rust',
  'ruby': 'Ruby',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'php': 'PHP',
};

/**
 * Get Judge0 language ID from language name
 */
export function getJudge0LanguageId(language: string): number {
  const normalized = language.toLowerCase().trim();
  return JUDGE0_LANGUAGE_MAP[normalized] || JUDGE0_LANGUAGE_MAP['python3']; // Default to Python 3
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: string): string {
  return LANGUAGE_DISPLAY_NAMES[language] || language;
}

