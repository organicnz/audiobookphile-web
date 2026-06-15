import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });

// Define all file moves: [source, destination]
const moves: [string, string][] = [
  // 7a: Domain-specific hooks → feature domains
  ['src/hooks/useAuthorActions.ts', 'src/features/metadata/hooks/useAuthorActions.ts'],
  ['src/hooks/useEpisodeFilterAndSort.ts', 'src/features/player/hooks/useEpisodeFilterAndSort.ts'],
  ['src/hooks/useEpisodeTableVirtualizer.ts', 'src/features/player/hooks/useEpisodeTableVirtualizer.ts'],
  ['src/hooks/useInfiniteBookshelf.ts', 'src/features/library/hooks/useInfiniteBookshelf.ts'],
  ['src/hooks/useItemPageSocket.ts', 'src/features/library/hooks/useItemPageSocket.ts'],
  ['src/hooks/useLibraryFileActions.ts', 'src/features/library/hooks/useLibraryFileActions.ts'],
  ['src/hooks/useFilterData.ts', 'src/features/library/hooks/useFilterData.ts'],
  ['src/hooks/useGlobalSearchTransformer.ts', 'src/features/library/hooks/useGlobalSearchTransformer.ts'],
  ['src/hooks/useMultiSelectMatchField.ts', 'src/features/metadata/hooks/useMultiSelectMatchField.ts'],

  // 7b: Generic hooks → shared/hooks
  ['src/hooks/useClickOutside.ts', 'src/shared/hooks/useClickOutside.ts'],
  ['src/hooks/useImageColor.ts', 'src/shared/hooks/useImageColor.ts'],
  ['src/hooks/useMenuPosition.ts', 'src/shared/hooks/useMenuPosition.ts'],
  ['src/hooks/useMergedRef.ts', 'src/shared/hooks/useMergedRef.ts'],
  ['src/hooks/usePersistentScroll.ts', 'src/shared/hooks/usePersistentScroll.ts'],
  ['src/hooks/useScrollToFocused.ts', 'src/shared/hooks/useScrollToFocused.ts'],
  ['src/hooks/useTruncation.ts', 'src/shared/hooks/useTruncation.ts'],
  ['src/hooks/useTypeSafeTranslations.ts', 'src/shared/hooks/useTypeSafeTranslations.ts'],
  ['src/hooks/useUpdateEffect.ts', 'src/shared/hooks/useUpdateEffect.ts'],
  ['src/hooks/useEntityNavigationContext.ts', 'src/shared/hooks/useEntityNavigationContext.ts'],
  ['src/hooks/useLinkModal.ts', 'src/shared/hooks/useLinkModal.ts'],

  // 7c: Contexts → shared/contexts (app-wide)
  ['src/contexts/SocketContext.tsx', 'src/shared/contexts/SocketContext.tsx'],
  ['src/contexts/UserContext.tsx', 'src/shared/contexts/UserContext.tsx'],
  ['src/contexts/ToastContext.tsx', 'src/shared/contexts/ToastContext.tsx'],
  ['src/contexts/ModalContext.tsx', 'src/shared/contexts/ModalContext.tsx'],
  ['src/contexts/TasksContext.tsx', 'src/shared/contexts/TasksContext.tsx'],
  ['src/contexts/CommandPaletteContext.tsx', 'src/shared/contexts/CommandPaletteContext.tsx'],
  ['src/contexts/SettingsDrawerContext.tsx', 'src/shared/contexts/SettingsDrawerContext.tsx'],
  ['src/contexts/CardSizeContext.tsx', 'src/features/library/contexts/CardSizeContext.tsx'],
  ['src/contexts/LinkModalContext.tsx', 'src/shared/contexts/LinkModalContext.tsx'],
  ['src/contexts/ComponentsCatalogContext.tsx', 'src/shared/contexts/ComponentsCatalogContext.tsx'],
];

async function run() {
  for (const [src, dest] of moves) {
    const sourceFile = project.getSourceFile(src);
    if (!sourceFile) {
      console.warn(`SKIP (not found): ${src}`);
      continue;
    }
    console.log(`Moving ${src} → ${dest}`);

    // Ensure destination directory exists in ts-morph
    const destDir = dest.substring(0, dest.lastIndexOf('/'));
    const targetDir = project.getDirectory(destDir) || project.createDirectory(destDir);
    sourceFile.moveToDirectory(targetDir);
  }

  console.log('Saving all files...');
  await project.save();
  console.log('Done: hooks + contexts relocated.');
}

run().catch(console.error);
