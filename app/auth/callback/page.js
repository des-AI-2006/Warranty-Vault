'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        let isHandled = false

        const handleAuthSuccess = (userId) => {
            if (isHandled) return
            isHandled = true
            const now = Date.now().toString()
            localStorage.setItem('session_start_time', now)
            if (userId) {
                localStorage.setItem(`session_start_time_${userId}`, now)
            }
            router.push('/')
        }

        // Check if session is already established
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                handleAuthSuccess(session.user.id)
            }
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session?.user) {
                handleAuthSuccess(session?.user?.id)
            }
        })

        // Fallback safety timeout if auth doesn't resolve in 6 seconds
        const timeout = setTimeout(() => {
            if (!isHandled) {
                router.push('/login')
            }
        }, 6000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-neutral-400">Completing sign in...</p>
            </div>
        </div>
    )
}
