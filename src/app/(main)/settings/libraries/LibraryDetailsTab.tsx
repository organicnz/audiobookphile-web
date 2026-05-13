'use client'

import Btn from '@/components/ui/Btn'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import MediaIconPicker from '@/components/ui/MediaIconPicker'
import TextInput from '@/components/ui/TextInput'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { Folder, FolderPlus, X } from 'lucide-react'
import { LibraryFormData } from './LibraryEditModal'
import LibraryFolderChooser from './LibraryFolderChooser'

const mediaTypeItems: DropdownItem[] = [
  { text: 'Books', value: 'book' },
  { text: 'Podcasts', value: 'podcast' }
]

interface LibraryDetailsTabProps {
  formData: LibraryFormData
  isEditing: boolean
  providerItems: DropdownItem[]
  newFolderPath: string
  showFolderChooser: boolean
  onFormDataChange: (updater: (prev: LibraryFormData) => LibraryFormData) => void
  onMediaTypeChange: (value: string | number) => void
  onNewFolderPathChange: (value: string) => void
  onCommitNewFolder: () => void
  onNewFolderKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveFolder: (index: number) => void
  onFolderSelected: (folderPath: string) => void
  onShowFolderChooser: () => void
  onHideFolderChooser: () => void
}

export default function LibraryDetailsTab({
  formData,
  isEditing,
  providerItems,
  newFolderPath,
  showFolderChooser,
  onFormDataChange,
  onMediaTypeChange,
  onNewFolderPathChange,
  onCommitNewFolder,
  onNewFolderKeyDown,
  onRemoveFolder,
  onFolderSelected,
  onShowFolderChooser,
  onHideFolderChooser
}: LibraryDetailsTabProps) {
  const t = useTypeSafeTranslations()

  return (
    <>
      {/* Top Row: Media Type, Library Name, Icon, Metadata Provider */}
      <div className="flex flex-wrap items-start gap-2">
        {/* Media Type */}
        <Dropdown
          label={t('LabelMediaType')}
          value={formData.mediaType}
          items={mediaTypeItems}
          disabled={isEditing}
          highlightSelected
          onChange={onMediaTypeChange}
          className="w-full shrink-0 sm:w-36"
        />

        {/* Library Name */}
        <TextInput
          label={t('LabelLibraryName')}
          value={formData.name}
          placeholder={t('LabelLibraryName')}
          onChange={(value) => onFormDataChange((prev) => ({ ...prev, name: value }))}
          className="w-full sm:flex-1"
        />

        {/* Icon */}
        <MediaIconPicker value={formData.icon} label={t('LabelIcon')} onChange={(value) => onFormDataChange((prev) => ({ ...prev, icon: value }))} />

        {/* Metadata Provider */}
        <Dropdown
          label={t('LabelMetadataProvider')}
          value={formData.provider}
          items={providerItems}
          highlightSelected
          onChange={(value) => onFormDataChange((prev) => ({ ...prev, provider: String(value) }))}
          className="flex-1 sm:w-44 sm:shrink-0"
        />
      </div>

      {/* Folders Section */}
      <div className="mt-8">
        <h3 className="text-white/40 mb-3 text-[10px] font-black uppercase tracking-widest">{t('LabelFolders')}</h3>

        <div className="space-y-3">
          {/* Committed folder paths */}
          {formData.folders.map((folder, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm group hover:border-white/20 transition-all">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/20">
                <Folder size={18} className="text-primary fill-current" />
              </div>
              <TextInput value={folder.fullPath} readOnly borderless className="flex-1 text-sm font-medium text-white/80" />
              <button
                type="button"
                className="p-2 text-white/20 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                onClick={() => onRemoveFolder(index)}
                aria-label={t('ButtonRemove')}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {/* Always-visible new folder input */}
          <div className="flex items-center gap-3 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-dashed border-white/10 hover:border-white/20 transition-all">
            <div className="bg-success/20 p-2 rounded-xl border border-success/20">
              <FolderPlus size={18} className="text-success fill-current" />
            </div>
            <TextInput
              value={newFolderPath}
              placeholder={t('PlaceholderNewFolderPath')}
              onChange={onNewFolderPathChange}
              onBlur={onCommitNewFolder}
              onKeyDown={onNewFolderKeyDown}
              borderless
              className="flex-1 text-sm"
            />
          </div>
        </div>

        {/* Browse for Folder button */}
        <Btn color="bg-primary" className="mt-4 w-full shadow-lg shadow-primary/10 uppercase font-black tracking-widest text-[11px] h-11" onClick={onShowFolderChooser}>
          {t('ButtonBrowseForFolder')}
        </Btn>
      </div>

      {/* Folder Chooser Overlay */}
      {showFolderChooser && <LibraryFolderChooser paths={formData.folders.map((f) => f.fullPath)} onSelect={onFolderSelected} onBack={onHideFolderChooser} />}
    </>
  )
}
