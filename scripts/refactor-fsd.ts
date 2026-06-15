import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

// Define our moves
const fileMoves = [
  // LIBRARY FEATURE
  { from: 'src/components/widgets/BookShelfGrid.tsx', to: 'src/features/library/components/BookShelfGrid.tsx' },
  { from: 'src/components/widgets/BookShelfRow.tsx', to: 'src/features/library/components/BookShelfRow.tsx' },
  { from: 'src/components/widgets/LibraryFilesTable.tsx', to: 'src/features/library/components/LibraryFilesTable.tsx' },
  { from: 'src/hooks/useBookshelfData.ts', to: 'src/features/library/hooks/useBookshelfData.ts' },
  { from: 'src/hooks/useBookshelfQuery.ts', to: 'src/features/library/hooks/useBookshelfQuery.ts' },
  { from: 'src/hooks/useBookshelfUpdater.ts', to: 'src/features/library/hooks/useBookshelfUpdater.ts' },
  { from: 'src/hooks/useBookshelfVirtualizer.ts', to: 'src/features/library/hooks/useBookshelfVirtualizer.ts' },
  { from: 'src/hooks/useLibrariesQuery.ts', to: 'src/features/library/hooks/useLibrariesQuery.ts' },
  { from: 'src/hooks/useLibrarySearch.ts', to: 'src/features/library/hooks/useLibrarySearch.ts' },
  { from: 'src/contexts/LibraryContext.tsx', to: 'src/features/library/contexts/LibraryContext.tsx' },

  // PLAYER FEATURE
  { from: 'src/components/widgets/AudioTracksTable.tsx', to: 'src/features/player/components/AudioTracksTable.tsx' },
  { from: 'src/components/ui/DurationPicker.tsx', to: 'src/features/player/components/DurationPicker.tsx' },
  { from: 'src/components/widgets/ChaptersTable.tsx', to: 'src/features/player/components/ChaptersTable.tsx' },
  { from: 'src/hooks/usePlayerHandler.ts', to: 'src/features/player/hooks/usePlayerHandler.ts' },
  { from: 'src/hooks/useAudioPlayerHotkeys.ts', to: 'src/features/player/hooks/useAudioPlayerHotkeys.ts' },
  { from: 'src/hooks/usePlaybackSession.ts', to: 'src/features/player/hooks/usePlaybackSession.ts' },
  { from: 'src/hooks/usePlayerSettings.ts', to: 'src/features/player/hooks/usePlayerSettings.ts' },
  { from: 'src/contexts/MediaContext.tsx', to: 'src/features/player/contexts/MediaContext.tsx' },

  // METADATA FEATURE
  { from: 'src/components/widgets/CoverEdit.tsx', to: 'src/features/metadata/components/CoverEdit.tsx' },
  { from: 'src/components/widgets/Match.tsx', to: 'src/features/metadata/components/Match.tsx' },
  { from: 'src/contexts/MetadataContext.tsx', to: 'src/features/metadata/contexts/MetadataContext.tsx' },
  { from: 'src/hooks/useCoverSearch.ts', to: 'src/features/metadata/hooks/useCoverSearch.ts' },
  { from: 'src/hooks/useDetailsEdit.ts', to: 'src/features/metadata/hooks/useDetailsEdit.ts' },
];

async function run() {
  const root = project.getDirectory('.')?.getPath() || process.cwd();
  
  for (const move of fileMoves) {
    const file = project.getSourceFile(move.from);
    if (file) {
      const targetPath = `${root}/${move.to}`;
      const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
      console.log(`Moving ${move.from} -> ${targetDir}`);
      
      // Need to move file to the specific new path
      file.moveToDirectory(targetDir);
    } else {
      console.warn(`Could not find ${move.from}`);
    }
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done.');
}

run().catch(console.error);
