import './participant-box.css'
import React, { useEffect } from 'react'
import GridOffRoundedIcon from '@mui/icons-material/GridOffRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseFullscreenOutlinedIcon from '@mui/icons-material/CloseFullscreenOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import ReactPlayer from 'react-player'

const ParticipantBox = ({ p, stream, socket,n, style }) => {


    return (
        <div className={`participant-box ${n==2 && p.socketId === socket.id ? 'p-2': ''}`} style={style} key={p.socketId}>
            {!stream?.getAudioTracks()[0].enabled ? <div className='participant-muted-icon'>
                <MicOffRoundedIcon />
            </div> : null}

            <h3 className='participant-name-text'>{p?.name}</h3>
            {
                stream?.getVideoTracks()[0].enabled ?
                    <ReactPlayer url={stream} playing muted={p.socketId === socket.id} className='video-playback'/> : stream ?
                        <>
                            <ReactPlayer style={{'max-height': '0', 'max-width': '0', overflow:'hidden'}} url={stream} playing muted={p.socketId === socket.id} />
                            <img className='participant-profile-img' src='/profile_img.jpg' alt="" />
                        </>
                        :
                        <img className='participant-profile-img' src='/profile_img.jpg' alt="" />
            }

                        {/* <img className='participant-profile-img' src='/profile_img.jpg' alt="" /> */}
            <div className='Participants-control-options'>
                <button>
                    <PushPinOutlinedIcon />
                </button>
                {p?.socketId === socket.id ? <>
                    <button>
                        <GridOffRoundedIcon />
                    </button>
                    <button>
                        <CloseFullscreenOutlinedIcon />
                    </button>
                </> : <>
                    <button disabled={true}>
                        <MicOffOutlinedIcon />
                    </button>
                    <button>
                        <RemoveCircleOutlineOutlinedIcon />
                    </button>
                </>}
            </div>
        </div>
    )
}

export default ParticipantBox