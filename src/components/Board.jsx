import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

function Column({ title, tasks, onCreate, onUpdate }){
  return (
    <div className="w-full md:w-1/3 p-2">
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-slate-200 font-semibold">{title}</div>
          <button onClick={onCreate} className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200">
            <Plus className="w-4 h-4"/> Add
          </button>
        </div>
        <div className="space-y-2 min-h-[50px]">
          {tasks.map(t => (
            <div key={t._id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <div className="text-slate-100 font-medium">{t.title}</div>
              {t.description && <div className="text-slate-400 text-sm mt-1">{t.description}</div>}
              <div className="flex items-center gap-2 mt-2">
                <select value={t.status} onChange={e=>onUpdate(t._id,{status:e.target.value})} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Board({ project, token, onTaskCreated }){
  const backend = import.meta.env.VITE_BACKEND_URL
  const [tasks, setTasks] = useState([])

  async function load(){
    const res = await fetch(`${backend}/projects/${project._id}/tasks`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setTasks(data)
  }

  useEffect(()=>{ load() },[project._id])

  useEffect(()=>{
    const ws = new WebSocket(`${backend.replace('http','ws')}/ws/projects/${project._id}`)
    ws.onmessage = (evt)=>{
      const msg = JSON.parse(evt.data)
      if(msg.type === 'task:update'){
        setTasks(prev => {
          const exists = prev.some(p=>p._id===msg.data._id)
          if(exists){
            return prev.map(p=>p._id===msg.data._id? msg.data : p)
          } else {
            return [msg.data, ...prev]
          }
        })
      }
    }
    return ()=> ws.close()
  },[project._id])

  async function createTask(){
    const title = prompt('Task title')
    if(!title) return
    const res = await fetch(`${backend}/tasks`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ project_id: project._id, title })
    })
    const data = await res.json()
    onTaskCreated?.(data)
  }

  async function updateTask(id, patch){
    const res = await fetch(`${backend}/tasks/${id}`, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch)
    })
    const data = await res.json()
    setTasks(prev => prev.map(t=>t._id===data._id? data : t))
  }

  const grouped = useMemo(()=>({
    todo: tasks.filter(t=>t.status==='todo'),
    in_progress: tasks.filter(t=>t.status==='in_progress'),
    done: tasks.filter(t=>t.status==='done'),
  }),[tasks])

  return (
    <div className="flex flex-col md:flex-row -mx-2">
      <Column title="To Do" tasks={grouped.todo} onCreate={createTask} onUpdate={updateTask} />
      <Column title="In Progress" tasks={grouped.in_progress} onCreate={createTask} onUpdate={updateTask} />
      <Column title="Done" tasks={grouped.done} onCreate={createTask} onUpdate={updateTask} />
    </div>
  )
}
