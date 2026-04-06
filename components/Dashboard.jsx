'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSessionUser, getItems, getSessionUser, getUsers, saveItems } from '../lib/storage';

function formatDate(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionUser, setSessionUser] = useState('');
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const currentSession = getSessionUser();
    const users = getUsers();
    const isValid = currentSession && users.some((user) => user.username === currentSession);

    if (!isValid) {
      clearSessionUser();
      router.replace('/login');
      return;
    }

    setSessionUser(currentSession);
    setItems(getItems(currentSession));
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!sessionUser) return;
    saveItems(sessionUser, items);
  }, [items, sessionUser]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => [item.name, item.category, item.location].join(' ').toLowerCase().includes(normalized));
  }, [items, query]);

  function showToast(message) {
    setToast(message);
  }

  function handleAddItem(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('itemName') || '').trim();
    const category = String(formData.get('itemCategory') || '').trim();
    const location = String(formData.get('itemLocation') || '').trim();

    if (!name || !category || !location) {
      showToast('Fill in all fields before saving.');
      return;
    }

    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      category,
      location,
      createdAt: new Date().toISOString()
    };

    setItems((currentItems) => [newItem, ...currentItems]);
    event.currentTarget.reset();
    showToast('Item saved locally.');
  }

  function handleDeleteItem(id) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    showToast('Item deleted.');
  }

  function handleClearAll() {
    if (items.length === 0) {
      showToast('No items to clear.');
      return;
    }

    if (!window.confirm('Remove all stored items from this account?')) return;
    setItems([]);
    showToast('All items removed.');
  }

  function handleLogout() {
    clearSessionUser();
    router.replace('/login');
  }

  if (!ready) {
    return (
      <main className="page-shell min-h-screen grid place-items-center">
        <div className="cyber-card w-full max-w-md p-8 text-center text-slate-300">Verifying secure session...</div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="cyber-card p-6 sm:p-8 mb-6 overflow-hidden relative">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="cyber-chip w-fit">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(87,215,255,0.7)]" />
              Lost & Found Console
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-100 sm:text-6xl">Lost&Found UM</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Register found or missing items, scan records instantly, and keep everything stored locally in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="cyber-chip">User: {sessionUser}</div>
            <button type="button" onClick={handleLogout} className="cyber-button border border-slate-200/10 bg-slate-950/80 text-slate-100">
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/10 bg-slate-950/70 p-4">
            <span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Total Items</span>
            <strong className="mt-2 block text-3xl text-slate-100">{items.length}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200/10 bg-slate-950/70 p-4">
            <span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Visible Results</span>
            <strong className="mt-2 block text-3xl text-slate-100">{filteredItems.length}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200/10 bg-slate-950/70 p-4">
            <span className="block text-xs uppercase tracking-[0.14em] text-slate-400">Saved Locally</span>
            <strong className="mt-2 block text-3xl text-slate-100">100%</strong>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <article className="cyber-card">
          <div className="border-b border-slate-200/10 p-6 pb-0">
            <h2 className="text-xl font-semibold text-slate-100">Report an item</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Enter the item details below. They are stored locally in your browser.</p>
          </div>

          <form onSubmit={handleAddItem} className="grid gap-4 p-6">
            <label className="grid gap-2">
              <span className="cyber-label">Item name</span>
              <input name="itemName" type="text" maxLength={80} placeholder="Example: Black leather wallet" className="cyber-input" />
            </label>

            <label className="grid gap-2">
              <span className="cyber-label">Category</span>
              <select name="itemCategory" className="cyber-input">
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="documents">Documents</option>
                <option value="keys">Keys</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="cyber-label">Location found / lost</span>
              <input name="itemLocation" type="text" maxLength={100} placeholder="Example: Lobby entrance" className="cyber-input" />
            </label>

            <p className="text-sm text-slate-400">Tip: Use search to filter by name, category, or location.</p>

            <div className="flex flex-wrap gap-3">
              <button className="cyber-button bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-950" type="submit">
                Save item
              </button>
              <button className="cyber-button border border-slate-200/10 bg-slate-950/80 text-slate-100" type="reset">
                Reset form
              </button>
              <button className="cyber-button border border-rose-400/30 bg-rose-400/10 text-rose-100" type="button" onClick={handleClearAll}>
                Clear all
              </button>
            </div>
          </form>
        </article>

        <article className="cyber-card">
          <div className="border-b border-slate-200/10 p-6 pb-0">
            <h2 className="text-xl font-semibold text-slate-100">Reported items</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Browse item cards, search through records, or remove entries you no longer need.</p>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="grid w-full gap-2 sm:max-w-md">
                <span className="sr-only">Search items</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search by name, category, or location" className="cyber-input pl-12" />
              </label>

              <div className="cyber-chip">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(87,215,255,0.75)]" />
                {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'} shown
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200/15 bg-slate-950/50 px-6 py-12 text-center text-slate-400">
                <h3 className="text-xl font-semibold text-slate-100">No matching items</h3>
                <p className="mt-2 text-sm">Try another search term or add a new report to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <article key={item.id} className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/10 bg-slate-950/95 p-5 shadow-glow">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(87,215,255,0.13),transparent_40%,rgba(142,240,199,0.08))] opacity-60" />
                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <div>
                        <div className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.08em] text-cyan-100">
                          {item.category}
                        </div>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-100">{item.name}</h3>
                      </div>
                    </div>
                    <div className="relative z-10 mt-4 grid gap-2 text-sm text-slate-400">
                      <div><span className="font-semibold text-slate-300">Location:</span> {item.location}</div>
                      <div><span className="font-semibold text-slate-300">Reported:</span> {formatDate(item.createdAt)}</div>
                    </div>
                    <div className="relative z-10 mt-5 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-400">ID: {item.id.slice(0, 8)}</span>
                      <button type="button" onClick={() => handleDeleteItem(item.id)} className="cyber-button border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan-300/20 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 shadow-glow">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
