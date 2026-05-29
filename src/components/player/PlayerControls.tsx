import { 
  SkipBack, 
  RotateCcw, 
  Pause, 
  Play, 
  RotateCw, 
  SkipForward, 
  List, 
  Settings2 
} from 'lucide-react'
import type { UsePlayerHandlerReturn } from '@/hooks/usePlayerHandler'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { PlayerState } from '@/types/api'
import { useState } from 'react'
import IconBtn from '../ui/IconBtn'
import Tooltip from '../ui/Tooltip'
import ChaptersModal from './ChaptersModal'
import PlaybackRateWidget from './PlaybackRateWidget'
import PlayerSettingsModal from './PlayerSettingsModal'
import SleepTimerWidget from './SleepTimerWidget'
import VolumeControl from './VolumeControl'

interface PlayerControlsProps {
  playerHandler: UsePlayerHandlerReturn
}

export default function PlayerControls({ playerHandler }: PlayerControlsProps) {
  const t = useTypeSafeTranslations()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isChaptersModalOpen, setIsChaptersModalOpen] = useState(false)
  const { jumpBackward, jumpForward, playPause, seek } = playerHandler.controls
  const { nextChapter, previousChapter, currentChapter, playerState, currentTime, settings, chapters } = playerHandler.state

  const isPlaying = playerState === PlayerState.PLAYING
  const isLoading = playerState === PlayerState.LOADING

  const getJumpTooltipText = (prefix: string, jumpTime: number) => {
    const timeText = jumpTime <= 60 ? t('LabelTimeDurationXSeconds', { 0: jumpTime }) : t('LabelTimeDurationXMinutes', { 0: jumpTime / 60 })
    return `${prefix} - ${timeText}`
  }

  const jumpBackwardTooltipText = getJumpTooltipText(t('ButtonJumpBackward'), settings.jumpBackwardAmount)
  const jumpForwardTooltipText = getJumpTooltipText(t('ButtonJumpForward'), settings.jumpForwardAmount)

  const handleNextChapter = () => {
    if (nextChapter) {
      seek(nextChapter.start)
    }
  }

  const handlePreviousChapter = () => {
    if (previousChapter) {
      const currentChapterStart = currentChapter?.start ?? 0
      const timeInCurrentChapter = currentTime - currentChapterStart
      if (timeInCurrentChapter <= 3) {
        seek(previousChapter.start)
      } else {
        seek(currentChapterStart)
      }
    } else {
      seek(0)
    }
  }

  return (
    <>
      <div className="mt-8 flex items-center w-full max-w-4xl mx-auto px-4 lg:mt-4">
        {/* Left section: Optional info/spacer */}
        <div className="hidden lg:flex flex-1" />

        {/* Center - playback controls */}
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-6">
          {/* previous chapter */}
          <Tooltip text={t('ButtonPreviousChapter')} position="top">
            <IconBtn 
              borderless 
              size="custom" 
              className="p-2 text-foreground/60 hover:text-foreground" 
              onClick={handlePreviousChapter}
              icon={SkipBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.9 }}
            />
          </Tooltip>

          {/* jump backward */}
          <Tooltip text={jumpBackwardTooltipText} position="top">
            <div className="relative group">
              <IconBtn 
                borderless 
                size="custom" 
                className="p-2 text-foreground/80 hover:text-foreground" 
                onClick={jumpBackward}
                icon={RotateCcw}
                whileHover={{ rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              />
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-[8px] font-bold mt-0.5 opacity-60 group-hover:opacity-100">
                {settings.jumpBackwardAmount}
              </span>
            </div>
          </Tooltip>

          {/* play/pause */}
          <div className="relative">
            <IconBtn
              borderless
              size="custom"
              loading={isLoading}
              outlined={false}
              className="bg-foreground text-background hover:bg-foreground/90 h-14 w-14 sm:h-16 sm:w-16 shadow-xl"
              onClick={playPause}
              icon={isPlaying ? Pause : Play}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              iconClass={isPlaying ? "" : "ml-1"}
            />
          </div>

          {/* jump forward */}
          <Tooltip text={jumpForwardTooltipText} position="top">
            <div className="relative group">
              <IconBtn 
                borderless 
                size="custom" 
                className="p-2 text-foreground/80 hover:text-foreground" 
                onClick={jumpForward}
                icon={RotateCw}
                whileHover={{ rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              />
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-[8px] font-bold mt-0.5 opacity-60 group-hover:opacity-100">
                {settings.jumpForwardAmount}
              </span>
            </div>
          </Tooltip>

          {/* next chapter */}
          <Tooltip text={t('ButtonNextChapter')} position="top">
            <IconBtn 
              borderless 
              size="custom" 
              className="p-2 text-foreground/60 hover:text-foreground" 
              onClick={handleNextChapter}
              icon={SkipForward}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.9 }}
            />
          </Tooltip>
        </div>

        {/* Right section: Widgets & Settings */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-4">
          {/* volume control */}
          <div className="hidden sm:block">
            <VolumeControl playerHandler={playerHandler} />
          </div>
          
          {/* playback rate widget */}
          <PlaybackRateWidget playerHandler={playerHandler} />

          {/* sleep timer widget */}
          <SleepTimerWidget playerHandler={playerHandler} />

          {/* chapters button */}
          {chapters.length > 0 && (
            <Tooltip text={t('LabelViewChapters')} position="top">
              <IconBtn 
                size="custom" 
                borderless 
                className="p-2 text-foreground/60 hover:text-foreground" 
                onClick={() => setIsChaptersModalOpen(true)} 
                ariaLabel={t('LabelViewChapters')}
                icon={List}
              />
            </Tooltip>
          )}

          {/* player settings button */}
          <Tooltip text={t('LabelViewPlayerSettings')} position="top">
            <IconBtn 
              size="custom" 
              borderless 
              className="p-2 text-foreground/60 hover:text-foreground" 
              onClick={() => setIsSettingsModalOpen(true)} 
              ariaLabel={t('LabelViewPlayerSettings')}
              icon={Settings2}
              whileHover={{ rotate: 30 }}
            />
          </Tooltip>
        </div>
      </div>

      <PlayerSettingsModal
        isOpen={isSettingsModalOpen}
        settings={playerHandler.state.settings}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={playerHandler.controls.updateSettings}
      />
      <ChaptersModal isOpen={isChaptersModalOpen} playerHandler={playerHandler} onClose={() => setIsChaptersModalOpen(false)} />
    </>
  )
}
