const fs = require("fs");
const fetch = require("node-fetch");

const username = "Sov-ereign";
const token = process.env.PERSONAL_TOKEN;

const headers = {
  Authorization: `token ${token}`,
  "User-Agent": "update-readme-script",
};

async function getRepos() {
  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`, {
    headers,
  });

  if (!res.ok) {
    console.error(`Failed to fetch repos: ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();

  return data
    .filter(repo => !repo.fork) // Skip forks
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

function generateMarkdown(repos) {
  const topRepos = repos.slice(0, 6); // Change to show more or less
  const lines = [];

  lines.push(`# 👋 Hello, I'm Somenath Gorai (Sov)`);
  lines.push(`**🚀 Tech Enthusiast | 💻 Software Developer | 🛡️ Cybersecurity Explorer**`);
  lines.push(`\n## 📌 Latest Projects\n`);

  for (const repo of topRepos) {
    lines.push(`- [${repo.name}](${repo.html_url}) — _${repo.description || "No description"}_`);
  }

  lines.push(`\n---`);
  lines.push(`_Updated automatically every day with love 💙 by GitHub Actions_`);

  return lines.join("\n");
}

async function main() {
  try {
    const repos = await getRepos();
    const markdown = generateMarkdown(repos);
    fs.writeFileSync("README.md", markdown);
    console.log("README.md updated!");
  } catch (err) {
    console.error("Error updating README:", err);
    process.exit(1);
  }
}

main();
