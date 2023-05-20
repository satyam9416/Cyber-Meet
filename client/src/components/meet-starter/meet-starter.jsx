import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSocket } from '../../providers/socket'
import './meet-starter.css'

const MeetStarter = ({ setIsJoined, setUserData }) => {

    const params = useParams()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const meetId = params.id

    const HandleJoinMeet = async (e) => {
        e.preventDefault()
        const userData = {
            name, email, meetId
        }
        setUserData(userData)
        setIsJoined(true)
    }

    return (
        <form className='join-meet-page' onSubmit={HandleJoinMeet}>
            <input type="text" name="name" placeholder='Enter Your Name' onChange={(e) => { setName(e.target.value) }} />
            <input type="email" name="email" placeholder='Enter Your Email' onChange={(e) => { setEmail(e.target.value) }} />
            <button type='submit'>Join Now</button>
        </form>
    )
}

export default MeetStarter