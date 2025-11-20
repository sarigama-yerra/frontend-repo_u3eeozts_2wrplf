import { useEffect, useState } from 'react'

export default function AuthModal({ open, onClose, onSubmit }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const backend = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    if (!open) {
      setMode('login');
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e){
    e.preventDefault()
    const endpoint = mode === 'register' ? '/auth/register' : '/auth/login'
    const body = mode === 'register' ? { name, email, password } : { email, password }
    const res = await fetch(`${backend}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if(!res.ok){
      alert('Authentication failed')
      return
    }
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    const meRes = await fetch(`${backend}/me`, { headers: { Authorization: `Bearer ${data.access_token}` } })
    const me = await meRes.json()
    onSubmit({ token: data.access_token, user: me })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 text-slate-200">
        <h3 className="text-lg font-semibold mb-4">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h3>
        {mode === 'register' && (
          <input className="w-full mb-2 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        )}
        <input className="w-full mb-2 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full mb-4 px-3 py-2 rounded-md bg-slate-900 border border-slate-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleSubmit} className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-500">{mode === 'register' ? 'Create account' : 'Login'}</button>
        <div className="mt-3 text-center text-sm text-slate-400">
          {mode === 'register' ? (
            <button className="underline" onClick={()=>setMode('login')}>Have an account? Sign in</button>
          ) : (
            <button className="underline" onClick={()=>setMode('register')}>New here? Create account</button>
          )}
        </div>
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400">✕</button>
      </div>
    </div>
  )
}
