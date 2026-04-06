'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser, getUsers, saveUsers, setSessionUser } from '../lib/storage';

export default function AuthPage({ mode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      router.replace('/dashboard');
      return;
    }

    if (mode === 'login' && getUsers().length === 0) {
      router.replace('/signup');
      return;
    }

    setReady(true);
  }, [mode, router]);

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!username || !password) {
      setMessage('Enter username and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 4) {
        setMessage('Password must be at least 4 characters.');
        return;
      }

      const users = getUsers();
      const exists = users.some((user) => user.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setMessage('Username already exists.');
        return;
      }

      saveUsers([...users, { username, password }]);
      setSessionUser(username);
      router.replace('/dashboard');
      return;
    }

    const user = getUsers().find((entry) => entry.username === username && entry.password === password);
    if (!user) {
      setMessage('Invalid username or password.');
      return;
    }

    setSessionUser(user.username);
    router.replace('/dashboard');
  }

  if (!ready) {
    return (
      <main className="page-shell min-h-screen grid place-items-center">
        <div className="cyber-card w-full max-w-md p-8 text-center text-slate-300">Loading secure session...</div>
      </main>
    );
  }

  const isLogin = mode === 'login';

  return (
    <main className="page-shell min-h-screen grid place-items-center">
      <section className="cyber-card w-full max-w-md p-7 sm:p-8">
        <div className="cyber-chip w-fit">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(87,215,255,0.7)]" />
          {isLogin ? 'Secure Access' : 'User Registration'}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          {isLogin ? 'Login required' : 'Create account'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {isLogin
            ? 'Sign in to continue to the Lost & Found dashboard.'
            : 'Register a new local account before using the dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="cyber-label">Username</span>
            <input name="username" type="text" maxLength={40} placeholder="Enter username" className="cyber-input" autoComplete="off" />
          </label>

          <label className="grid gap-2">
            <span className="cyber-label">Password</span>
            <input name="password" type="password" maxLength={80} placeholder="Enter password" className="cyber-input" autoComplete="off" />
          </label>

          {message ? <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{message}</p> : null}

          <button className="cyber-button bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-950" type="submit">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400">
          {isLogin ? 'Need an account?' : 'Already registered?'}{' '}
          <a className="text-cyan-200 underline decoration-cyan-300/60 underline-offset-4" href={isLogin ? '/signup' : '/login'}>
            {isLogin ? 'Go to Sign Up' : 'Back to Login'}
          </a>
        </p>
      </section>
    </main>
  );
}
