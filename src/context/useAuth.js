// Helper function to access the shared auth context that shares the current user and auth functions

import { useContext } from "react";
import { AuthContext } from "./auth-context";

// Hook to access the auth context that returns the current user and authentication functions for other files to be allowed to use
export function useAuth() {
    const authContext = useContext(AuthContext);
    if (!authContext) {
        // Gives an error if used outside of AuthProvider
        throw new Error("useAuth must be used within an AuthProvider")
    }
    // Returns context
    return authContext;
}