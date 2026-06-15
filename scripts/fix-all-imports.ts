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

const replacements: [RegExp, string][] = [
  // Domain hooks
  [/@\/hooks\/useAuthorActions/g, '@/features/metadata/hooks/useAuthorActions'],
  [/@\/hooks\/useMultiSelectMatchField/g, '@/features/metadata/hooks/useMultiSelectMatchField'],
  [/@\/hooks\/useEpisodeFilterAndSort/g, '@/features/player/hooks/useEpisodeFilterAndSort'],
  [/@\/hooks\/useEpisodeTableVirtualizer/g, '@/features/player/hooks/useEpisodeTableVirtualizer'],
  [/@\/hooks\/useInfiniteBookshelf/g, '@/features/library/hooks/useInfiniteBookshelf'],
  [/@\/hooks\/useItemPageSocket/g, '@/features/library/hooks/useItemPageSocket'],
  [/@\/hooks\/useLibraryFileActions/g, '@/features/library/hooks/useLibraryFileActions'],
  [/@\/hooks\/useFilterData/g, '@/features/library/hooks/useFilterData'],
  [/@\/hooks\/useGlobalSearchTransformer/g, '@/features/library/hooks/useGlobalSearchTransformer'],
  // Generic hooks → shared
  [/@\/hooks\//g, '@/shared/hooks/'],
  // Contexts → shared
  [/@\/contexts\/CardSizeContext/g, '@/features/library/contexts/CardSizeContext'],
  [/@\/contexts\//g, '@/shared/contexts/'],
  // Lib → shared
  [/@\/lib\/player\//g, '@/features/player/lib/'],
  [/@\/lib\//g, '@/shared/lib/'],
  // Utils → shared
  [/@\/utils\//g, '@/shared/utils/'],
];

const dirsToWalk = ['./src', './cypress'];
let totalUpdated = 0;

dirsToWalk.forEach(dir => {
  walk(dir, (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (const [pattern, replacement] of replacements) {
      newContent = newContent.replace(pattern, replacement);
    }
    if (content !== newContent) {
      totalUpdated++;
      console.log(`Updating ${filePath}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  });
});

console.log(`\nDone. Updated ${totalUpdated} files.`);
