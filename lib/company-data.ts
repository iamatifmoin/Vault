import type {
  Company,
  CompanyReadiness,
  CompanyTier,
  CompanyTopicPattern,
} from "@/types";

function topics(...entries: [string, number][]): CompanyTopicPattern[] {
  return entries.map(([topic, weight]) => ({ topic, weight }));
}

export const COMPANIES: Company[] = [
  // FAANG
  {
    id: "amazon",
    name: "Amazon",
    tier: "FAANG",
    totalKnownProblems: 185,
    topics: topics(
      ["Arrays", 5],
      ["DP", 5],
      ["Trees", 5],
      ["Graphs", 4],
      ["Strings", 4],
      ["Hashing", 4],
      ["Recursion", 3],
      ["Binary Search", 4],
      ["Greedy", 3],
    ),
  },
  {
    id: "google",
    name: "Google",
    tier: "FAANG",
    totalKnownProblems: 195,
    topics: topics(
      ["Arrays", 5],
      ["Graphs", 5],
      ["DP", 5],
      ["Trees", 4],
      ["Strings", 4],
      ["Binary Search", 5],
      ["Bit Manipulation", 3],
    ),
  },
  {
    id: "microsoft",
    name: "Microsoft",
    tier: "FAANG",
    totalKnownProblems: 175,
    topics: topics(
      ["Trees", 5],
      ["Graphs", 4],
      ["DP", 4],
      ["Arrays", 4],
      ["Strings", 4],
      ["Linked Lists", 4],
      ["Recursion", 3],
    ),
  },
  {
    id: "meta",
    name: "Meta",
    tier: "FAANG",
    totalKnownProblems: 180,
    topics: topics(
      ["Arrays", 5],
      ["Strings", 5],
      ["DP", 4],
      ["Trees", 3],
      ["Graphs", 3],
    ),
  },
  {
    id: "adobe",
    name: "Adobe",
    tier: "FAANG",
    totalKnownProblems: 160,
    topics: topics(
      ["Arrays", 4],
      ["Strings", 4],
      ["Trees", 3],
      ["DP", 3],
      ["Hashing", 3],
    ),
  },

  // Indian Unicorn
  {
    id: "flipkart",
    name: "Flipkart",
    tier: "Indian Unicorn",
    totalKnownProblems: 105,
    topics: topics(
      ["Arrays", 5],
      ["DP", 4],
      ["Trees", 4],
      ["Graphs", 3],
      ["Strings", 3],
      ["Hashing", 4],
    ),
  },
  {
    id: "paytm",
    name: "Paytm",
    tier: "Indian Unicorn",
    totalKnownProblems: 85,
    topics: topics(
      ["Arrays", 4],
      ["Strings", 3],
      ["DP", 3],
      ["Trees", 3],
      ["Hashing", 3],
    ),
  },
  {
    id: "razorpay",
    name: "Razorpay",
    tier: "Indian Unicorn",
    totalKnownProblems: 95,
    topics: topics(
      ["Arrays", 4],
      ["Strings", 4],
      ["DP", 3],
      ["System Design", 2],
    ),
  },
  {
    id: "phonepe",
    name: "PhonePe",
    tier: "Indian Unicorn",
    totalKnownProblems: 90,
    topics: topics(
      ["Arrays", 4],
      ["Trees", 3],
      ["DP", 3],
      ["Graphs", 3],
    ),
  },
  {
    id: "swiggy",
    name: "Swiggy",
    tier: "Indian Unicorn",
    totalKnownProblems: 88,
    topics: topics(
      ["Arrays", 4],
      ["Graphs", 3],
      ["Trees", 3],
      ["DP", 3],
    ),
  },
  {
    id: "zomato",
    name: "Zomato",
    tier: "Indian Unicorn",
    totalKnownProblems: 82,
    topics: topics(
      ["Arrays", 4],
      ["Strings", 3],
      ["DP", 3],
      ["Hashing", 3],
    ),
  },
  {
    id: "cred",
    name: "CRED",
    tier: "Indian Unicorn",
    totalKnownProblems: 110,
    topics: topics(
      ["Arrays", 5],
      ["Trees", 4],
      ["DP", 4],
      ["Graphs", 3],
    ),
  },
  {
    id: "dream11",
    name: "Dream11",
    tier: "Indian Unicorn",
    totalKnownProblems: 92,
    topics: topics(
      ["Arrays", 4],
      ["DP", 4],
      ["Trees", 3],
      ["Graphs", 3],
    ),
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    tier: "Indian Unicorn",
    totalKnownProblems: 115,
    topics: topics(
      ["Arrays", 5],
      ["DP", 5],
      ["Trees", 4],
      ["Graphs", 3],
      ["Maths", 3],
    ),
  },
  {
    id: "jp-morgan",
    name: "JP Morgan",
    tier: "Indian Unicorn",
    totalKnownProblems: 100,
    topics: topics(
      ["Arrays", 4],
      ["DP", 4],
      ["Trees", 3],
      ["Strings", 3],
    ),
  },

  // Service
  {
    id: "tcs",
    name: "TCS",
    tier: "Service",
    totalKnownProblems: 45,
    topics: topics(
      ["Arrays", 3],
      ["Strings", 3],
      ["Hashing", 2],
      ["Sorting", 2],
    ),
  },
  {
    id: "infosys",
    name: "Infosys",
    tier: "Service",
    totalKnownProblems: 42,
    topics: topics(
      ["Arrays", 3],
      ["Strings", 3],
      ["Recursion", 2],
    ),
  },
  {
    id: "wipro",
    name: "Wipro",
    tier: "Service",
    totalKnownProblems: 38,
    topics: topics(
      ["Arrays", 3],
      ["Strings", 3],
      ["Sorting", 2],
    ),
  },
  {
    id: "cognizant",
    name: "Cognizant",
    tier: "Service",
    totalKnownProblems: 40,
    topics: topics(
      ["Arrays", 3],
      ["Strings", 2],
      ["Hashing", 2],
    ),
  },
  {
    id: "capgemini",
    name: "Capgemini",
    tier: "Service",
    totalKnownProblems: 35,
    topics: topics(
      ["Arrays", 3],
      ["Strings", 2],
    ),
  },
];

export function getCompanyById(id: string): Company | undefined {
  return COMPANIES.find((company) => company.id === id);
}

export function getCompaniesByTier(tier: CompanyTier): Company[] {
  return COMPANIES.filter((company) => company.tier === tier);
}

export function computeCompanyReadiness(
  company: Company,
  problems: { topics?: string[] }[],
): CompanyReadiness {
  const totalWeight = company.topics.reduce((sum, t) => sum + t.weight, 0);

  const topicResults = company.topics.map(({ topic, weight }) => {
    const solved = problems.filter(
      (p) => Array.isArray(p.topics) && p.topics.includes(topic),
    ).length;
    const expected = Math.ceil(
      company.totalKnownProblems * (weight / totalWeight),
    );
    const readinessPercent =
      expected === 0 ? 0 : Math.min(solved / expected, 1) * 100;

    return { topic, solved, total: expected, readinessPercent };
  });

  const readinessPercent =
    totalWeight === 0
      ? 0
      : topicResults.reduce(
          (sum, result, index) =>
            sum + result.readinessPercent * company.topics[index].weight,
          0,
        ) / totalWeight;

  const weakestTopics = [...topicResults]
    .sort((a, b) => a.readinessPercent - b.readinessPercent)
    .slice(0, 3)
    .map((result) => result.topic);

  return {
    companyId: company.id,
    readinessPercent,
    topicReadiness: topicResults.map(({ topic, solved, total }) => ({
      topic,
      solved,
      total,
    })),
    weakestTopics,
  };
}
