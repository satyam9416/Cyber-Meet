import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/home/home'
import MeetPage from './pages/meet/meet'
import { SocketProvider } from './providers/socket'
import { WebRTCProvider } from './providers/webRTC'

function App() {

  return (
    <div className="App">
      <SocketProvider>
        <WebRTCProvider>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/meet/:id' element={<MeetPage/>} />
        </Routes>
        </WebRTCProvider>
      </SocketProvider>
    </div>
  )
}

export default App
