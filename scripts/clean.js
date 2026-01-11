const fs = require('fs');
const path = require('path');

function deleteDir(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}

function findAndDelete(root, pattern, isDir) {
  const files = fs.readdirSync(root);
  
  files.forEach((file) => {
    const fullPath = path.join(root, file);
    
    try {
      const stat = fs.lstatSync(fullPath);
      
      if (stat.isDirectory()) {
        if (isDir && file === pattern) {
          deleteDir(fullPath);
          console.log('Deleted:', fullPath);
        } else if (!fullPath.includes('node_modules') && file !== '.git') {
          findAndDelete(fullPath, pattern, isDir);
        }
      } else if (!isDir && file === pattern) {
        fs.unlinkSync(fullPath);
        console.log('Deleted:', fullPath);
      }
    } catch (e) {
      // Ignore errors (e.g., permission denied, broken symlinks)
    }
  });
}

const root = process.cwd();

console.log('Cleaning node_modules, dist directories and package-lock.json files...');
findAndDelete(root, 'node_modules', true);
findAndDelete(root, 'dist', true);
findAndDelete(root, 'package-lock.json', false);
console.log('Clean completed!');
