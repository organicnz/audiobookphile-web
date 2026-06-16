import ToggleSwitch from '@/shared/ui/ToggleSwitch'
import Tooltip from '@/shared/ui/Tooltip'
import { Info } from 'lucide-react'

interface SettingsToggleSwitchProps {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  tooltip?: string
}

export default function SettingsToggleSwitch(props: SettingsToggleSwitchProps) {
  return (
    <div className="flex items-center">
      <ToggleSwitch label={props.label} className="pr-0" value={props.value} onChange={props.onChange} disabled={props.disabled ?? false} />
      {props.tooltip && (
        <Tooltip text={props.tooltip} position="right" maxWidth={300} addTabIndex={true}>
          <div className="text-foreground/40 flex cursor-default items-center justify-center transition-colors hover:text-white">
            <Info size={16} strokeWidth={2.5} />
          </div>
        </Tooltip>
      )}
    </div>
  )
}
