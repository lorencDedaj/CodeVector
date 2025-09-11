// controllers/repoController.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const git = simpleGit();

async function cloneRepoController(req, res, next) {
  const { url } = req.body;
  console.log(url)
  if (!url) {
    return res.status(400).json({ error: 'Repo URL is required' });
  }
 
  try {
    const repoName = url.split('/').pop().replace('.git', '');
    const localPath = path.join(__dirname, '..', 'repos', repoName);
    res.locals.repoName = repoName;
    console.log(localPath);
    if (!fs.existsSync(localPath)) {
      console.log(`Cloning ${url} into ${localPath} ...`);
      await git.clone(url, localPath);
      console.log('Repository cloned!');
    } else {
      console.log('Repo already exists, skipping clone.');
    }

    console.log({ message: 'Repo cloned successfully', path: localPath });
    function getAllFiles(dirPath, arrayOfFiles = []) {
      // Read all items in the current directory
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);

        // If it’s a directory, recursively traverse
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          // If it’s a file, add to the list
          arrayOfFiles.push(fullPath);
        }
      });
      return arrayOfFiles;
    }
    const allFiles = getAllFiles(localPath);
    res.locals.allFiles = allFiles;
    // check if getAllFiles function works.
    console.log(res.locals.allFiles);

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clone repo' });
  }
}

module.exports = { cloneRepoController };
