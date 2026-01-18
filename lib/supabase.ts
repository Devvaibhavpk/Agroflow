import { createBrowserClient } from '@supabase/ssr'
import { type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

// Browser client for client-side components
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createBrowserClient(url, key)
}

// Export a lazy singleton getter for convenience
export const supabase = (() => {
  // Only create the client when actually accessed in browser
  if (typeof window === 'undefined') {
    // During SSR/build, return a proxy that will work when accessed
    return new Proxy({} as SupabaseClient, {
      get(target, prop) {
        if (!supabaseInstance) {
          try {
            supabaseInstance = createClient()
          } catch {
            // During build, return dummy functions
            return () => Promise.resolve({ data: null, error: null })
          }
        }
        return (supabaseInstance as unknown as Record<string, unknown>)[prop as string]
      }
    })
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
})()
