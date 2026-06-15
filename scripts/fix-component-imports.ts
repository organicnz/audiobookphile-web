import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, callback: (path: string) => void) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

const dirsToWalk = ['./src', './cypress'];

dirsToWalk.forEach(dir => {
  walk(dir, (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/@\/components\/modals/g, '@/shared/modals')
      .replace(/@\/components\/widgets/g, '@/shared/widgets');
    
    if (content !== newContent) {
      console.log(`Updating ${filePath}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  });
});
