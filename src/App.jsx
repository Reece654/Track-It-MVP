/*
  App.jsx sets up Track It routes.
  We include sign in, sign up, and /jobs as the signed in landing route with sign out (Other screens will be added in our future milestones as per our plan/proposal).
*/

import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import HomeRedirect from './pages/HomeRedirect'
import JobsPage from './pages/JobsPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import './App.css'

function App() {
  return (
    <Routes>

      {/*
        HomeRedirect handles the / path.
        A signed in user is sent to /jobs, and a signed out user is sent to /sign-in.
        This is so the home URL opens the right screen for the current session.
      */}

      <Route path="/" element={<HomeRedirect />} />

      {/*
        SignInPage and SignUpPage open on our user's first visit to Track It.
        This is so they can sign in or create an account from these URLs.
        Both screens live in the pages folder, call Supabase from the services folder, and then send our user to JobsPage.
      */}

      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/*
        ProtectedRoute checks the session before these screens are drawn.
        This is so only a signed in user reaches AppShell so they can see the header and menu.
        AppShell in the components folder keeps our header and menu around the signed in page.
        React Router then draws JobsPage from the pages folder in the space under that header when the URL is /jobs.
      */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/jobs" element={<JobsPage />} />
        </Route>
      </Route>

      {/*
        Any URL we do not recognise is sent back to /.
        HomeRedirect then chooses /jobs or /sign-in from the session.
      */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
