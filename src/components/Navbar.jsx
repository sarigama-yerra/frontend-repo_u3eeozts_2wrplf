import { useEffect, useState } from 'react'
import { LogIn, LogOut, Plus, Layout, ListChecks } from 'lucide-react'

export default function Navbar({ onCreateProject, user, onLogin, onLogout }) {
  const [projectName, setProjectName] = useState('')

  return (
    <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-blue-300">
          <Layout className="w-6 h-6" />
          <span className="font-semibold">FlowBoards</span>
        </div>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-3">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="New project name"
              className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={() => { if(projectName.trim()){ onCreateProject(projectName.trim()); setProjectName('') } }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm"
            >
              <Plus className="w-4 h-4" /> New
            </button>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <ListChecks className="w-4 h-4" /> {user.name}
            </div>
            <button onClick={onLogout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm">
            <LogIn className="w-4 h-4" /> Login / Register
          </button>
        )}
      </div>
    </div>
  )
}
