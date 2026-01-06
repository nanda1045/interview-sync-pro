import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../db/connection';
import { Problem } from '../models/Problem';

const problems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy' as const,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    testCases: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      typescript: 'function twoSum(nums: number[], target: number): number[] {\n    \n}',
      javascript: 'function twoSum(nums, target) {\n    \n}',
      python: 'def twoSum(self, nums: List[int], target: int) -> List[int]:\n    ',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Apple'],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
      'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x.',
      'The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?',
    ],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy' as const,
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    testCases: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    starterCode: {
      typescript: 'function maxProfit(prices: number[]): number {\n    \n}',
      javascript: 'function maxProfit(prices) {\n    \n}',
      python: 'def maxProfit(self, prices: List[int]) -> int:\n    ',
      java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Goldman Sachs', 'Bloomberg'],
    hints: [
      'The points of interest are the peaks and valleys in the given graph.',
      'We need to find the largest peak following the smallest valley.',
      'We can maintain two variables - minprice and maxprofit corresponding to the smallest valley and maximum profit.',
    ],
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy' as const,
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    testCases: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: {
      typescript: 'function isValid(s: string): boolean {\n    \n}',
      javascript: 'function isValid(s) {\n    \n}',
      python: 'def isValid(self, s: str) -> bool:\n    ',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Facebook', 'Google', 'Microsoft', 'Bloomberg'],
    hints: [
      'Use a stack of characters.',
      'When you encounter an opening bracket, push it onto the stack.',
      'When you encounter a closing bracket, check if the top of the stack matches.',
    ],
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    difficulty: 'Easy' as const,
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    testCases: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]',
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]',
      },
      {
        input: 'list1 = [], list2 = [0]',
        output: '[0]',
      },
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    starterCode: {
      typescript: 'function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {\n    \n}',
      javascript: 'function mergeTwoLists(list1, list2) {\n    \n}',
      python: 'def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n    ',
      java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Microsoft', 'Apple', 'Facebook', 'Bloomberg'],
    hints: [
      'Create a dummy node to simplify edge cases.',
      'Compare the values of the current nodes of both lists.',
      'Attach the smaller node to the result and move forward.',
    ],
  },
  {
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Easy' as const,
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.`,
    testCases: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '[4,-1,2,1] has the largest sum = 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    starterCode: {
      typescript: 'function maxSubArray(nums: number[]): number {\n    \n}',
      javascript: 'function maxSubArray(nums) {\n    \n}',
      python: 'def maxSubArray(self, nums: List[int]) -> int:\n    ',
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Apple', 'Google'],
    hints: [
      'Think of a simple solution using a single pass through the array.',
      'The idea is to maintain a running sum and reset it when it becomes negative.',
      'This is known as Kadane\'s algorithm.',
    ],
  },
  {
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'Medium' as const,
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    testCases: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRUCache lRUCache = new LRUCache(2);\nlRUCache.put(1, 1); // cache is {1=1}\nlRUCache.put(2, 2); // cache is {1=1, 2=2}\nlRUCache.get(1);    // return 1\nlRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}\nlRUCache.get(2);    // returns -1 (not found)\nlRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}\nlRUCache.get(1);    // return -1 (not found)\nlRUCache.get(3);    // return 3\nlRUCache.get(4);    // return 4',
      },
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.',
    ],
    starterCode: {
      typescript: 'class LRUCache {\n    constructor(capacity: number) {\n        \n    }\n    \n    get(key: number): number {\n        \n    }\n    \n    put(key: number, value: number): void {\n        \n    }\n}',
      javascript: 'class LRUCache {\n    constructor(capacity) {\n        \n    }\n    \n    get(key) {\n        \n    }\n    \n    put(key, value) {\n        \n    }\n}',
      python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        \n    def get(self, key: int) -> int:\n        \n    def put(self, key: int, value: int) -> None:\n        ',
      java: 'class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        \n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Uber'],
    hints: [
      'Use a combination of HashMap and Doubly Linked List.',
      'HashMap for O(1) access, Doubly Linked List for O(1) insertion/deletion.',
      'Maintain head and tail pointers for the doubly linked list.',
    ],
  },
  {
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    difficulty: 'Medium' as const,
    description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.

A string is palindromic if it reads the same backward as forward.`,
    testCases: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.',
      },
      {
        input: 's = "cbbd"',
        output: '"bb"',
      },
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.',
    ],
    starterCode: {
      typescript: 'function longestPalindrome(s: string): string {\n    \n}',
      javascript: 'function longestPalindrome(s) {\n    \n}',
      python: 'def longestPalindrome(self, s: str) -> str:\n    ',
      java: 'class Solution {\n    public String longestPalindrome(String s) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Microsoft', 'Facebook', 'Google', 'Apple'],
    hints: [
      'How can we reuse a previously computed palindrome to compute a larger one?',
      'If "aba" is a palindrome, is "xabax" a palindrome? Similarly is "xabay" a palindrome?',
      'Complexity based hint: If we use brute-force and check whether for every start and end position a substring is a palindrome we have O(n^2) start - end pairs and O(n) palindromic checks. Can we reduce the time for palindromic checks to O(1) by reusing some previous computation?',
    ],
  },
  {
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium' as const,
    description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.`,
    testCases: [
      {
        input: 'nums = [-1,0,1,2,-1,-4]',
        output: '[[-1,-1,2],[-1,0,1]]',
        explanation: 'nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.\nnums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.\nThe distinct triplets are [-1,0,1] and [-1,-1,2].',
      },
      {
        input: 'nums = [0,1,1]',
        output: '[]',
        explanation: 'The only possible triplet does not sum up to 0.',
      },
      {
        input: 'nums = [0,0,0]',
        output: '[[0,0,0]]',
        explanation: 'The only possible triplet sums up to 0.',
      },
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5',
    ],
    starterCode: {
      typescript: 'function threeSum(nums: number[]): number[][] {\n    \n}',
      javascript: 'function threeSum(nums) {\n    \n}',
      python: 'def threeSum(self, nums: List[int]) -> List[List[int]]:\n    ',
      java: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Apple', 'Google'],
    hints: [
      'So, we essentially need to find three numbers x, y, and z such that they add up to the given value.',
      'To avoid duplicates, we can sort the array and skip duplicates.',
      'Use two pointers technique after sorting.',
    ],
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium' as const,
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.`,
    testCases: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.',
      },
      {
        input: 'height = [1,1]',
        output: '1',
      },
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4',
    ],
    starterCode: {
      typescript: 'function maxArea(height: number[]): number {\n    \n}',
      javascript: 'function maxArea(height) {\n    \n}',
      python: 'def maxArea(self, height: List[int]) -> int:\n    ',
      java: 'class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Facebook', 'Google', 'Microsoft', 'Bloomberg'],
    hints: [
      'The aim is to maximize the area formed between the vertical lines.',
      'The area of the container is limited by the width between the lines and the height of the shorter line.',
      'Start with the widest container and use two pointers to move towards each other.',
    ],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium' as const,
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    testCases: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    starterCode: {
      typescript: 'function lengthOfLongestSubstring(s: string): number {\n    \n}',
      javascript: 'function lengthOfLongestSubstring(s) {\n    \n}',
      python: 'def lengthOfLongestSubstring(self, s: str) -> int:\n    ',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}',
    },
    companies: ['Amazon', 'Microsoft', 'Facebook', 'Google', 'Bloomberg'],
    hints: [
      'Use a sliding window approach with two pointers.',
      'Use a hash map to track the last occurrence of each character.',
      'When you find a repeating character, move the left pointer to the right of the last occurrence.',
    ],
  },
];

async function seed() {
  try {
    await connectDB();
    
    // Clear existing problems
    await Problem.deleteMany({});
    console.log('✅ Cleared existing problems');
    
    // Insert new problems
    const inserted = await Problem.insertMany(problems);
    console.log(`✅ Seeded ${inserted.length} problems`);
    
    // Display summary
    const companies = await Problem.distinct('companies');
    console.log(`\n📊 Summary:`);
    console.log(`   Total problems: ${inserted.length}`);
    console.log(`   Companies: ${companies.length}`);
    console.log(`   Companies list: ${companies.sort().join(', ')}`);
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await disconnectDB();
    process.exit(1);
  }
}

seed();

