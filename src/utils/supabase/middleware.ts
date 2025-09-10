import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Public routes that don't need authentication
    const publicRoutes = ['/login', '/signup', '/auth']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (!user && !isPublicRoute) {
        // no user, redirect to login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is authenticated, check permissions for protected routes
    if (user && !isPublicRoute) {
        const pathname = request.nextUrl.pathname

        // Map routes to permission names
        const routePermissions: { [key: string]: string } = {
            '/': 'dashboard',
            '/crm': 'crm', 
            '/bookkeeper': 'bookkeeper',
            '/mileage': 'mileage',
            '/inventory': 'inventory',
            '/leadgen': 'leadgen',
            '/project-manager': 'project_manager',
            '/settings': 'dashboard' // settings accessible to dashboard users
        }

        // Check if this is a protected route
        const requiredPermission = routePermissions[pathname]
        
        if (requiredPermission) {
            try {
                // Get user's organization ID
                const organizationId = user.user_metadata?.organization_id
                if (!organizationId) {
                    console.log('No organization ID found for user:', user.id)
                    const url = request.nextUrl.clone()
                    url.pathname = '/login'
                    return NextResponse.redirect(url)
                }

                console.log(`Checking permissions for user ${user.id} on route ${pathname} (requires ${requiredPermission})`)

                // Special case: project_manager has default access for all org members
                if (requiredPermission === 'project_manager') {
                    console.log('Project manager route - allowing default access')
                    // Allow project manager access by default for org members
                    // Only block if explicitly denied in database
                    try {
                        const { data: permissions } = await supabase
                            .from('user_permissions')
                            .select('granted')
                            .eq('user_id', user.id)
                            .eq('organization_id', organizationId)
                            .eq('permission_name', 'project_manager')
                            .single()

                        // Only block if permission exists and is explicitly denied
                        if (permissions && permissions.granted === false) {
                            console.log('Project manager access explicitly denied')
                            const url = request.nextUrl.clone()
                            url.pathname = '/project-manager' // Don't redirect to dashboard to avoid loops
                            return NextResponse.redirect(url)
                        }
                    } catch (permError: unknown) {
                        console.log('No specific project manager permission found - allowing default access', permError)
                    }
                    // Otherwise allow access (default behavior)
                    return supabaseResponse
                }

                // For other routes, check explicit permissions
                const { data: permissions, error } = await supabase
                    .from('user_permissions')
                    .select('granted')
                    .eq('user_id', user.id)
                    .eq('organization_id', organizationId)
                    .eq('permission_name', requiredPermission)
                    .single()

                console.log(`Permission check result:`, { error: error?.code, granted: permissions?.granted })

                // If no permission found or not granted
                if (error || !permissions?.granted) {
                    console.log(`No permission found for ${requiredPermission}, redirecting...`)
                    
                    // Special handling for dashboard - it's the fallback
                    if (requiredPermission === 'dashboard') {
                        // If no dashboard permission, redirect to project manager as safe default
                        console.log('Dashboard access denied, redirecting to project manager')
                        const url = request.nextUrl.clone()
                        url.pathname = '/project-manager'
                        return NextResponse.redirect(url)
                    } else {
                        // For non-dashboard routes, check if user has dashboard access as fallback
                        try {
                            const { data: dashboardPermission } = await supabase
                                .from('user_permissions')
                                .select('granted')
                                .eq('user_id', user.id)
                                .eq('organization_id', organizationId)
                                .eq('permission_name', 'dashboard')
                                .single()

                            const url = request.nextUrl.clone()
                            if (dashboardPermission?.granted) {
                                console.log('Redirecting to dashboard')
                                url.pathname = '/' // redirect to dashboard
                            } else {
                                // No dashboard access, redirect to project manager (default)
                                console.log('No dashboard access, redirecting to project manager')
                                url.pathname = '/project-manager'
                            }
                            return NextResponse.redirect(url)
                        } catch (dashError: unknown) {
                            // If dashboard check fails, default to project manager
                            console.log('Dashboard permission check failed, defaulting to project manager', dashError)
                            const url = request.nextUrl.clone()
                            url.pathname = '/project-manager'
                            return NextResponse.redirect(url)
                        }
                    }
                }
            } catch (error) {
                console.error('Permission check error:', error)
                // On permission check error, redirect to project manager as safe default
                // But avoid redirect loops - if we're already on project-manager, allow access
                if (pathname !== '/project-manager') {
                    const url = request.nextUrl.clone()
                    url.pathname = '/project-manager'
                    return NextResponse.redirect(url)
                }
                // If we're on project-manager and there's an error, allow access
                return supabaseResponse
            }
        }
    }

    return supabaseResponse
}