// Language mapping from LeetCode-style names to Judge0 language IDs
// Judge0 API language IDs: https://ce.judge0.com/languages
export const LANGUAGE_MAP: Record<string, number> = {
  'javascript': 63,  // Node.js
  'typescript': 74,  // TypeScript
  'python': 71,      // Python 3
  'python3': 71,     // Python 3
  'java': 62,        // Java
  'cpp': 54,         // C++17
  'c': 50,           // C
  'csharp': 51,      // C#
  'go': 60,          // Go
  'rust': 73,        // Rust
  'ruby': 72,        // Ruby
  'swift': 83,       // Swift
  'kotlin': 78,      // Kotlin
  'php': 68,         // PHP
};

// Default language ID if mapping not found
export const DEFAULT_LANGUAGE_ID = 71; // Python 3

export function getLanguageId(language: string): number {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || DEFAULT_LANGUAGE_ID;
}

