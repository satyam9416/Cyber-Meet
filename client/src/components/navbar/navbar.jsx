import './navbar.css'
import React from 'react'

const Navbar = () => {
  return (
    <div className='nav-bar'>
        <div className="nav-logo-container" title='Cyber Meet'>
              <span className="material-symbols-outlined">
                  workspaces
              </span>
              <span>Cyber Meet</span>
        </div>
        {/* <ul className='nav-elements'>
            <li className="nav-el time" >

            </li>
              <li className="nav-el support" title='support'>
                  <span className="material-symbols-outlined">
                      help
                  </span>
            </li>
            <li className="nav-el feedback" title='feedback'>
                  <span className="material-symbols-outlined">
                      sms_failed
                  </span>
            </li>
            <li className="nav-el Settings" title='settings'>
                  <span className="material-symbols-outlined">
                      settings
                  </span>   
            </li>
            <li className="nav-el apps" title='apps'>
                  <span className="material-symbols-outlined">
                      apps
                  </span>
            </li>
            <li className="nav-el profile">
                  <img src="/profile_img.jpg" alt="" />
            </li>
        </ul> */}
    </div>
  )
}

export default Navbar