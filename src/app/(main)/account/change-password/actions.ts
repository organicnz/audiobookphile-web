'use server'

import { changePassword as apiChangePassword } from '@/shared/lib/api/auth'

export async function changePassword(_oldPassword: string, newPassword: string): Promise<void> {
  await apiChangePassword(newPassword)
}
