import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import MusicPlayer from '../music/MusicPlayer'
import { useInitPlayer } from '../../../hooks/useMusic'

export default function PublicLayout() {
  // Initialize player with active playlist
  useInitPlayer()

  return (
    <div className="min-h-screen flex flex-col bg-black has-player">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  )
}
