import './home.css'
import React, { useState } from 'react'
import Navbar from '../../components/navbar/navbar'
import HomeSlider from '../../components/home-slider/home-slider'
import { useNavigate } from 'react-router-dom'
import API from '../../api/api'

const HomePage = () => {
    const [newMeetOp, setNewMeetOp] = useState(false)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const getNewMeetingLink = async() => {
        const {data} = await API.get('create-new-meet')
        return `/meet/${data.meetId}`
    }

    const handleStartInstantMeet = async() => {
        setLoading(true)
        const newMeetlink = await getNewMeetingLink()
        navigate(newMeetlink)
    }

    return (
        <div className='home-page'>
            {loading ? <div className='loading-overlay'></div> : null}
            <Navbar />
            <main className='home-main-section'>
                <div className='main-left-side'>
                    <h3>Premium video meetings.
                        Now free for everyone.</h3>
                    <p className='desc-text'>I re-engineered the service built for secure business meetings, Cyber Meet, to make it free and available for all.</p>
                    <div>

                        <button className='new-meeting-btn' onClick={() => setNewMeetOp(true)} onBlur={() => setNewMeetOp(false)}>
                            <span className="material-symbols-outlined">
                                atr
                            </span>
                            New Meeting
                            {newMeetOp ? <ul className='new-meeting-options-box'>
                                <li className="new-meet-option">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>
                                    create a meeting for later
                                </li>
                                <li className="new-meet-option" onClick={handleStartInstantMeet}>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
                                    Start an instant meeting
                                </li>
                            </ul> : null}
                        </button>
                        <div>
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19,10H17V8H19M19,13H17V11H19M16,10H14V8H16M16,13H14V11H16M16,17H8V15H16M7,10H5V8H7M7,13H5V11H7M8,11H10V13H8M8,8H10V10H8M11,11H13V13H11M11,8H13V10H11M20,5H4C2.89,5 2,5.89 2,7V17A2,2 0 0,0 4,19H20A2,2 0 0,0 22,17V7C22,5.89 21.1,5 20,5Z" /></svg>
                            <input type="url" placeholder='Enter a code or link' />
                        </div>
                    </div>
                    {/* <p><a href="">Learn more </a>about Cyber Meet</p> */}
                </div>
                <div className='right-side'>
                    <HomeSlider />
                </div>
            </main>
        </div>
    )
}

export default HomePage