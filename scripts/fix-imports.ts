import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const importMappings: Record<string, string> = {
  // Library
  '@/hooks/useBookshelfData': '@/features/library/hooks/useBookshelfData',
  '@/hooks/useBookshelfQuery': '@/features/library/hooks/useBookshelfQuery',
  '@/hooks/useBookshelfUpdater': '@/features/library/hooks/useBookshelfUpdater',
  '@/hooks/useBookshelfVirtualizer': '@/features/library/hooks/useBookshelfVirtualizer',
  '@/hooks/useLibrariesQuery': '@/features/library/hooks/useLibrariesQuery',
  '@/hooks/useLibrarySearch': '@/features/library/hooks/useLibrarySearch',
  '@/contexts/LibraryContext': '@/features/library/contexts/LibraryContext',
  
  // Player
  '@/hooks/usePlayerHandler': '@/features/player/hooks/usePlayerHandler',
  '@/hooks/useAudioPlayerHotkeys': '@/features/player/hooks/useAudioPlayerHotkeys',
  '@/hooks/usePlaybackSession': '@/features/player/hooks/usePlaybackSession',
  '@/hooks/usePlayerSettings': '@/features/player/hooks/usePlayerSettings',
  '@/contexts/MediaContext': '@/features/player/contexts/MediaContext',

  // Metadata
  '@/hooks/useCoverSearch': '@/features/metadata/hooks/useCoverSearch',
  '@/hooks/useDetailsEdit': '@/features/metadata/hooks/useDetailsEdit',
  '@/contexts/MetadataContext': '@/features/metadata/contexts/MetadataContext',
  // Library Components
  '@/components/widgets/BookShelfGrid': '@/features/library/components/BookShelfGrid',
  '@/components/widgets/BookShelfRow': '@/features/library/components/BookShelfRow',
  '@/components/widgets/LibraryFilesTable': '@/features/library/components/LibraryFilesTable',

  // Player Components
  '@/components/widgets/AudioTracksTable': '@/features/player/components/AudioTracksTable',
  '@/components/ui/DurationPicker': '@/features/player/components/DurationPicker',
  '@/components/widgets/ChaptersTable': '@/features/player/components/ChaptersTable',

  // Metadata Components
  '@/components/widgets/CoverEdit': '@/features/metadata/components/CoverEdit',
  '@/components/widgets/Match': '@/features/metadata/components/Match',
};

async function run() {
  const sourceFiles = project.getSourceFiles();

  for (const file of sourceFiles) {
    let modified = false;
    const importDeclarations = file.getImportDeclarations();
    
    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      if (importMappings[moduleSpecifier]) {
        importDecl.setModuleSpecifier(importMappings[moduleSpecifier]);
        modified = true;
      } else {
        // Also check if they try to import with .ts or .tsx (unlikely with @/)
        for (const [oldPath, newPath] of Object.entries(importMappings)) {
          if (moduleSpecifier.startsWith(oldPath)) {
             const newSpecifier = moduleSpecifier.replace(oldPath, newPath);
             importDecl.setModuleSpecifier(newSpecifier);
             modified = true;
          }
        }
      }
    }
    
    if (modified) {
      console.log(`Updated imports in ${file.getFilePath()}`);
    }
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done.');
}

run().catch(console.error);
