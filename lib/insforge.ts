import { createClient } from '@insforge/sdk'

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
})

export const db = insforge.database
export const auth = insforge.auth
export const storage = insforge.storage

export default insforge
