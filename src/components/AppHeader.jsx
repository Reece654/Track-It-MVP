/*
  AppHeader is the shared top bar/header for all our Track It screens.
  We keep the logo, optional back control, and menu button in one place so every page matches our Hi-Fi layout.
*/

import { Link } from 'react-router-dom'

function AppHeader({
  showBack = false,
  backTo = '/jobs',
  showMenuButton = false,
  onMenuOpen,
}) {
  return (
    <header className="app-header">

      {/*
        Signed in screens show the hamburger here, matching our Hi-Fi.
        Sign in and sign up leave this side empty.
      */}

      <div className="app-header__side app-header__side--left">
        {showMenuButton ? (
          <button
            type="button"
            className="app-header__menu-button"
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <span className="app-header__menu-bar" />
            <span className="app-header__menu-bar" />
            <span className="app-header__menu-bar" />
          </button>
        ) : showBack ? (
          <Link className="app-header__back" to={backTo}>
            Back
          </Link>
        ) : null}
      </div>

      {/*
        The logo for Track It is Tahoma same as my Hi-Fi design.
        It links home, which sends a signed in user to jobs (landing page) and a signed out user to sign in.
      */}

      <Link className="app-header__logo" to="/">
        Track It
      </Link>

    </header>
  )
}

export default AppHeader
