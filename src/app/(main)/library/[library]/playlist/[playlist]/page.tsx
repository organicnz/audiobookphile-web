import { getCurrentUser, getPlaylist } from '@/lib/api';
import PlaylistClient from './PlaylistClient';

export default async function PlaylistPage({ params }: { params: Promise<{ playlist: string; library: string }> }) {
  const { playlist: playlistId } = await params

  let playlist, currentUser
  try {
    ;[playlist, currentUser] = await Promise.all([getPlaylist(playlistId), getCurrentUser()])
  } catch (err) {
    console.error('Error getting playlist or user data', err)
    return null
  }

  if (!playlist || !currentUser) {
    console.error('Error getting playlist or user data')
    return null
  }

  return (
    <div className="w-full p-8">
      <PlaylistClient playlist={playlist as any} />
    </div>
  )
}
