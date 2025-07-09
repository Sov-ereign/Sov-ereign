const fs = require("fs");
const fetch = require("node-fetch");

const GITHUB_USERNAME = "Sov-ereign";
const TOKEN = process.env.PERSONAL_TOKEN; // ✅ Use PERSONAL_TOKEN not GITHUB_TOKEN

const query = `
{
  user(login: "${GITHUB_USERNAME}") {
    repositories(first: 5, orderBy: {field: CREATED_AT, direction: DESC}, privacy: PUBLIC) {
      nodes {
        name
        description
        url
      }
    }
  }
}
`;

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

  // 💥 Show full response for debugging
  console.log("📦 Full GraphQL Response:");
  console.log(JSON.stringify(result, null, 2));

  if (result.errors) {
    console.error("❌ GraphQL Error:", JSON.stringify(result.errors, null, 2));
    process.exit(1); // stop execution on error
  }

  return result.data.user.repositories.nodes;
}

async function updateReadme() {
  const repos = await fetchLatestRepos();
  const readmeTemplate = fs.readFileSync("README-template.md", "utf-8");

  const repoList = repos
    .map(
      (repo) =>
        `- [${repo.name}](${repo.url}): ${repo.description || "No description"}`
    )
    .join("\n");

  const newReadme = readmeTemplate.replace(
    /<!--LATEST_REPOS_START-->([\s\S]*?)<!--LATEST_REPOS_END-->/,
    `<!--LATEST_REPOS_START-->\n${repoList}\n<!--LATEST_REPOS_END-->`
  );

  fs.writeFileSync("README.md", newReadme);
  console.log("✅ README.md updated with latest repos.");
}

updateReadme();
