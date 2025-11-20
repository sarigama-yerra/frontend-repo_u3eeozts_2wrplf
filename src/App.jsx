import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Board from './components/Board'

function App() {
  const backend = import.meta.env.VITE_BACKEND_URL
  const [authOpen, setAuthOpen] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [active, setActive] = useState(null)

  useEffect(()=>{
    async function load(){
      if(!token) return
      const meRes = await fetch(`${backend}/me`, { headers: { Authorization: `Bearer ${token}` } })
      if(!meRes.ok){ setToken(''); localStorage.removeItem('token'); return }
      const me = await meRes.json(); setUser(me)
      const pRes = await fetch(`${backend}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      const p = await pRes.json(); setProjects(p); setActive(p[0] || null)
    }
    load()
  },[token])

  function handleAuthSubmit({ token, user }){
    setToken(token); localStorage.setItem('token', token); setUser(user); setAuthOpen(false)
  }

  async function createProject(name){
    const res = await fetch(`${backend}/projects`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify({ name }) })
    const p = await res.json(); setProjects(prev=>[p, ...prev]); setActive(p)
  }

  function logout(){ setToken(''); setUser(null); localStorage.removeItem('token') }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar onCreateProject={createProject} user={user} onLogin={()=>setAuthOpen(true)} onLogout={logout} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!user ? (
          <div className="text-center text-slate-300 py-24">
            <h1 className="text-3xl font-bold mb-3">FlowBoards</h1>
            <p className="mb-6">A lightweight collaborative board for projects, tasks and comments.</p>
            <button onClick={()=>setAuthOpen(true)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white">Get started</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <div className="text-slate-200 font-semibold mb-2">Projects</div>
                <div className="space-y-1">
                  {projects.map(p => (
                    <button key={p._id} onClick={()=>setActive(p)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${active?._id===p._id? 'bg-slate-900 text-slate-100' : 'text-slate-300 hover:bg-slate-900/50'}`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-3">
              {active ? (
                <Board project={active} token={token} onTaskCreated={(t)=>{}} />
              ) : (
                <div className="text-slate-400">Create or select a project to begin.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onSubmit={handleAuthSubmit} />
    </div>
  )
}

export default App
