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
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        title={visible ? 'Hide password' : 'Show password'}
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
        <div><p className="eyebrow">Annie &amp; Jonathan</p><h1>Everything that matters,<br /><em>all in one place.</em></h1></div>
        <p className="login-quote">“Love is not seen, it is felt.”</p>
      </section>
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-logo"><BrandMark /></div>
          <p className="eyebrow">Private area</p>
          <h2>Welcome</h2>
          <p>Sign in to view your guests' responses.</p>
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required placeholder="admin@example.com" /></label>
          <label>Password<PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••••••" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="admin-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
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
      setError('The new passwords do not match.')
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
      <p>{forced ? 'For security, replace your temporary password before entering the dashboard.' : 'Enter your current password and choose a new one.'}</p>
      {!forced && <label>Current password<PasswordInput value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label>}
      <label>New password<PasswordInput value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /><small>At least 12 characters</small></label>
      <label>Confirm new password<PasswordInput value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength="12" maxLength="128" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="admin-button" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
      {!forced && <button type="button" className="text-button" onClick={onCancel}>Cancel</button>}
    </form>
  )
}

function ForcedPasswordChange({ admin, onChanged, onLogout }) {
  return (
    <main className="admin-login">
      <section className="login-art">
        <BrandMark light />
        <div><p className="eyebrow">Protected account</p><h1>Your security<br /><em>comes first.</em></h1></div>
        <p className="login-quote">Signed in as {admin.email}</p>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <div className="mobile-logo"><BrandMark /></div>
          <p className="eyebrow">Update required</p>
          <h2>Create your password</h2>
          <PasswordForm forced onChanged={onChanged} />
          <button className="text-button forced-logout" onClick={onLogout}>Sign out</button>
        </div>
      </section>
    </main>
  )
}

const statConfig = [
  ['total', 'all', 'All guests', <Users size={20} />],
  ['yes', 'yes', 'Attending', <Check size={20} />],
  ['no', 'no', 'Not attending', <X size={20} />],
  ['pending', 'pending', 'Pending', <Clock3 size={20} />],
]

function DecisionBadge({ decision }) {
  const labels = { yes: 'Attending', no: 'Not attending', pending: 'Pending' }
  return <span className={`decision decision--${decision}`}>{labels[decision]}</span>
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
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
    const confirmed = window.confirm(`Hide ${invitation.name}'s invitation? The link will stop working, but the data will not be deleted.`)
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

      const confirmed = window.confirm(`${invitation.name}'s link was created before links could be recovered. Generate a new one? The previous link will stop working.`)
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
        title: `Invitation for ${invitation.name}`,
        text: 'We invite you to celebrate our wedding. Open your private invitation here:',
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
        <div className="sidebar-title"><span>Wedding dashboard</span></div>
        <nav><button className="active"><Heart size={18} /> Invitations</button></nav>
        <div className="admin-user"><span>{admin.email.slice(0, 1).toUpperCase()}</span><div><strong>Administrator</strong><small>{admin.email}</small></div></div>
        <div className="sidebar-account-actions">
          <button onClick={() => setPasswordOpen(true)}><KeyRound size={17} /> Change password</button>
          <button onClick={onLogout}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div><p className="eyebrow">Wedding dashboard</p><h1>Guests</h1><p>View and manage your guests' responses.</p></div>
          <div className="dashboard-header-actions">
            <button className="refresh-button" onClick={load} disabled={refreshing}><RefreshCw size={16} className={refreshing ? 'spin' : ''} /> Refresh</button>
            <button className="new-invitation-button" onClick={() => setCreatorOpen(true)}><Plus size={16} /> New invitation</button>
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
            <div><h2>Guest list</h2><p>{invitations.length} results</p></div>
            <div className="toolbar-actions">
              <label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guests" /></label>
            </div>
          </div>
          {error && <div className="dashboard-error">{error} <button onClick={load}>Try again</button></div>}
          {!error && !data && <div className="table-loading">Loading responses…</div>}
          {data && (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Guest</th><th>Status</th><th>Responded</th><th>Actions</th></tr></thead>
                <tbody>
                  {invitations.map((item) => (
                    <tr key={item.id}>
                      <td><div className="guest-name"><span>{item.name.slice(0, 1).toUpperCase()}</span><strong>{item.name}</strong></div></td>
                      <td><DecisionBadge decision={item.decision} /></td>
                      <td>{formatDate(item.respondedAt)}</td>
                      <td>
                        <div className="invitation-actions">
                          <button type="button" onClick={() => copyInvitationLink(item)} disabled={linkActionId === item.id} aria-label={`Copy ${item.name}'s link`} title={copiedInvitationId === item.id ? 'Link copied' : 'Copy link'}>{copiedInvitationId === item.id ? <Check size={15} /> : <Copy size={15} />}</button>
                          <button type="button" onClick={() => shareInvitation(item)} disabled={linkActionId === item.id} aria-label={`Share ${item.name}'s invitation`} title="Share invitation"><Share2 size={15} /></button>
                          <button type="button" onClick={() => openEditor(item)} aria-label={`Edit ${item.name}'s name`} title="Edit name"><Pencil size={15} /></button>
                          <button type="button" className="hide-invitation" onClick={() => hideInvitation(item)} disabled={hidingId === item.id} aria-label={`Hide ${item.name}'s invitation`} title="Hide invitation"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!invitations.length && <div className="empty-table">No guests match your search.</div>}
            </div>
          )}
        </section>
      </section>

      {creatorOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCreator()}>
          <section className="invitation-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <button className="modal-close" onClick={closeCreator} aria-label="Close"><X size={18} /></button>
            <p className="eyebrow">Private invitation</p>
            <h2 id="create-title">Create invitation</h2>
            {!createdUrl ? (
              <form onSubmit={createInvitation}>
                <p>Enter the name exactly as you want it to appear on the invitation.</p>
                <label>Guest name<input autoFocus value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="e.g. The Smith Family" minLength="2" maxLength="120" required /></label>
                {createError && <p className="form-error" role="alert">{createError}</p>}
                <button className="admin-button" disabled={creating}>{creating ? 'Creating…' : 'Create private link'}</button>
              </form>
            ) : (
              <div className="created-invitation">
                <span className="created-check"><Check size={24} /></span>
                <h3>Invitation created</h3>
                <p>Copy the link and send it to the guest. You can also copy or share it later from the list.</p>
                <div className="created-link"><input readOnly value={createdUrl} /><button onClick={copyCreatedUrl}><Copy size={16} /> {copied ? 'Copied' : 'Copy'}</button></div>
                <button className="text-button" onClick={() => setCreatedUrl('')}>Create another invitation</button>
              </div>
            )}
          </section>
        </div>
      )}

      {passwordOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordOpen(false)}>
          <section className="invitation-modal password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
            <button className="modal-close" onClick={() => setPasswordOpen(false)} aria-label="Close"><X size={18} /></button>
            <p className="eyebrow">Account security</p>
            <h2 id="password-title">Change password</h2>
            <PasswordForm onCancel={() => setPasswordOpen(false)} onChanged={(value) => { onAdminChange(value); setPasswordOpen(false) }} />
          </section>
        </div>
      )}

      {editingInvitation && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
          <section className="invitation-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <button className="modal-close" onClick={closeEditor} aria-label="Close"><X size={18} /></button>
            <p className="eyebrow">Private invitation</p>
            <h2 id="edit-title">Edit name</h2>
            <form onSubmit={saveInvitationName}>
              <p>The new name will appear when the guest opens their invitation link.</p>
              <label>Guest name<input autoFocus value={editedName} onChange={(event) => setEditedName(event.target.value)} minLength="2" maxLength="120" required /></label>
              {editError && <p className="form-error" role="alert">{editError}</p>}
              <button className="admin-button" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save changes'}</button>
              <button type="button" className="text-button modal-cancel" onClick={closeEditor} disabled={savingEdit}>Cancel</button>
            </form>
          </section>
        </div>
      )}

      {shareData && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShareData(null)}>
          <section className="invitation-modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <button className="modal-close" onClick={() => setShareData(null)} aria-label="Close"><X size={18} /></button>
            <p className="eyebrow">Private invitation</p>
            <h2 id="share-title">Share invitation</h2>
            <p>Send {shareData.invitation.name}'s invitation by email or text message, or copy the link.</p>
            <div className="share-options">
              <a href={`mailto:?subject=${encodeURIComponent(`Invitation for ${shareData.invitation.name}`)}&body=${encodeURIComponent(`We invite you to celebrate our wedding. Open your private invitation here:\n\n${shareData.url}`)}`}><Mail size={18} /> Email</a>
              <a href={`sms:?&body=${encodeURIComponent(`We invite you to celebrate our wedding. Open your private invitation here: ${shareData.url}`)}`}><MessageCircle size={18} /> Text message</a>
              <button type="button" onClick={copySharedLink}>{copiedInvitationId === shareData.invitation.id ? <Check size={18} /> : <Copy size={18} />} {copiedInvitationId === shareData.invitation.id ? 'Copied' : 'Copy link'}</button>
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
    document.documentElement.lang = 'en'
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
