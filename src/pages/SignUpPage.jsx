import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { maxTextLength, minPasswordLength } from '../constants'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabase'

// Creates the sign up page
function SignUpPage() {
    // Gets navigate function to redirect the user after signing up
    const navigate = useNavigate()
    // Reads the current user and loading state from the shared auth context
    const { user, authIsLoading } = useAuth()
    // Holds what the user enters for the first name field
    const [firstName, setFirstName] = useState('')
    // Holds what the user enters for the last name field
    const [lastName, setLastName] = useState('')
    // Holds what the user enters for the optional phone number field
    const [phoneNumber, setPhoneNumber] = useState('')
    // Stores the email typed into the sign up form
    const [email, setEmail] = useState('')
    // Stores the password typed into the sign up form
    const [password, setPassword] = useState('')
    // Holds the error message for signing up if required
    const [formErrorMessage, setFormErrorMessage] = useState('')
    // Tracks whether sign up is already being sent, so the button cannot be pressed again
    const [formIsSubmitting, setFormIsSubmitting] = useState(false)

    // Checks if supabase is still loading before the sign up form is shown
    if (authIsLoading) {
        return (
            <main className="page page--centred">
                <p className="status-message">Loading...</p>
            </main>
        )
    }

    // Checks to see if the user is already signed in
    if (user) {
        return <Navigate to="/jobs" replace />
    }

    // Handles the form submission for signing up
    async function handleSubmit(event) {
        // Stops the browser submitting the form so sign up is handled here
        // Also stops the browser reloading the page so the app can handle the signup instead
        event.preventDefault()
        // Clears any previous sign up error before trying again
        setFormErrorMessage('')

        // Trims extra spaces from the start and end of each field
        const trimmedFirstName = firstName.trim()
        const trimmedLastName = lastName.trim()
        const trimmedPhoneNumber = phoneNumber.trim()
        const trimmedEmail = email.trim()

        // Checks that the first name and last name filled in
        if (!trimmedFirstName || !trimmedLastName) {
            setFormErrorMessage('First name and last name are required.')
            return
        }

        // Checks if the password is as long as the min password length or longer
        if (password.length < minPasswordLength) {
            setFormErrorMessage(
                `Password must be at least ${minPasswordLength} characters.`,
            )
            return
        }

        // Sets the form to (true) subbmiting state
        setFormIsSubmitting(true)

        // Calls supabase to create the account
        // Await pauses the function untill supabase replies 
        // Await only works becuase we have used a async function for handleSubmit
        const { data, error } = await supabase.auth.signUp({
            // User entry for email with extra spaces trimmed
            email: trimmedEmail,
            // Users passwor
            password,
            // Holds extra info sent since supabase only hold email and password
            options: {
                // This is stored as metadata that the profile trigger can read to create the matching row in theprofiles table in supabase
                data: {
                    // All entries are trimmed and have max text length
                    first_name: trimmedFirstName.slice(0, maxTextLength),
                    last_name: trimmedLastName.slice(0, maxTextLength),
                    phone_number: trimmedPhoneNumber
                        // Can be left empty aand will send an empty string
                        ? trimmedPhoneNumber.slice(0, maxTextLength)
                        : '',
                },
            },
        })

        // Turns the submitting state off once supabase has replied
        setFormIsSubmitting(false)

        // Checks if supabase sent back an error
        if (error) {
            // Uses supabase error that is sent back or our message if we recive no error message
            setFormErrorMessage(error.message || 'Could not create this account.')
            return
        }

        // Checks if supabase signed the new user in
        if (!data.session) {
            // Error message if it fails to sign the user in
            setFormErrorMessage('Could not finish sign up. Try again.')
            return
        }

        // Sends the user to the jobs page after signing up
        navigate('/jobs', { replace: true })
    }

    // UI for the sign up page
    return (
        <div className="app-shell">
            {/* Shows the Track It header above the sign up form */}
            <AppHeader />
            <main className="page">
                {/* Shows the Sign Up heading */}
                <h1 className="page-title">Sign Up</h1>
                {/* Displays the sign up form with name, phone, email and password fields, error messages, and thr submit button */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* Input field for the users first name */}
                    <label className="field">
                        <span className="field__label">
                            First name <span className="field__required">*</span>
                        </span>
                        <input
                            className="field__input"
                            type="text"
                            name="firstName"
                            autoComplete="given-name"
                            maxLength={maxTextLength}
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            required
                        />
                    </label>

                    {/* Input field for the users last name */}
                    <label className="field">
                        <span className="field__label">
                            Last name <span className="field__required">*</span>
                        </span>
                        <input
                            className="field__input"
                            type="text"
                            name="lastName"
                            autoComplete="family-name"
                            maxLength={maxTextLength}
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            required
                        />
                    </label>

                    {/* Input field for the users phone number, optional */}
                    <label className="field">
                        <span className="field__label">Phone number</span>
                        <input
                            className="field__input"
                            type="tel"
                            name="phoneNumber"
                            autoComplete="tel"
                            maxLength={maxTextLength}
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                        />
                    </label>

                    {/* Input field for the users email */}
                    <label className="field">
                        <span className="field__label">
                            Email <span className="field__required">*</span>
                        </span>
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

                    {/* Input field for the users password that shows the minimum length */}
                    <label className="field">
                        <span className="field__label">
                            Password <span className="field__required">*</span>
                        </span>
                        <input
                            className="field__input"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            minLength={minPasswordLength}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <span className="field__hint">
                            Password must be at least {minPasswordLength} characters.
                        </span>
                    </label>

                    {/* Shows the sign up error when there is one */}
                    {formErrorMessage ? (
                        <p className="form-error" role="alert">
                            {formErrorMessage}
                        </p>
                    ) : null}

                    {/* Button for submitting the form which is disabled while the form is actively sending */}
                    <button
                        className="button button--primary"
                        type="submit"
                        disabled={formIsSubmitting}
                    >
                        {formIsSubmitting ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Link to the sign in page */}
                <p className="auth-switch">
                    Already have an account? <Link to="/sign-in">Sign In</Link>
                </p>
            </main>
        </div>
    )
}

// Lets the sign up page be used in other files
export default SignUpPage