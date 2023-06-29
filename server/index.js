require('dotenv').config();
const app = require('express')()
const http = require('http').createServer(app)
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const io = require('socket.io')(http, { cors: true });
const cors = require('cors');
const webRTC = require('wrtc')
let users = []
let peers = {}
let consumers = {}
let usedMeetIDs = []

app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));


app.get('/create-new-meet', (req, res) => {
    const chars = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']
    let meetId = '';
    do {
        for (let i = 0; i < 9; i++) {
            meetId += chars[Math.floor(Math.random() * 10)]
            if (i === 2 || i == 5) {
                meetId += '-';
            }
        }
    } while (usedMeetIDs.includes(meetId))
    usedMeetIDs.push(meetId)
    res.status(200).json({ meetId: meetId })
})


const createPeer = () => {
    const peer = new webRTC.RTCPeerConnection({
        // iceServers: [
        //     { 'urls': 'stun:stun.stunprotocol.org:3478' },
        //     { 'urls': 'stun:stun.l.google.com:19302' },
        // ]
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
    })
    return peer;
}

const getMembers = (membersSet) => {
    const members = []

    membersSet.forEach(el => {
        const member = users.find(user => user.socketId === el)
        if (member) {
            members.push(member)
        }
    });
    return members
}

const removeUser = (socketId) => {
    index = users.filter((el) => el.socketId !== socketId)
}

io.on('connection', socket => {
 
    socket.on('join-meet', async ({ userData, offer }) => {
        const { meetId } = userData
        users.push({ ...userData, socketId: socket.id })
        socket.join(meetId)
        peers[socket.id] = createPeer()
        peers[socket.id].ontrack = e => {
            if (e.streams && e.streams[0]) {
                peers[socket.id].stream = e.streams[0]
            }
        }
        await peers[socket.id].setRemoteDescription(new webRTC.RTCSessionDescription(offer))
        const ans = await peers[socket.id].createAnswer()
        await peers[socket.id].setLocalDescription(ans)
        const members = getMembers(io.sockets.adapter.rooms.get(meetId))
        socket.emit('joined-meet', { ans: peers[socket.id].localDescription, members })

        socket.broadcast.to(meetId).emit('new-member-joined', { ...userData, socketId: socket.id })
    })

    socket.on('ice-candidate', ice => {
        if (peers[socket.id] && ice) {
            peers[socket.id].addIceCandidate(new webRTC.RTCIceCandidate(ice)).catch(e => console.log(e));
        }
    })

    socket.on('stream-updated', ({ meetId, kind }) => {
        socket.broadcast.to(meetId).emit('stream-updated', { id: socket.id, kind })
    })

    socket.on('consume', async ({ offer, socketId }) => {
        const consumer = createPeer()
        if (consumers[socket.id] == undefined) {
            consumers[socket.id] = {}
        }
        consumers[socket.id][socketId] = consumer
        await consumers[socket.id][socketId].setRemoteDescription(new webRTC.RTCSessionDescription(offer))
        peers[socketId].stream.getTracks().forEach((track) => {
            consumers[socket.id][socketId].addTrack(track, peers[socketId].stream)
        })
        const ans = await consumers[socket.id][socketId].createAnswer()
        await consumers[socket.id][socketId].setLocalDescription(new webRTC.RTCSessionDescription(ans))
        socket.emit('consume', { ans, socketId })
    })

    socket.on('consumer-ice', ({ ice, socketId }) => {
        if (consumers[socket.id][socketId] && ice !== null) {
            consumers[socket.id][socketId].addIceCandidate(new webRTC.RTCIceCandidate(ice)).catch(e => console.log(e));
        }
    })

    socket.on('disconnecting', () => {
        removeUser(socket.id)
        const rooms = socket.rooms
        rooms.delete(socket.id)
        delete peers[socket.id]
        rooms.forEach((el) => {
            socket.broadcast.to(el).emit('member-left', socket.id)
        })
    })

})

http.listen(PORT, '192.168.0.102', () => {
    console.log('Server is running at port ', PORT)
})