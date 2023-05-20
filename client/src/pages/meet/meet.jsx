import React from 'react'
import { useState } from 'react'
import MeetLive from '../../components/meet-live/meet-live';
import MeetStarter from '../../components/meet-starter/meet-starter';

const MeetPage = () => {
    const [isJoined, setIsJoined] = useState(false)
    const [userData, setUserData] = useState(null)

    return isJoined ? <MeetLive userData={userData}/> : <MeetStarter setIsJoined={setIsJoined} setUserData={setUserData }/>

}

export default MeetPage