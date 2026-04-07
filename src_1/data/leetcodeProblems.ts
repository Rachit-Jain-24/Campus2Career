export interface RecommendedProblem {
    id: string;
    title: string;
    titleSlug: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    level: 1 | 2 | 3 | 4; // Target Year
}

export const RECOMMENDED_PROBLEMS: RecommendedProblem[] = [
    // --- Year 1 & 2: FOUNDATION (Arrays, Strings, Logic) ---
    { id: '1', title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', category: 'Arrays', level: 1 },
    { id: '2', title: 'Valid Palindrome', titleSlug: 'valid-palindrome', difficulty: 'Easy', category: 'Strings', level: 1 },
    { id: '3', title: 'Roman to Integer', titleSlug: 'roman-to-integer', difficulty: 'Easy', category: 'Logic', level: 1 },
    { id: '4', title: 'Contains Duplicate', titleSlug: 'contains-duplicate', difficulty: 'Easy', category: 'Arrays', level: 2 },
    { id: '5', title: 'Valid Anagram', titleSlug: 'valid-anagram', difficulty: 'Easy', category: 'Strings', level: 2 },
    { id: '6', title: 'Best Time to Buy and Sell Stock', titleSlug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', category: 'Arrays', level: 2 },
    { id: '7', title: 'Merge Sorted Array', titleSlug: 'merge-sorted-array', difficulty: 'Easy', category: 'Arrays', level: 2 },

    // --- Year 3: INTERMEDIATE (Linked Lists, Trees, Searching) ---
    { id: '10', title: 'Reverse Linked List', titleSlug: 'reverse-linked-list', difficulty: 'Easy', category: 'Linked Lists', level: 3 },
    { id: '11', title: 'Linked List Cycle', titleSlug: 'linked-list-cycle', difficulty: 'Easy', category: 'Linked Lists', level: 3 },
    { id: '12', title: 'Maximum Subarray', titleSlug: 'maximum-subarray', difficulty: 'Medium', category: 'Arrays', level: 3 },
    { id: '13', title: 'Binary Tree Inorder Traversal', titleSlug: 'binary-tree-inorder-traversal', difficulty: 'Easy', category: 'Trees', level: 3 },
    { id: '14', title: 'Invert Binary Tree', titleSlug: 'invert-binary-tree', difficulty: 'Easy', category: 'Trees', level: 3 },
    { id: '15', title: 'Search in Rotated Sorted Array', titleSlug: 'search-in-rotated-sorted-array', difficulty: 'Medium', category: 'Binary Search', level: 3 },
    { id: '16', title: 'Top K Frequent Elements', titleSlug: 'top-k-frequent-elements', difficulty: 'Medium', category: 'Heap', level: 3 },

    // --- Year 4: PLACEMENT PRO (DP, Graphs, High Frequency) ---
    { id: '20', title: 'Climbing Stairs', titleSlug: 'climbing-stairs', difficulty: 'Easy', category: 'DP', level: 4 },
    { id: '21', title: 'House Robber', titleSlug: 'house-robber', difficulty: 'Medium', category: 'DP', level: 4 },
    { id: '22', title: 'Coin Change', titleSlug: 'coin-change', difficulty: 'Medium', category: 'DP', level: 4 },
    { id: '23', title: 'Number of Islands', titleSlug: 'number-of-islands', difficulty: 'Medium', category: 'Graphs', level: 4 },
    { id: '24', title: 'Validate Binary Search Tree', titleSlug: 'validate-binary-search-tree', difficulty: 'Medium', category: 'Trees', level: 4 },
    { id: '25', title: 'Course Schedule', titleSlug: 'course-schedule', difficulty: 'Medium', category: 'Graphs', level: 4 },
    { id: '26', title: 'Longest Palindromic Substring', titleSlug: 'longest-palindromic-substring', difficulty: 'Medium', category: 'Strings', level: 4 },
    { id: '27', title: 'Kth Largest Element in an Array', titleSlug: 'kth-largest-element-in-an-array', difficulty: 'Medium', category: 'Heap', level: 4 },
];
