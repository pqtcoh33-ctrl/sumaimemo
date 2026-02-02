import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth/getProfile'

export default async function LoginRedirectPage() {
  const { user, profile } = await getProfile()

  if (!user || !profile) {
    redirect('/login')
  }

  switch (profile.role) {
    case 'operator':
      redirect('/operator/dashboard')

    case 'management':
      redirect('/management/dashboard')

    case 'tenant':
      redirect('/tenant/dashboard')

    default:
      redirect('/login')
  }
}
