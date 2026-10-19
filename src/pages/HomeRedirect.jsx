import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

// Creates the home redirect component that sends the route to the right page
function HomeRedirect() {
    // Gets the signed in user and loading state thats shared from the auth context
    const { user, authIsLoading } = useAuth()

    // Checks if the app is waiting for supabase to respond
    if (authIsLoading) {
        return (
            <main className="page page--centred">
                <p className="status-message">Loading...</p>
            </main>
        )
    }

    // Takes user to the jobs page if the user is signed in or else they will be taken to the sign in page
    return <Navigate to={user ? "/jobs" : "/sign-in"} replace />
}

// Exports the home redirect component so it can be used in other files
export default HomeRedirect