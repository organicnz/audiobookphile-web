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
    'src/shared/modals',
    'src/shared/widgets'
  ];

  targets.forEach(t => {
    if (!fs.existsSync(t)) {
      fs.mkdirSync(t, { recursive: true });
    }
  });

  const fileMoves = [];

  // Modals
  const modalsDir = project.getDirectory('src/components/modals');
  if (modalsDir) {
    modalsDir.getDescendantSourceFiles().forEach(f => {
      const relPath = f.getFilePath().substring(f.getFilePath().indexOf('src/components/modals/') + 'src/components/modals/'.length);
      fileMoves.push({ file: f, target: `src/shared/modals/${relPath}` });
    });
  }

  // Widgets
  const widgetsDir = project.getDirectory('src/components/widgets');
  if (widgetsDir) {
    widgetsDir.getDescendantSourceFiles().forEach(f => {
      const relPath = f.getFilePath().substring(f.getFilePath().indexOf('src/components/widgets/') + 'src/components/widgets/'.length);
      fileMoves.push({ file: f, target: `src/shared/widgets/${relPath}` });
    });
  }

  for (const move of fileMoves) {
    console.log(`Moving ${move.file.getFilePath()} -> ${move.target}`);
    const fullTargetPath = `${root}/${move.target}`;
    const targetDir = fullTargetPath.substring(0, fullTargetPath.lastIndexOf('/'));
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Use ts-morph's moveToDirectory which automatically updates imports
    const targetTsDir = project.getDirectory(targetDir) || project.createDirectory(targetDir);
    move.file.moveToDirectory(targetTsDir);
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done.');
}

run().catch(console.error);
