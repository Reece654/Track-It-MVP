import {Navigate, Outlet} from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

// Create a protected route that makes sure the job screen is only accessible to the correct signed in user
function ProtectedRoute() {
    // Grabs the signed in user and the loading state from auth context
    const { user, authIsLoading } = useAuth()

    // Checks if the app is waiting for supabase to respond
    if (authIsLoading) {
        return (
            // displays a loading message while waiting for supabase to respond
            <main className="page page--centred">
                <p className="status-message">Loading...</p>
            </main>
        )
    }

    // Checks to see if there isnt a user signed in
    if (!user) {
        return <Navigate to="/sign-in" replace />
    }

    // If the user is signed in, render the protected content
    return <Outlet />
}

// Exports the protected route so it can be used in other files
export default ProtectedRoute