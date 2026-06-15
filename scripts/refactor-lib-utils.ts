import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });

async function run() {
  // Move lib/player/* → features/player/lib/
  const playerLibDir = project.getDirectory('src/lib/player');
  if (playerLibDir) {
    const targetDir = project.getDirectory('src/features/player/lib') || project.createDirectory('src/features/player/lib');
    for (const file of playerLibDir.getDescendantSourceFiles()) {
      const relPath = file.getFilePath().split('src/lib/player/').pop()!;
      const subDir = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')) : null;
      const dest = subDir
        ? project.getDirectory(`src/features/player/lib/${subDir}`) || project.createDirectory(`src/features/player/lib/${subDir}`)
        : targetDir;
      console.log(`Moving ${file.getFilePath().split('audiobookphile-web/').pop()} → src/features/player/lib/${relPath}`);
      file.moveToDirectory(dest);
    }
  }

  // Move remaining lib/* → shared/lib/
  const libDir = project.getDirectory('src/lib');
  if (libDir) {
    for (const file of libDir.getDescendantSourceFiles()) {
      const relPath = file.getFilePath().split('src/lib/').pop()!;
      const subDir = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')) : null;
      const targetBase = 'src/shared/lib';
      const dest = subDir
        ? project.getDirectory(`${targetBase}/${subDir}`) || project.createDirectory(`${targetBase}/${subDir}`)
        : project.getDirectory(targetBase) || project.createDirectory(targetBase);
      console.log(`Moving src/lib/${relPath} → src/shared/lib/${relPath}`);
      file.moveToDirectory(dest);
    }
  }

  // Move utils/* → shared/utils/
  const utilsDir = project.getDirectory('src/utils');
  if (utilsDir) {
    for (const file of utilsDir.getDescendantSourceFiles()) {
      const relPath = file.getFilePath().split('src/utils/').pop()!;
      const subDir = relPath.includes('/') ? relPath.substring(0, relPath.lastIndexOf('/')) : null;
      const targetBase = 'src/shared/utils';
      const dest = subDir
        ? project.getDirectory(`${targetBase}/${subDir}`) || project.createDirectory(`${targetBase}/${subDir}`)
        : project.getDirectory(targetBase) || project.createDirectory(targetBase);
      console.log(`Moving src/utils/${relPath} → src/shared/utils/${relPath}`);
      file.moveToDirectory(dest);
    }
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done: lib + utils relocated.');
}

run().catch(console.error);
