import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { login } from '../lib/auth';
import { Mandala } from '../components/Ornaments';

export function Login({ onDone, businessName }: { onDone: () => void; businessName: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const ok = await login(email, password, remember);
    setBusy(false);
    if (ok) onDone();
    else setError('Email or password is incorrect');
  };

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-wine-900 px-4 py-10">
      <Mandala color="#d4a437" className="spin-slow pointer-events-none absolute -left-40 -top-40 w-[560px] opacity-10" />
      <Mandala color="#d4a437" className="spin-slower pointer-events-none absolute -bottom-52 -right-40 w-[520px] opacity-10" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-[28px] bg-white p-7 shadow-2xl"
      >
        <div className="text-center">
          <img src="./favicon.svg" alt="" className="mx-auto h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-wine-900">{businessName}</h1>
          <p className="mt-1 text-sm text-stone-500">Admin sign in</p>
        </div>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Email</span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input className="input !pl-9" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">Password</span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input className="input !px-9" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in for 30 days
        </label>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="mt-5 h-12 w-full rounded-xl bg-[linear-gradient(100deg,#d4a437,#f6e27a,#d4a437)] font-semibold text-wine-900 shadow-lg disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-5 text-center text-xs text-stone-400">
          Looking for an invitation? <a href="#/showcase" className="font-medium text-brand-600 underline">See our designs</a>
        </p>
      </motion.form>
    </div>
  );
}
