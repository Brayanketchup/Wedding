import { useCallback, useEffect, useState } from 'react'
import { Check, Clock3, Copy, Heart, KeyRound, LogOut, Plus, RefreshCw, Search, Users, X } from 'lucide-react'
import { api } from '../lib/api'
import BrandMark from '../components/BrandMark'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      onLogin(result.admin)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <section className="login-art">
        <BrandMark light />
        <div><p className="eyebrow">Annie &amp; Jonathan</p><h1>Todo lo que importa,<br /><em>en un solo lugar.</em></h1></div>
        <p className="login-quote">“El amor no se mira, se siente.”</p>
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-logo"><BrandMark /></div>
          <p className="eyebrow">Área privada</p>
          <h2>Bienvenidos</h2>
          <p>Inicia sesión para ver las respuestas de tus invitados.</p>
          <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="admin@correo.com" /></label>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••••••" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="admin-button" disabled={busy}>{busy ? 'Entrando…' : 'Entrar al dashboard'}</button>
        </form>
      </section>
    </main>
  )
}

function PasswordForm({ forced = false, onChanged, onCancel }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (newPassword !== confirmation) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setBusy(true)
    try {
      const result = await api('/api/admin/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      onChanged(result.admin)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="password-form" onSubmit={submit}>
      <p>{forced ? 'Por seguridad, reemplaza tu contraseña temporal antes de entrar al dashboard.' : 'Introduce tu contraseña actual y elige una nueva.'}</p>
      {!forced && <label>Contraseña actual<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>}
      <label>Nueva contraseña<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /><small>Mínimo 12 caracteres</small></label>
      <label>Confirmar nueva contraseña<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="admin-button" disabled={busy}>{busy ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
      {!forced && <button type="button" className="text-button" onClick={onCancel}>Cancelar</button>}
    </form>
  )
}

function ForcedPasswordChange({ admin, onChanged, onLogout }) {
  return (
    <main className="admin-login">
      <section className="login-art">
        <BrandMark light />
        <div><p className="eyebrow">Cuenta protegida</p><h1>Primero,<br /><em>tu seguridad.</em></h1></div>
        <p className="login-quote">Sesión iniciada como {admin.email}</p>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <div className="mobile-logo"><BrandMark /></div>
          <p className="eyebrow">Actualización requerida</p>
          <h2>Crea tu contraseña</h2>
          <PasswordForm forced onChanged={onChanged} />
          <button className="text-button forced-logout" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </section>
    </main>
  )
}

const statConfig = [
  ['total', 'Invitados', <Users size={20} />],
  ['yes', 'Confirmados', <Check size={20} />],
  ['no', 'No asistirán', <X size={20} />],
  ['pending', 'Pendientes', <Clock3 size={20} />],
]

function DecisionBadge({ decision }) {
  const labels = { yes: 'Asistirá', no: 'No asistirá', pending: 'Pendiente' }
  return <span className={`decision decision--${decision}`}>{labels[decision]}</span>
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

function Dashboard({ admin, onLogout, onAdminChange }) {
  const [data, setData] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [createdUrl, setCreatedUrl] = useState('')
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const load = useCallback(async () => {
    setRefreshing(true)
    setError('')
    try {
      setData(await api('/api/admin/invitations'))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function createInvitation(event) {
    event.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const result = await api('/api/admin/invitations', {
        method: 'POST',
        body: JSON.stringify({ name: guestName }),
      })
      setCreatedUrl(result.url)
      setGuestName('')
      await load()
    } catch (requestError) {
      setCreateError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  async function copyCreatedUrl() {
    await navigator.clipboard.writeText(createdUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function closeCreator() {
    setCreatorOpen(false)
    setCreatedUrl('')
    setCreateError('')
    setCopied(false)
  }

  const invitations = (data?.invitations || []).filter((item) => {
    const matchesFilter = filter === 'all' || item.decision === filter
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <main className="dashboard">
      <aside className="admin-sidebar">
        <BrandMark light />
        <div className="sidebar-title"><span>Panel de boda</span><strong>A &amp; J</strong></div>
        <nav><button className="active"><Heart size={18} /> Invitaciones</button></nav>
        <div className="admin-user"><span>{admin.email.slice(0, 1).toUpperCase()}</span><div><strong>Administración</strong><small>{admin.email}</small></div></div>
        <div className="sidebar-account-actions">
          <button onClick={() => setPasswordOpen(true)}><KeyRound size={17} /> Cambiar contraseña</button>
          <button onClick={onLogout}><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div><p className="eyebrow">Panel de boda</p><h1>Invitados</h1><p>Consulta las respuestas a vuestra invitación.</p></div>
          <div className="dashboard-header-actions">
            <button className="refresh-button" onClick={load} disabled={refreshing}><RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Actualizar</button>
            <button className="new-invitation-button" onClick={() => setCreatorOpen(true)}><Plus size={16} /> Nueva invitación</button>
          </div>
        </header>

        <div className="stats-grid">
          {statConfig.map(([key, label, icon]) => (
            <article className={`stat-card stat-card--${key}`} key={key}>
              <span>{icon}</span><div><strong>{data?.stats?.[key] ?? '—'}</strong><small>{label}</small></div>
            </article>
          ))}
        </div>

        <section className="guest-panel">
          <div className="guest-toolbar">
            <div><h2>Lista de invitados</h2><p>{invitations.length} resultados</p></div>
            <div className="toolbar-actions">
              <label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar invitado" /></label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrar respuestas">
                <option value="all">Todos</option><option value="yes">Confirmados</option><option value="no">No asistirán</option><option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
          {error && <div className="dashboard-error">{error} <button onClick={load}>Reintentar</button></div>}
          {!error && !data && <div className="table-loading">Cargando respuestas…</div>}
          {data && (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Invitado</th><th>Estado</th><th>Respondió</th><th>Token</th></tr></thead>
                <tbody>
                  {invitations.map((item) => (
                    <tr key={item.id}>
                      <td><div className="guest-name"><span>{item.name.slice(0, 1).toUpperCase()}</span><strong>{item.name}</strong></div></td>
                      <td><DecisionBadge decision={item.decision} /></td>
                      <td>{formatDate(item.respondedAt)}</td>
                      <td><code>{item.tokenPreview}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!invitations.length && <div className="empty-table">No hay invitados que coincidan con la búsqueda.</div>}
            </div>
          )}
        </section>
      </section>

      {creatorOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCreator()}>
          <section className="invitation-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <button className="modal-close" onClick={closeCreator} aria-label="Cerrar"><X size={18} /></button>
            <p className="eyebrow">Invitación privada</p>
            <h2 id="create-title">Crear invitación</h2>
            {!createdUrl ? (
              <form onSubmit={createInvitation}>
                <p>Escribe el nombre tal como quieres que aparezca en la invitación.</p>
                <label>Nombre del invitado<input autoFocus value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Ej. Familia Rodríguez" minLength="2" maxLength="120" required /></label>
                {createError && <p className="form-error" role="alert">{createError}</p>}
                <button className="admin-button" disabled={creating}>{creating ? 'Creando…' : 'Crear enlace privado'}</button>
              </form>
            ) : (
              <div className="created-invitation">
                <span className="created-check"><Check size={24} /></span>
                <h3>Invitación creada</h3>
                <p>Este enlace completo se muestra una sola vez. Cópialo y envíalo al invitado.</p>
                <div className="created-link"><input readOnly value={createdUrl} /><button onClick={copyCreatedUrl}><Copy size={16} /> {copied ? 'Copiado' : 'Copiar'}</button></div>
                <button className="text-button" onClick={() => setCreatedUrl('')}>Crear otra invitación</button>
              </div>
            )}
          </section>
        </div>
      )}

      {passwordOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordOpen(false)}>
          <section className="invitation-modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
            <button className="modal-close" onClick={() => setPasswordOpen(false)} aria-label="Cerrar"><X size={18} /></button>
            <p className="eyebrow">Seguridad de la cuenta</p>
            <h2 id="password-title">Cambiar contraseña</h2>
            <PasswordForm onCancel={() => setPasswordOpen(false)} onChanged={(value) => { onAdminChange(value); setPasswordOpen(false) }} />
          </section>
        </div>
      )}
    </main>
  )
}

export default function AdminPage() {
  const [status, setStatus] = useState('loading')
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    api('/api/admin/session')
      .then((result) => { setAdmin(result.admin); setStatus('authenticated') })
      .catch(() => setStatus('guest'))
  }, [])

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setAdmin(null)
    setStatus('guest')
  }

  if (status === 'loading') return <div className="admin-loading"><BrandMark /><span /></div>
  if (status === 'guest') return <Login onLogin={(value) => { setAdmin(value); setStatus('authenticated') }} />
  if (admin.mustChangePassword) return <ForcedPasswordChange admin={admin} onChanged={setAdmin} onLogout={logout} />
  return <Dashboard admin={admin} onLogout={logout} onAdminChange={setAdmin} />
}
