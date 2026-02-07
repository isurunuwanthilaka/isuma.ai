import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  // NOTE: You must also create this user in Supabase Auth (Dashboard → Authentication → Users)
  // and then update the supabaseId here or via the sync-user API endpoint.
  const admin = await prisma.user.upsert({
    where: { email: "admin@isuma.ai" },
    update: {},
    create: {
      supabaseId: "seed_admin_placeholder",
      email: "admin@isuma.ai",
      name: "Admin User",
      role: "admin",
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create recruiter user
  const recruiter = await prisma.user.upsert({
    where: { email: "recruiter@isuma.ai" },
    update: {},
    create: {
      supabaseId: "seed_recruiter_placeholder",
      email: "recruiter@isuma.ai",
      name: "Recruiter User",
      role: "recruiter",
    },
  });
  console.log("✅ Created recruiter user:", recruiter.email);

  // Create sample coding problems
  const problems = [
    {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
      difficulty: "easy",
      timeLimit: 30,
      starterCode: `function twoSum(nums, target) {
  // Your code here
}`,
      testCases: JSON.stringify([
        { input: { nums: [2, 7, 11, 15], target: 9 }, output: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, output: [1, 2] },
      ]),
      createdBy: admin.id,
    },
    {
      title: "Reverse String",
      description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]`,
      difficulty: "easy",
      timeLimit: 20,
      starterCode: `function reverseString(s) {
  // Your code here
}`,
      testCases: JSON.stringify([
        {
          input: { s: ["h", "e", "l", "l", "o"] },
          output: ["o", "l", "l", "e", "h"],
        },
        {
          input: { s: ["H", "a", "n", "n", "a", "h"] },
          output: ["h", "a", "n", "n", "a", "H"],
        },
      ]),
      createdBy: admin.id,
    },
    {
      title: "Valid Palindrome",
      description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.`,
      difficulty: "medium",
      timeLimit: 30,
      starterCode: `function isPalindrome(s) {
  // Your code here
}`,
      testCases: JSON.stringify([
        { input: { s: "A man, a plan, a canal: Panama" }, output: true },
        { input: { s: "race a car" }, output: false },
      ]),
      createdBy: admin.id,
    },
    {
      title: "Merge Sorted Arrays",
      description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should be returned by the function.`,
      difficulty: "medium",
      timeLimit: 40,
      starterCode: `function merge(nums1, m, nums2, n) {
  // Your code here
}`,
      testCases: JSON.stringify([
        {
          input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
          output: [1, 2, 2, 3, 5, 6],
        },
      ]),
      createdBy: admin.id,
    },
  ];

  for (const problem of problems) {
    await prisma.codingProblem.upsert({
      where: { id: problem.title.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: problem,
    });
    console.log("✅ Created problem:", problem.title);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
