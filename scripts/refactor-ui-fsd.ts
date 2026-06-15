import { Project } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

async function run() {
  const root = project.getDirectory('.')?.getPath() || process.cwd();

  // Create target directories if they don't exist
  const targets = [
    'src/features/player/components',
    'src/features/auth/components',
    'src/features/metadata/components',
    'src/shared/ui'
  ];

  targets.forEach(t => {
    if (!fs.existsSync(t)) {
      fs.mkdirSync(t, { recursive: true });
    }
  });

  // Since we create directories manually, it's safer to move files individually
  // so ts-morph updates the references reliably across CSS modules and TSX.
  const fileMoves = [];

  // Player
  const playerDir = project.getDirectory('src/components/player');
  if (playerDir) {
    playerDir.getSourceFiles().forEach(f => {
      fileMoves.push({ file: f, target: `src/features/player/components/${f.getBaseName()}` });
    });
  }

  // Auth
  const authDir = project.getDirectory('src/components/auth');
  if (authDir) {
    authDir.getSourceFiles().forEach(f => {
      fileMoves.push({ file: f, target: `src/features/auth/components/${f.getBaseName()}` });
    });
  }

  // Covers
  const coversDir = project.getDirectory('src/components/covers');
  if (coversDir) {
    coversDir.getSourceFiles().forEach(f => {
      fileMoves.push({ file: f, target: `src/features/metadata/components/${f.getBaseName()}` });
    });
  }

  // UI
  const uiDir = project.getDirectory('src/components/ui');
  if (uiDir) {
    // recursively get all source files
    uiDir.getDescendantSourceFiles().forEach(f => {
      // Calculate relative path from src/components/ui to maintain inner structure (like slate/)
      const relPath = f.getFilePath().substring(f.getFilePath().indexOf('src/components/ui/') + 'src/components/ui/'.length);
      fileMoves.push({ file: f, target: `src/shared/ui/${relPath}` });
    });
  }

  for (const move of fileMoves) {
    console.log(`Moving ${move.file.getFilePath()} -> ${move.target}`);
    // Create inner target directory if needed (e.g. for slate/)
    const fullTargetPath = `${root}/${move.target}`;
    const targetDir = fullTargetPath.substring(0, fullTargetPath.lastIndexOf('/'));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Use ts-morph's moveToDirectory which automatically updates imports
    const targetTsDir = project.getDirectory(targetDir) || project.createDirectory(targetDir);
    move.file.moveToDirectory(targetTsDir);
  }

  // Also manually handle CSS module imports because ts-morph might not update string imports in CSS files,
  // but wait, we use CSS modules imported into TS. ts-morph will update the import path to the CSS file
  // as long as the CSS file is moved. Oh wait, ts-morph doesn't track .css files by default.
  // We need to move the CSS files using node fs and then update the imports manually via string replacement.

  console.log('Saving all files...');
  await project.save();

  // Now handle .css files manually
  const cssMoves = [
    { from: 'src/components/ui/IconBtn.module.css', to: 'src/shared/ui/IconBtn.module.css' },
    { from: 'src/components/ui/LoadingIndicator.module.css', to: 'src/shared/ui/LoadingIndicator.module.css' }
  ];

  for (const move of cssMoves) {
    if (fs.existsSync(move.from)) {
      console.log(`Moving CSS: ${move.from} -> ${move.to}`);
      fs.renameSync(move.from, move.to);
    }
  }

  // Fix up CSS module imports
  const sourceFiles = project.getSourceFiles();
  for (const file of sourceFiles) {
    let modified = false;
    const importDeclarations = file.getImportDeclarations();
    for (const importDecl of importDeclarations) {
      const specifier = importDecl.getModuleSpecifierValue();
      if (specifier === '@/components/ui/IconBtn.module.css') {
        importDecl.setModuleSpecifier('@/shared/ui/IconBtn.module.css');
        modified = true;
      }
      if (specifier === '@/components/ui/LoadingIndicator.module.css') {
        importDecl.setModuleSpecifier('@/shared/ui/LoadingIndicator.module.css');
        modified = true;
      }
    }
    if (modified) {
      console.log(`Updated CSS import in ${file.getFilePath()}`);
    }
  }
  await project.save();

  console.log('Done.');
}

run().catch(console.error);
