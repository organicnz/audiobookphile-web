'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const content = formData.get('content') as string
  if (!content || content.trim().length === 0) {
    throw new Error('Post content cannot be empty')
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error('Error creating post:', error)
    throw new Error('Could not create post')
  }

  revalidatePath('/home')
  redirect('/home')
}
