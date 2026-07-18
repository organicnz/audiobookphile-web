import { NeighborhoodFeed } from '@/features/communities/ui/NeighborhoodFeed'

export default function NeighborhoodPage() {
  // In a real app, we would fetch the user's verified zip code from Supabase
  // and pass it to the component.
  return <NeighborhoodFeed userZipCode="90210" />
}
