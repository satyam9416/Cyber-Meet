import React, { useCallback, useContext } from 'react'
import { createContext } from 'react'

const WebRTCContext = createContext()

export const useWebRTC = () => useContext(WebRTCContext)

export const WebRTCProvider = ({ children }) => {

    const createPeer = useCallback(() => new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:relay.metered.ca:80",
            },
            {
                urls: "turn:relay.metered.ca:80",
                username: "07980d6073378245d1ed6ef9",
                credential: "vkbnV4euCGd/+udF",
            },
            {
                urls: "turn:relay.metered.ca:443",
                username: "07980d6073378245d1ed6ef9",
                credential: "vkbnV4euCGd/+udF",
            },
            {
                urls: "turn:relay.metered.ca:443?transport=tcp",
                username: "07980d6073378245d1ed6ef9",
                credential: "vkbnV4euCGd/+udF",
            },
        ],
    }))

    const createOffer = useCallback(async (peer) => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer);
        return offer;
    }, [])

    return (
        <WebRTCContext.Provider value={{ createPeer, createOffer }}>
            {children}
        </WebRTCContext.Provider>
    )
}

