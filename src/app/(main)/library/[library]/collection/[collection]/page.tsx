import { getCollection, getCurrentUser } from '@/lib/supabase-api';
import CollectionClient from './CollectionClient';

export default async function CollectionPage({ params }: { params: Promise<{ collection: string; library: string }> }) {
  const { collection: collectionId } = await params

  let collection, currentUser
  try {
    ;[collection, currentUser] = await Promise.all([getCollection(collectionId), getCurrentUser()])
  } catch (err) {
    console.error('Error getting collection or user data', err)
    return null
  }

  if (!collection || !currentUser) {
    console.error('Error getting collection or user data')
    return null
  }

  return (
    <div className="w-full p-8">
      <CollectionClient collection={collection as any} />
    </div>
  )
}
