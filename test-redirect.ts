import { redirect } from 'next/navigation'

try {
  redirect('/foo')
} catch (error: any) {
  console.log('Message:', error.message)
  console.log('Digest:', error.digest)
  console.log('Includes NEXT_REDIRECT?', error.digest?.includes('NEXT_REDIRECT'))
}
