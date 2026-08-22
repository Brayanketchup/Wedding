import { useCallback, useEffect, useState } from 'react'
import { Check, Clock3, Copy, Eye, EyeOff, Heart, KeyRound, LogOut, Mail, MessageCircle, Pencil, Plus, RefreshCw, Search, Share2, Trash2, Users, X } from 'lucide-react'
import { api } from '../lib/api'
import BrandMark from '../components/BrandMark'

function PasswordInput(props) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="password-input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-visibility"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  )
}

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
          <label>Contraseña<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••••••" /></label>
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
      {!forced && <label>Contraseña actual<PasswordInput value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>}
      <label>Nueva contraseña<PasswordInput value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /><small>Mínimo 12 caracteres</small></label>
      <label>Confirmar nueva contraseña<PasswordInput value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /></label>
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
  ['total', 'all', 'Invitados', <Users size={20} />],
  ['yes', 'yes', 'Confirmados', <Check size={20} />],
  ['no', 'no', 'No asistirán', <X size={20} />],
  ['pending', 'pending', 'Pendientes', <Clock3 size={20} />],
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
  const [editingInvitation, setEditingInvitation] = useState(null)
  const [editedName, setEditedName] = useState('')
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [hidingId, setHidingId] = useState('')
  const [linkActionId, setLinkActionId] = useState('')
  const [copiedInvitationId, setCopiedInvitationId] = useState('')
  const [shareData, setShareData] = useState(null)

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

  function openEditor(invitation) {
    setEditingInvitation(invitation)
    setEditedName(invitation.name)
    setEditError('')
  }

  function closeEditor() {
    if (savingEdit) return
    setEditingInvitation(null)
    setEditedName('')
    setEditError('')
  }

  async function saveInvitationName(event) {
    event.preventDefault()
    setSavingEdit(true)
    setEditError('')
    try {
      await api(`/api/admin/invitations/${editingInvitation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editedName }),
      })
      setEditingInvitation(null)
      setEditedName('')
      setEditError('')
      await load()
    } catch (requestError) {
      setEditError(requestError.message)
    } finally {
      setSavingEdit(false)
    }
  }

  async function hideInvitation(invitation) {
    const confirmed = window.confirm(`¿Ocultar la invitación de ${invitation.name}? El enlace dejará de funcionar, pero los datos no se eliminarán.`)
    if (!confirmed) return

    setHidingId(invitation.id)
    setError('')
    try {
      await api(`/api/admin/invitations/${invitation.id}`, { method: 'DELETE' })
      await load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setHidingId('')
    }
  }

  async function getInvitationUrl(invitation) {
    try {
      const result = await api(`/api/admin/invitations/${invitation.id}/link`)
      return result.url
    } catch (requestError) {
      if (requestError.code !== 'LINK_NOT_RECOVERABLE') throw requestError

      const confirmed = window.confirm(`El enlace de ${invitation.name} fue creado antes de que se pudieran recuperar enlaces. ¿Generar uno nuevo? El enlace anterior dejará de funcionar.`)
      if (!confirmed) return null

      const result = await api(`/api/admin/invitations/${invitation.id}/link`, {
        method: 'POST',
        body: JSON.stringify({ regenerate: true }),
      })
      return result.url
    }
  }

  async function copyInvitationLink(invitation) {
    setLinkActionId(invitation.id)
    setError('')
    try {
      const url = await getInvitationUrl(invitation)
      if (!url) return
      await navigator.clipboard.writeText(url)
      setCopiedInvitationId(invitation.id)
      window.setTimeout(() => setCopiedInvitationId(''), 1800)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLinkActionId('')
    }
  }

  async function shareInvitation(invitation) {
    setLinkActionId(invitation.id)
    setError('')
    try {
      const url = await getInvitationUrl(invitation)
      if (!url) return
      const sharing = {
        title: `Invitación para ${invitation.name}`,
        text: `Te invitamos a celebrar nuestra boda. Abre aquí tu invitación privada:`,
        url,
      }

      if (navigator.share) {
        try {
          await navigator.share(sharing)
          return
        } catch (shareError) {
          if (shareError.name === 'AbortError') return
        }
      }
      setShareData({ invitation, url })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLinkActionId('')
    }
  }

  async function copySharedLink() {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopiedInvitationId(shareData.invitation.id)
      window.setTimeout(() => setCopiedInvitationId(''), 1800)
    } catch (requestError) {
      setShareData(null)
      setError(requestError.message)
    }
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
        <div className="sidebar-title"><span>Panel de boda</span></div>
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
          {statConfig.map(([key, filterValue, label, icon]) => (
            <button type="button" className={`stat-card stat-card--${key} ${filter === filterValue ? 'stat-card--active' : ''}`} key={key} onClick={() => setFilter(filterValue)} aria-pressed={filter === filterValue}>
              <span className="stat-icon">{icon}</span><span className="stat-copy"><strong>{data?.stats?.[key] ?? '—'}</strong><small>{label}</small></span>
            </button>
          ))}
        </div>

        <section className="guest-panel">
          <div className="guest-toolbar">
            <div><h2>Lista de invitados</h2><p>{invitations.length} resultados</p></div>
            <div className="toolbar-actions">
              <label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar invitado" /></label>
            </div>
          </div>
          {error && <div className="dashboard-error">{error} <button onClick={load}>Reintentar</button></div>}
          {!error && !data && <div className="table-loading">Cargando respuestas…</div>}
          {data && (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Invitado</th><th>Estado</th><th>Respondió</th><th>Acciones</th></tr></thead>
                <tbody>
                  {invitations.map((item) => (
                    <tr key={item.id}>
                      <td><div className="guest-name"><span>{item.name.slice(0, 1).toUpperCase()}</span><strong>{item.name}</strong></div></td>
                      <td><DecisionBadge decision={item.decision} /></td>
                      <td>{formatDate(item.respondedAt)}</td>
                      <td>
                        <div className="invitation-actions">
                          <button type="button" onClick={() => copyInvitationLink(item)} disabled={linkActionId === item.id} aria-label={`Copiar enlace de ${item.name}`} title={copiedInvitationId === item.id ? 'Enlace copiado' : 'Copiar enlace'}>{copiedInvitationId === item.id ? <Check size={15} /> : <Copy size={15} />}</button>
                          <button type="button" onClick={() => shareInvitation(item)} disabled={linkActionId === item.id} aria-label={`Compartir invitación de ${item.name}`} title="Compartir invitación"><Share2 size={15} /></button>
                          <button type="button" onClick={() => openEditor(item)} aria-label={`Editar nombre de ${item.name}`} title="Editar nombre"><Pencil size={15} /></button>
                          <button type="button" className="hide-invitation" onClick={() => hideInvitation(item)} disabled={hidingId === item.id} aria-label={`Ocultar invitación de ${item.name}`} title="Ocultar invitación"><Trash2 size={15} /></button>
                        </div>
                      </td>
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
                <p>Copia el enlace y envíalo al invitado. También podrás copiarlo o compartirlo más tarde desde la lista.</p>
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

      {editingInvitation && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
          <section className="invitation-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <button className="modal-close" onClick={closeEditor} aria-label="Cerrar"><X size={18} /></button>
            <p className="eyebrow">Invitación privada</p>
            <h2 id="edit-title">Editar nombre</h2>
            <form onSubmit={saveInvitationName}>
              <p>El nuevo nombre aparecerá en la invitación cuando el invitado abra su enlace.</p>
              <label>Nombre del invitado<input autoFocus value={editedName} onChange={(event) => setEditedName(event.target.value)} minLength="2" maxLength="120" required /></label>
              {editError && <p className="form-error" role="alert">{editError}</p>}
              <button className="admin-button" disabled={savingEdit}>{savingEdit ? 'Guardando…' : 'Guardar cambios'}</button>
              <button type="button" className="text-button modal-cancel" onClick={closeEditor} disabled={savingEdit}>Cancelar</button>
            </form>
          </section>
        </div>
      )}

      {shareData && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShareData(null)}>
          <section className="invitation-modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <button className="modal-close" onClick={() => setShareData(null)} aria-label="Cerrar"><X size={18} /></button>
            <p className="eyebrow">Invitación privada</p>
            <h2 id="share-title">Compartir invitación</h2>
            <p>Envía la invitación de {shareData.invitation.name} por correo, mensaje de texto o copia el enlace.</p>
            <div className="share-options">
              <a href={`mailto:?subject=${encodeURIComponent(`Invitación para ${shareData.invitation.name}`)}&body=${encodeURIComponent(`Te invitamos a celebrar nuestra boda. Abre aquí tu invitación privada:\n\n${shareData.url}`)}`}><Mail size={18} /> Correo</a>
              <a href={`sms:?&body=${encodeURIComponent(`Te invitamos a celebrar nuestra boda. Abre aquí tu invitación privada: ${shareData.url}`)}`}><MessageCircle size={18} /> Mensaje</a>
              <button type="button" onClick={copySharedLink}>{copiedInvitationId === shareData.invitation.id ? <Check size={18} /> : <Copy size={18} />} {copiedInvitationId === shareData.invitation.id ? 'Copiado' : 'Copiar enlace'}</button>
            </div>
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
    const previousLanguage = document.documentElement.lang
    document.documentElement.lang = 'es'
    return () => { document.documentElement.lang = previousLanguage }
  }, [])

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
