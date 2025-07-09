const fs = require("fs");
const fetch = require("node-fetch");

const GITHUB_USERNAME = "Sov-ereign";
const TOKEN = process.env.PERSONAL_TOKEN;

const query = `
{
  user(login: "${GITHUB_USERNAME}") {
    repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        primaryLanguage {
          name
          color
        }
      }
    }
  }
}
`;

const getIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("ai") || lower.includes("ml")) return "🤖";
  if (lower.includes("game") || lower.includes("quiz")) return "🎮";
  if (lower.includes("keyboard") || lower.includes("type")) return "⌨️";
  if (lower.includes("news")) return "📰";
  if (lower.includes("sudoku")) return "🧩";
  if (lower.includes("web") || lower.includes("site")) return "🌐";
  return "📁";
};

async function fetchLatestRepos() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  if (!result.data?.user) {
    throw new Error("❌ GitHub API error: User data not found.");
  }

  return result.data.user.repositories.nodes;
}

async function updateReadme() {
  const repos = await fetchLatestRepos();
  const readmeTemplate = fs.readFileSync("README-template.md", "utf-8");

  const tableHeader =
    "| Icon | Repo | Description | ⭐ Stars | 🍴 Forks | 🖍️ Language |\n" +
    "|------|------|-------------|---------|----------|--------------|";

  const repoRows = repos
    .map((repo) => {
      const icon = getIcon(repo.name);
      const lang = repo.primaryLanguage
        ? `<span style="color:${repo.primaryLanguage.color}">${repo.primaryLanguage.name}</span>`
        : "_Unknown_";

      return `| ${icon} | [${repo.name}](${repo.url}) | ${
        repo.description || "_No description_"
      } | ${repo.stargazerCount} | ${repo.forkCount} | ${lang} |`;
    })
    .join("\n");

  const coolHeader = "```diff\n🆕 Latest Repositories (Auto-Updated)\n```";

  const finalBlock = `${coolHeader}\n\n${tableHeader}\n${repoRows}`;

  const newReadme = readmeTemplate.replace(
    /<!--LATEST_REPOS_START-->([\s\S]*?)<!--LATEST_REPOS_END-->/,
    `<!--LATEST_REPOS_START-->\n${finalBlock}\n<!--LATEST_REPOS_END-->`
  );

  fs.writeFileSync("README.md", newReadme);
}

updateReadme();
