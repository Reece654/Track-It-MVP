/*
  AppShell is the shared frame for signed in Track It screens.
  We will use it so the header and menu stay the same on every protected page.
  App.jsx puts this frame inside ProtectedRoute so only a signed-in user reaches it.
  JobsPage is then drawn in React Router's Outlet/space under the header.
*/

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppMenu from './AppMenu'

function AppShell() {
  /*
    menuIsOpen tracks whether the sign out menu is showing.
    This is so AppMenu can open and close based on user interaction.
    signOutErrorMessage holds any failure text sent back from AppMenu.
  */

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [signOutErrorMessage, setSignOutErrorMessage] = useState('')

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

      {/*
        React Router's Outlet is the space under the header.
        This is so the signed in page can sit inside this frame.
      */}

      <Outlet />
    </div>
  )
}

export default AppShell
