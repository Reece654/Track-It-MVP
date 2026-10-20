/*
  main.jsx starts the React app and wraps around it with routing and Auth.
  We load index.css here so the Hi-Fi colours and Tahoma apply to every screen.
  BrowserRouter keeps URLs in sync with our screens.
  AuthProvider shares the Supabase session across every page.
*/

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

/*
  createRoot places the app into the root div in index.html.
  This is so React can draw our screens inside that empty element.
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>

    {/*
      BrowserRouter keeps the page URL in step with the routes in App.jsx.
      This is so /sign-in, /sign-up, and /jobs each open the matching screen.
    */}

    <BrowserRouter>

      {/*
        AuthProvider holds the Supabase session for the whole app.
        This is so every screen can read the current user and call signOut.
      */}

      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
