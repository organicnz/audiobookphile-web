import { WatchPartyTheater } from '@/features/live/ui/WatchPartyTheater'

export default function LiveWatchPartyPage({ params }: { params: { username: string } }) {
  return <WatchPartyTheater username={params.username} />
}
