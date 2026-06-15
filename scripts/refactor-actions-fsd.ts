import { Project } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

// Define our action moves
const actionMoves = [
  // Auth
  { from: 'src/app/actions/authActions.ts', to: 'src/features/auth/actions/authActions.ts' },
  
  // Library
  { from: 'src/app/actions/libraryActions.ts', to: 'src/features/library/actions/libraryActions.ts' },
  { from: 'src/app/actions/collectionActions.ts', to: 'src/features/library/actions/collectionActions.ts' },
  { from: 'src/app/actions/playlistActions.ts', to: 'src/features/library/actions/playlistActions.ts' },
  { from: 'src/app/actions/searchActions.ts', to: 'src/features/library/actions/searchActions.ts' },

  // Player
  { from: 'src/app/actions/playbackActions.ts', to: 'src/features/player/actions/playbackActions.ts' },
  { from: 'src/app/actions/mediaActions.ts', to: 'src/features/player/actions/mediaActions.ts' },
  { from: 'src/app/actions/audioFileActions.ts', to: 'src/features/player/actions/audioFileActions.ts' },

  // Metadata
  { from: 'src/app/actions/coverActions.ts', to: 'src/features/metadata/actions/coverActions.ts' },
  { from: 'src/app/actions/coverFetchActions.ts', to: 'src/features/metadata/actions/coverFetchActions.ts' },
  { from: 'src/app/actions/matchActions.ts', to: 'src/features/metadata/actions/matchActions.ts' },
  { from: 'src/app/actions/providerActions.ts', to: 'src/features/metadata/actions/providerActions.ts' },

  // Tools
  { from: 'src/app/actions/rssFeedActions.ts', to: 'src/features/tools/actions/rssFeedActions.ts' },
  { from: 'src/app/actions/shareActions.ts', to: 'src/features/tools/actions/shareActions.ts' },
  { from: 'src/app/actions/toolsActions.ts', to: 'src/features/tools/actions/toolsActions.ts' },
];

const importMappings: Record<string, string> = {};
actionMoves.forEach(move => {
  const fromImport = '@/' + move.from.replace('src/', '').replace('.ts', '');
  const toImport = '@/' + move.to.replace('src/', '').replace('.ts', '');
  importMappings[fromImport] = toImport;
});

async function run() {
  const root = project.getDirectory('.')?.getPath() || process.cwd();
  
  // Step 1: Move Files
  for (const move of actionMoves) {
    const file = project.getSourceFile(move.from);
    if (file) {
      const targetPath = `${root}/${move.to}`;
      const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
      console.log(`Moving ${move.from} -> ${targetDir}`);
      
      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      file.moveToDirectory(targetDir);
    } else {
      console.warn(`Could not find ${move.from}`);
    }
  }

  // Step 2: Update Imports Across Entire Project
  const sourceFiles = project.getSourceFiles();
  for (const file of sourceFiles) {
    let modified = false;
    const importDeclarations = file.getImportDeclarations();
    
    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (importMappings[moduleSpecifier]) {
        importDecl.setModuleSpecifier(importMappings[moduleSpecifier]);
        modified = true;
      }
    }
    
    if (modified) {
      console.log(`Updated imports in ${file.getFilePath()}`);
    }
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done moving and updating imports.');
}

run().catch(console.error);
