// controllers/repoController.js
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");

const git = simpleGit();

async function cloneRepoController(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Repo URL is required" });
  }

  try {
    const repoName = url.split("/").pop().replace(".git", "");
    const localPath = path.join(__dirname, "..", "repos", repoName);
    res.locals.localpath = localPath;

    if (!fs.existsSync(localPath)) {
      console.log(`Cloning ${url} into ${localPath} ...`);
      await git.clone(url, localPath);
      console.log("Repository cloned!");
    } else {
      console.log("Repo already exists, skipping clone.");
    }

    console.log({ message: "Repo cloned successfully", path: localPath });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clone repo" });
  }

}

module.exports = { cloneRepoController };