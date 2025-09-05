// // cloneRepo.js — CommonJS 写法
// const simpleGit = require("simple-git");
// const git = simpleGit();

// /**
//  * 克隆 GitHub 仓库
//  * @param {string} url - 仓库地址
//  * @param {string} localPath - 本地存放路径
//  */
// async function cloneRepo(url, localPath) {
//   try {
//     console.log(`⏳ Cloning ${url} to ${localPath} ...`);
//     await git.clone(url, localPath);
//     console.log("✅ Repo cloned successfully!");
//   } catch (err) {
//     console.error("❌ Clone failed:", err);
//   }
// }

// // Example Usage
// const repoUrl = "https://github.com/CodesmithLLC/frontend-assessment.git"; // 替换你的仓库
// const localPath = "./repo";

// cloneRepo(repoUrl, localPath);
