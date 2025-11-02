const path = require("path");

// Load the low-effort action
const lowEffort = require(path.resolve(__dirname, "./low-effort/index.js"));

// Mock GitHub + context objects for local testing
const mockGithub = {
  paginate: async () => [
    { filename: "README.md", changes: 2, additions: 1, deletions: 1 },
  ],
  rest: {
    pulls: {
      listFiles: async () => ({
        data: [{ filename: "README.md", changes: 2, additions: 1, deletions: 1 }],
      }),
    },
    issues: {
      addLabels: async (params) => console.log("🟢 addLabels called:", params),
      createComment: async (params) => console.log("💬 createComment called:", params.body.slice(0, 100) + "..."),
    },
    search: {
      issuesAndPullRequests: async () => ({ data: { total_count: 1 } }),
    },
  },
};

const mockContext = {
  repo: { owner: "ShakshiY", repo: "Octoguard" },
  payload: {
    pull_request: {
      number: 42,
      title: "Update README",
      body: "This PR improves documentation.",
      user: { login: "shakshiY" },
    },
  },
};

(async () => {
  console.log("🚀 Running low-effort action test...");
  process.env.LOW_EFFORT_GRACE_HOURS = process.env.LOW_EFFORT_GRACE_HOURS || "24";
  await lowEffort({ github: mockGithub, context: mockContext });
  console.log("✅ Low-effort action simulation completed!");
})();
