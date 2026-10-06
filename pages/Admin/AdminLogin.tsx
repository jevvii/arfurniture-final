import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react'

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(identifier, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError('Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center philippine-wood-bg p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#d6be9f]/60 p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo/logo.png" alt="Beauteous Palochina" className="w-16 h-16 object-contain mb-2" />
          <h2 className="text-2xl font-bold font-serif text-[#341e10]">Beauteous Palochina</h2>
          <p className="text-xs text-[#8c572a] uppercase tracking-wider font-semibold mt-0.5">Admin Management Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#8c572a] focus:ring-2 focus:ring-[#8c572a]/20 outline-none transition-all"
                placeholder="admin or admin@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#8c572a] focus:ring-2 focus:ring-[#8c572a]/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8c572a] text-white py-3 rounded-xl font-semibold hover:bg-[#a66a35] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-md active:scale-95"
          >
            {loading ? 'Signing in…' : (<><span>Sign In</span><ArrowRight className="w-4 h-4" /></>)}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">Only authorized admins can access</p>
        
        <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-sm text-[#8c572a] hover:text-[#5a3821] hover:underline flex items-center justify-center gap-1 mx-auto font-medium"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Store
            </button>
        </div>
      </div>
    </div>
  )
}
