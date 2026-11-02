/*
  AppShell is the shared frame for signed in Track It screens.
  We will use it so the header and menu stay the same on every protected page.
  App.jsx puts this frame inside ProtectedRoute so only a signed-in user reaches it.
  JobsPage is then drawn in React Router's Outlet/space under the header.
*/

import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppMenu from './AppMenu'

function AppShell() {
  /*
    menuIsOpen tracks whether the sign out menu is showing.
    This is so AppMenu can open and close based on user interaction.
    signOutErrorMessage holds any failure text sent back from AppMenu.
  */

  const location = useLocation()
  const navigate = useNavigate()
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [signOutErrorMessage, setSignOutErrorMessage] = useState('')

  /*
    successToastMessage is the green banner text passed in from a save or delete that worked.
    We clear it after a short wait so it does not come back on refresh or Back.
  */

  const successToastMessage =
    typeof location.state?.successMessage === 'string' ? location.state.successMessage : ''

  useEffect(() => {
    if (!successToastMessage) {
      return undefined
    }

    const hideToastTimer = window.setTimeout(() => {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }, 4000)

    return () => {
      window.clearTimeout(hideToastTimer)
    }
  }, [successToastMessage, location.pathname, location.search, navigate])

  return (
    <div className="app-shell">

      {/*
        AppHeader draws the Track It bar and the Menu button.
        Pressing Menu sets menuIsOpen so AppMenu can open.
        This is so AppMenu can read the open state and show the menu.
        signOut from useAuth runs when our user presses the Sign out button.
        When that succeeds, the session ends and our user is taken back to the sign-in page.
      */}

      <AppHeader
        showMenuButton
        onMenuOpen={() => setMenuIsOpen(true)}
      />

      {/*
        AppMenu reads menuIsOpen and shows the Sign out button.
        Pressing Sign out runs signOut from useAuth.
        This is so our user can end the session from the menu.
        onClose then hides the menu.
        If that fails, onSignOutError stores the message for the banner below.
      */}

      <AppMenu
        isOpen={menuIsOpen}
        onClose={() => setMenuIsOpen(false)}
        onSignOutError={setSignOutErrorMessage}
      />

      {/*
        The banner shows the message AppMenu sends when sign out did not succeed.
        If Supabase has no message of its own, AppMenu sends the one we wrote: "Could not sign out. Please try again." so our user can see that they are still signed in.
        When sign out succeeds, the banner is not shown because our user is taken back to the sign in page.
      */}

      {signOutErrorMessage ? (
        <p className="form-error form-error--banner" role="alert">
          {signOutErrorMessage}
        </p>
      ) : null}

      {/* Green banner after a create, edit, or delete that worked */}
      {successToastMessage ? (
        <p className="success-toast" role="status">
          {successToastMessage}
        </p>
      ) : null}

      {/*
        React Router's Outlet is the space under the header.
        This is so the signed in page can sit inside this frame.
      */}

      <Outlet />
    </div>
  )
}

export default AppShell