import Btn from '@/shared/ui/Btn'
import IconBtn from '@/shared/ui/IconBtn'
import TextInput from '@/shared/ui/TextInput'
import { useGlobalToast } from '@/shared/contexts/ToastContext'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { useState, useTransition } from 'react'
import { Folder, Edit3 } from 'lucide-react'
import { updateBackupPath } from './actions'

interface BackupLocationProps {
  backupLocation: string
  backupPathEnvSet: boolean
}

export default function BackupLocation({ backupLocation, backupPathEnvSet }: BackupLocationProps) {
  const t = useTypeSafeTranslations()
  const { showToast } = useGlobalToast()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editedBackupLocation, setEditedBackupLocation] = useState(backupLocation)

  const handleSave = () => {
    if (isPending) return

    const newBackupLocation = editedBackupLocation.trim()
    if (!newBackupLocation) {
      showToast(t('MessageBackupsLocationPathEmpty'), { type: 'error' })
      return
    }

    if (newBackupLocation === backupLocation) {
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      const success = await updateBackupPath(newBackupLocation)
      if (success) {
        setIsEditing(false)
        setEditedBackupLocation(newBackupLocation)
      } else {
        showToast(t('ToastFailedToUpdate'), { type: 'error' })
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedBackupLocation(backupLocation)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <Folder size={18} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
        <p className="text-white/40 text-[11px] font-black uppercase tracking-widest">{t('LabelBackupLocation')}</p>
      </div>
      {isEditing ? (
        <div>
          <div className="flex items-center gap-2">
            <TextInput value={editedBackupLocation} disabled={backupPathEnvSet} className="text-sm" onChange={(value) => setEditedBackupLocation(value)} />
            {!backupPathEnvSet && (
              <Btn size="small" color="bg-success" onClick={handleSave}>
                {t('ButtonSave')}
              </Btn>
            )}

            <Btn size="small" onClick={handleCancel}>
              {t('ButtonCancel')}
            </Btn>
          </div>
          <p className="text-foreground-subdued text-sm">{backupPathEnvSet ? t('MessageBackupsLocationNoEditNote') : t('MessageBackupsLocationEditNote')}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-foreground text-base break-all">{backupLocation}</p>
          <IconBtn
            ariaLabel={t('LabelEdit')}
            borderless
            size="small"
            className="text-white/40 hover:text-primary transition-colors cursor-pointer"
            onClick={() => {
              setIsEditing(true)
            }}
          >
            <Edit3 size={16} />
          </IconBtn>
        </div>
      )}
    </div>
  )
}
