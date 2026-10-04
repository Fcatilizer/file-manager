import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Icon } from './Icon'
import Modal from './Modal'
import ChangePasswordModal from './ChangePasswordModal'
import {
  createUser,
  deleteUser,
  listUsers,
  type SessionUser,
  type UserRole,
} from '../lib/api'

type Props = {
  currentUser: SessionUser
  onClose: () => void
  onToast: (message: string, type?: 'success' | 'error') => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function UsersModal({ currentUser, onClose, onToast }: Props) {
  const [users, setUsers] = useState<SessionUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<SessionUser | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setUsers(await listUsers())
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load users')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setFormError(null)

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)
    try {
      const created = await createUser(email.trim(), password, role)
      setUsers((prev) => [...prev, created])
      setEmail('')
      setPassword('')
      setRole('user')
      onToast(`Added ${created.email}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add user')
    }
    setSubmitting(false)
  }

  const handleDelete = async (user: SessionUser) => {
    if (!confirm(`Remove user "${user.email}"? They will lose access immediately.`)) return
    setBusyId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      onToast(`Removed ${user.email}`)
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to remove user', 'error')
    }
    setBusyId(null)
  }

  const adminCount = users.filter((u) => u.role === 'admin').length

  return (
    <>
      <Modal onClose={onClose} className="users-modal" overlayClassName="modal-overlay--fullscreen">
      {/* Header */}
      <div className="users-modal__header">
        <div className="users-modal__title">
          <Icon name="users" size={16} />
          <span>Users</span>
          {!loading && <span className="users-modal__count">{users.length}</span>}
        </div>
        <button className="btn btn--icon" title="Close (Esc)" onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      </div>

        {/* Add user */}
        <form className="users-add" onSubmit={handleAdd}>
          <div className="users-add__row">
            <input
              className="auth__input"
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth__input"
              type="password"
              placeholder="Password (min 8)"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              className="bucket-select users-add__role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              title="Role"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? <span className="spinner spinner--sm" /> : <Icon name="userPlus" size={14} />}
              Add
            </button>
          </div>
          {formError && <div className="users-add__error">{formError}</div>}
        </form>

        {/* List */}
        <div className="users-list">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Loading…
            </div>
          ) : loadError ? (
            <div className="users-empty">{loadError}</div>
          ) : users.length === 0 ? (
            <div className="users-empty">No users yet</div>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUser.id
              const isLastAdmin = u.role === 'admin' && adminCount <= 1
              const deleteDisabled = isSelf || isLastAdmin
              return (
                <div key={u.id} className="user-row">
                  <span className="user-row__avatar">{u.email.charAt(0).toUpperCase()}</span>
                  <div className="user-row__info">
                    <div className="user-row__email">
                      {u.email}
                      {isSelf && <span className="user-row__you">You</span>}
                    </div>
                    <div className="user-row__meta">Joined {formatDate(u.createdAt)}</div>
                  </div>
                  <span className={`role-badge role-badge--${u.role}`}>
                    {u.role === 'admin' && <Icon name="shield" size={11} />}
                    {u.role}
                  </span>
                  <div className="user-row__actions">
                    <button
                      className="btn btn--icon"
                      title={isSelf ? 'Change your password' : `Reset password for ${u.email}`}
                      onClick={() => setPasswordTarget(u)}
                      type="button"
                    >
                      <Icon name="key" size={14} />
                    </button>
                    <button
                      className="btn btn--icon danger"
                      title={
                        isSelf
                          ? 'You cannot delete your own account'
                          : isLastAdmin
                            ? 'Cannot delete the last admin'
                            : 'Remove user'
                      }
                      disabled={deleteDisabled}
                      onClick={() => handleDelete(u)}
                      type="button"
                    >
                      {busyId === u.id ? (
                        <span className="spinner spinner--sm" />
                      ) : (
                        <Icon name="trash" size={14} />
                      )}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Modal>

      {passwordTarget && (
        <ChangePasswordModal
          currentUser={currentUser}
          targetUser={passwordTarget}
          onClose={() => setPasswordTarget(null)}
          onToast={onToast}
        />
      )}
    </>
  )
}
