import {useState} from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useAuth } from '../context/useAuth.js'
import {supabase} from '../services/supabase'

// Creates the sign in page 
function SignInPage() {
    // Gets navigate function to redirect the user after signing in
    const navigate = useNavigate()
    // Gets the signed in users data and loading state from auth context
    const {user, authIsLoading } = useAuth()
    // Holds what the user enters for the email field
    const [email, setEmail] = useState('')
    // Holds what the user enters for the password field
    const [password, setPassword] = useState('')
    // Holds the error message for signing in if required
    const [formErrorMessage, setFormErrorMessage] = useState('')
    // Checks if the form is being sent, which then stops the button being pressed again
    const [formIsSubmitting, setFormIsSubmitting] = useState(false)

    // Shows a loading message while supabase is still checking the session
    if (authIsLoading) {
        return (
            <main className="page page--centred">
                <p className="status-message">Loading...</p>
            </main>
        )
    }

    // Checks to see if the user is signed in
    if (user) {
        return <Navigate to="/jobs" replace />
    }

    // Handles the form submission for signing in
    async function handleSubmit(event) {
        // Prevents the default form submission
        event.preventDefault()
        // Resets the error message
        setFormErrorMessage('')
        // Sets the form submitting sate
        setFormIsSubmitting(true)

        // Calls supabase to sign in with the provided email and password
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })  

        // Resets the form submitting state
        setFormIsSubmitting(false)
        // Checks if supabase sent an error back
        if (error) {
            // Displays generic error message, not letting the user know if its the email or password
            setFormErrorMessage('Incorrect email or password')
            return
        }
        
        // Sends user to jobs page after signed in
        navigate('/jobs', { replace: true })
    }

    // UI for the sign in page 
    return (
        <div className="app-shell">
            {/* Displays the app header */}
            <AppHeader />
            <main className="page">
                {/* Displays the page heading */}
                <h1 className="page-title">Sign In</h1>
                {/* Displays the sign in form with email and password fields, error messages, and a submit button */}
                <form className="auth-form" onSubmit={handleSubmit}>
                       <label className="field">
                        <span className="field__label">
                            Email <span className="field__required">*</span>
                    </span>
                    {/* Input field for the user's email */}
                    <input
                        className="field__input"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </label>

                {/* Input field for the users password */}
                <label className="field">
                    <span className="field__label">
                        Password <span className="field__required">*</span>
                    </span>
                    <input
                        className="field__input"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </label>

                {/* Display an error message if needed */}
                {formErrorMessage ? (
                    <p className="form-error" role="alert">    
                        {formErrorMessage}
                    </p>
                ) : null}

                {/* Button for submitting the form which is disabled while the form is activitly sending */}
                <button
                    className="button button--primary"
                    type="submit"
                    disabled={formIsSubmitting}
                >
                    {formIsSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* Link to the sign up page */}
            <p className="auth-switch">
                Don't have an account? <Link to="/sign-up">Sign Up</Link>
            </p>
        </main>     
    </div>
    )
}

// Lets the sign in page be used in other files
export default SignInPage