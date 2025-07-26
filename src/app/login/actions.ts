'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address').min(1, 'Email is required').max(255),
    password: z.string().min(1, 'Password is required').max(128)
})

const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address').min(1, 'Email is required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128)
})

const resetPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address').min(1, 'Email is required').max(255)
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Validate input data
    let data;
    try {
        data = loginSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        // Return error instead of redirecting so we can show it on the login page
        return { 
            error: error.message === 'Invalid login credentials' 
                ? 'Invalid email and password combination. Please check your credentials and try again.'
                : error.message
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // Validate input data
    let data;
    try {
        data = signupSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    // Validate input data
    let email;
    try {
        const result = resetPasswordSchema.parse({
            email: formData.get('email'),
        })
        email = result.email;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Password reset email sent successfully' }
}