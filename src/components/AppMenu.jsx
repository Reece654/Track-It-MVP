/*
  AppMenu will be the signed in menu for Track It.
*/

/*
  import { Link } is how Your jobs and Create job move to another screen without reloading the whole page.
  Your jobs opens JobsPage at /jobs, and Create job opens CreateJobPage at /jobs/new.
  import { useAuth } is there so we can sign out from this menu the same way as the rest of Track It.
  It reads the session AuthProvider is holding, and signOut asks Supabase to end that session.
  isOpen comes from AppShell and turns true once our user presses Menu in AppHeader.
  Until then, the menu stays off the page.
  onClose also comes from AppShell, and we call it when the menu should hide.
  A press on the dimmed page does that, and so does a sign out that works.
  If sign out fails, onSignOutError carries the message back to AppShell.
  The banner shows it, and our user stays signed in.
*/

import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function AppMenu({ isOpen, onClose, onSignOutError }) {
  const { signOut } = useAuth()

  /*
    Closed menu renders nothing, so it stays off the page until Menu is pressed.
  */

  if (!isOpen) {
    return null
  }

  /*
    Sign out asks Supabase to end the session, then closes the menu.
    If that fails, the error is passed back so the page can show it.
  */

  async function handleSignOut() {
    try {
      await signOut()
      onClose()
    } catch (error) {
      onSignOutError?.(error.message || 'Could not sign out. Please try again.')
    }
  }

  return (
    <div className="app-menu" role="dialog" aria-label="Main menu">

      {/*
        Backdrop/layer will cover the rest of the page behind the menu when it is open.
        It sits behind the Sign out button for as long as the menu is open.
        A press on it closes the menu without signing out.
        We need it so a tap on the dimmed page closes the menu while the Sign out button stays clear.
      */}

      <button
        type="button"
        className="app-menu__backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />

      {/*
        Your jobs and Create job go to those pages and close the menu.
        We use handleSignOut to call signOut from useAuth, then close the menu.
      */}

      <nav className="app-menu__panel">
        <Link className="app-menu__link" to="/jobs" onClick={onClose}>
          Your jobs
        </Link>
        <Link className="app-menu__link" to="/jobs/new" onClick={onClose}>
          Create job
        </Link>
        <button
          type="button"
          className="app-menu__link app-menu__link--button"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </nav>
    </div>
  )
}

export default AppMenu
