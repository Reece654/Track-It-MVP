/*
  AppMenu will be the signed in menu for Track It.
*/

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
        We use handleSignOut to call signOut from useAuth, then close the menu.
      */}

      <nav className="app-menu__panel">
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
