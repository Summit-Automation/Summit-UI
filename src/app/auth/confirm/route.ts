import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

function validateRedirectUrl(url: string): string {
    // Only allow relative URLs that don't start with // to prevent open redirects
    if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
    }
    // Default to safe redirect for invalid URLs
    return '/';
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = validateRedirectUrl(searchParams.get('next') ?? '/')

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            // redirect user to specified redirect URL or root of app
            redirect(next)
        }
    }

    // redirect the user to an error page with some instructions
    redirect('/error')
}