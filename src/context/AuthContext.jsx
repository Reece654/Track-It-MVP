import { useState, useEffect } from "react"
import { supabase } from "../services/supabase"
import { AuthContext } from "./auth-context"

// Creates provider component to wrap and then call it children that then need to access the auth context
export function AuthProvider({ children }) {
    // Stores the current supabase session, starts with null and will be updated
    const [session, setSession] = useState(null)
    // Checks to see if the app is still waiting  for supabase to respond
    const [authIsLoading, setAuthIsLoading] = useState(true)

    // Checks to see if the user is signed in, then updates
    useEffect(() => {
        // Let is used so it can be updated later
        let isMounted = true
    
    // Checks with supabase if a user is signed in
    supabase.auth.getSession().then(({ data }) => {
        // If unmounted it stops
        if (!isMounted) {
            return
        }

        // Updates the session with the one supabase returned or enters it as null
        setSession(data.session)
        // Sets the loading to finished so the rest of the app can continue
        setAuthIsLoading(false)
    })

    // Starts listening for changes like signing in or out
    const {
        // subscription is used to stop listening when its unmounted
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {

        setSession(nextSession)
        setAuthIsLoading(false)
    })

    // Cleans up the subscription when the component is unmounted
    return () => {
        // Mounted disconnects the subscription and will ignore any updates
        isMounted = false
        // Stops the listening for auth changes
        subscription.unsubscribe()
    }

}, [])

// Signs the user out
async function signOut() {
    // Gets supabase to end the session
    const { error } = await supabase.auth.signOut()
    // Gives error if sign out failed
    if (error) {
        throw error
    }
}


return (
    // AuthContext.Provider is a component that lets the children have access the context values
    <AuthContext.Provider 
        value={{ 
            // Gives the screen the signed in users data to display, if no one signed in return null
            user: session?.user ?? null, 
            // Lets the screen know if its still waiting for supabases response
            authIsLoading, 
            // Give the screen power to sign a user out
            signOut 
        }}
    >   
        {children}
    </AuthContext.Provider>
    )
}


