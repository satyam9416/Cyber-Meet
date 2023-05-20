import './meet-live.css'
import React, { useCallback, useMemo } from 'react'
import { useState } from 'react'
// import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
// import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ClosedCaptionOutlinedIcon from '@mui/icons-material/ClosedCaptionOutlined';
import ClosedCaptionRoundedIcon from '@mui/icons-material/ClosedCaptionRounded';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import PanToolRoundedIcon from '@mui/icons-material/PanToolRounded';
import PresentToAllRoundedIcon from '@mui/icons-material/PresentToAllRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
// import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
// import LockPersonRoundedIcon from '@mui/icons-material/LockPersonRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
// import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSocket } from '../../providers/socket';
import API from '../../api/api';
import { useWebRTC } from '../../providers/webRTC';
import ParticipantBox from '../participant-box/participant-box';

const MeetLive = ({ userData }) => {
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const { getSocket } = useSocket()
    const [participants, setParticipants] = useState([])
    const navigate = useNavigate()
    const meetId = params.id
    const { createPeer, createOffer } = useWebRTC()
    const [remoteStreams, setRemoteStreams] = useState({})
    const [localStream, setLocalStream] = useState()
    const consumers = {}
    const localPeer = useMemo(createPeer, [])
    const socket = useMemo(getSocket, [])

    const [actions, setActions] = useState({
        micOn: true,
        videoOn: true,
        presenting: false,
        captionOn: false,
        handRaised: false,
        participantsListOpen: false,
        messagesSidebarOpen: false,
        detailsSidebarOpen: false,
        activitiesSidebarOpen: false,
        hostControlsSidebarOpen: false,
        detailesPopupActive: false
    })

    const userMediaconstraint = {
        audio: true,
        video: true
    }

    useEffect(() => {
        connect()
        socket.on('joined-meet', handleMeetJoined)
        socket.on('new-member-joined', handleNewMember)
        socket.on('consume', handleConsume)
        socket.on('member-left', handleMemberLeft)
        socket.on('stream-updated', handleStreamUpdate)

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
            socket.off('joined-meet', handleMeetJoined)
            socket.off('new-member-joined', handleNewMember)
            socket.off('consume', handleConsume)
            socket.off('member-left', handleMemberLeft)
            socket.disconnect()
        }
    }, [])

    const connect = useCallback(async () => {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(userMediaconstraint)
        } catch (error) {
            console.log('cannot get media !!!')
        }
        setLocalStream(stream)
        stream.getTracks().forEach(track => localPeer.addTrack(track, stream));
        const offer = await createOffer(localPeer)
        socket.emit('join-meet', { userData, offer })
        localPeer.onicecandidate = ({ candidate }) => {
            socket.emit('ice-candidate', candidate)
        }
        setLoading(false)
    })

    const getRemoteStreams = useCallback(async id => {
        const peer = createPeer()
        await peer.addTransceiver('video', { direction: "recvonly" })
        await peer.addTransceiver('audio', { direction: "recvonly" })
        await createOffer(peer)
        peer.ontrack = e => {
            if (e.streams && e.streams[0]) {
                setRemoteStreams(prev => {
                    prev[id] = e.streams[0]
                    return { ...prev }
                })
            }
        }
        socket.emit('consume', { offer: peer.localDescription, socketId: id })
        peer.onicecandidate = ({ candidate }) => {
            socket.emit('consumer-ice', { ice: candidate, socketId: id })
        }
        consumers[id] = peer
    }, [])

    const handleMeetJoined = useCallback(({ ans, members }) => {
        localPeer.setRemoteDescription(ans)
        if(members[0].socketId !== socket.id){
            const index = members.findIndex(el => el.socketId === socket.id)
            const temp = members[index]
            for(let i = index; i > 0; i--){
                members[i] = members[i-1]
            }
            members[0] = temp
        }
        setParticipants(members)
        members.map(async (m) => {
            if (m.socketId !== socket.id) {
                await getRemoteStreams(m.socketId)``
            }
        })
    }, [])

    const handleConsume = useCallback(async ({ ans, socketId }) => {
        consumers[socketId].setRemoteDescription(ans)
    }, [])

    const handleNewMember = useCallback(async member => {
        getRemoteStreams(member.socketId)
        setParticipants(prev => {
            prev.push(member)
            return [...prev]
        })
    }, [])

    const handleMemberLeft = useCallback(socketId => {
        setParticipants(prev => {
            prev = prev.filter(el => el.socketId !== socketId)
            return [...prev]
        })
        setRemoteStreams(prev => {
            delete prev[socketId]
            return { ...prev }
        })
        delete consumers[socketId]
    }, [])

    const handleMeetUnmute = async () => {
        localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled
        setActions(prev => {
            prev.micOn = localStream.getAudioTracks()[0].enabled
            return { ...prev }
        })
        socket.emit('stream-updated', { kind: 'audio', meetId })
    }

    const handleVideoOff = () => {
        localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled
        setActions(prev => {
            prev.videoOn = localStream.getVideoTracks()[0].enabled
            return { ...prev }
        })
        socket.emit('stream-updated', { kind: 'video', meetId })
    }

    const handleStreamUpdate = useCallback(({ id, kind }) => {
        setRemoteStreams(prev => {
            if (kind === 'audio') {
                prev[id].getAudioTracks()[0].enabled = !prev[id].getAudioTracks()[0].enabled
            } else {
                prev[id].getVideoTracks()[0].enabled = !prev[id].getVideoTracks()[0].enabled
            }
            return { ...prev }
        })
    }, [])

    useEffect(() => {
        const els = document.getElementsByClassName("participant-box")
        if (participants.length > 2) {
            const c = Math.floor(Math.sqrt(participants.length) + 1)
            for(let i=0; i < els.length; i++)
                els[i].style.cssText = `
                    min-width: ${c==2 ? 40 : c==3 ? 30 : 20}%;
                    max-width: 55%;
                `
        }else{
            for (let i = 0; i < els.length; i++)
                els[i].style.cssText = `
                    min-width: unset;
                    max-width: unset;
                `
        }
    }, [participants])

    return <div className='meet-page'>
        {!loading ? <>
            <div className={'Participants-container'}>
                {participants.map((p) =>
                    <ParticipantBox key={p.socketId} socket={socket} p={p} stream={p.socketId === socket.id ? localStream : remoteStreams[p.socketId]} n={participants.length} />
                )}
            </div>
            <ul className='control-bar'>
                <li className='meet-controls-left'>
                    {`time | ${params.id}`}
                </li>
                <li className='meet-controls-center'>
                    <button className={actions.micOn ? '' : 'red-enabled'} onClick={handleMeetUnmute}>
                        {actions.micOn ? <MicNoneOutlinedIcon /> : <MicOffRoundedIcon />}
                    </button>
                    <button className={actions.videoOn ? '' : 'red-enabled'} onClick={handleVideoOff}>
                        {actions.videoOn ? <VideocamOutlinedIcon /> : <VideocamOffOutlinedIcon />}
                    </button>
                    <button className={!actions.captionOn ? '' : 'blue-enabled'} onClick={() => setActions(prev => { return { ...prev, captionOn: !prev.captionOn } })}>
                        {!actions.captionOn ? <ClosedCaptionOutlinedIcon /> : <ClosedCaptionRoundedIcon />}
                    </button>
                    <button className={!actions.handRaised ? '' : 'blue-enabled'} onClick={() => setActions(prev => { return { ...prev, handRaised: !prev.handRaised } })}>
                        {!actions.handRaised ? <PanToolOutlinedIcon /> : <PanToolRoundedIcon />}
                    </button>
                    <button className={!actions.presenting ? '' : 'blue-enabled'} onClick={() => setActions(prev => { return { ...prev, presenting: !prev.presenting } })}>
                        <PresentToAllRoundedIcon />
                    </button>
                    <button>
                        <MoreVertRoundedIcon />
                    </button>
                    <button onClick={() => { navigate('/') }}>
                        <CallEndRoundedIcon />
                    </button>
                </li>
                <li className='meet-controls-right'>
                    <button>
                        <InfoOutlinedIcon />
                    </button>
                    <button>
                        <GroupOutlinedIcon />
                    </button>
                    <button>
                        <MessageOutlinedIcon />
                    </button>
                    <button>
                        <CategoryOutlinedIcon />
                    </button>
                    <button>
                        <LockPersonOutlinedIcon />
                    </button>
                </li>
            </ul>
        </> : <div className='loading-overlay'>
            <h1>Loading...</h1>
        </div>}
    </div>
}

export default MeetLive