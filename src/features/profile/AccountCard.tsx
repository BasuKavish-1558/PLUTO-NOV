import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CloudCheck, CloudOff, LogOut, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSyncStore } from '@/data/sync/sync-store'
import { deleteAccount, signOut, unsentChangeCount } from '@/features/auth/session'

function SyncStatus() {
  const { status, pending, failed } = useSyncStore()
  const [Icon, text] =
    failed > 0
      ? [TriangleAlert, `${failed} change${failed === 1 ? '' : 's'} couldn’t be saved`]
      : status === 'offline'
        ? [
            CloudOff,
            pending ? `Offline · ${pending} change${pending === 1 ? '' : 's'} waiting` : 'Offline',
          ]
        : status === 'syncing' || pending > 0
          ? [RefreshCw, 'Saving…']
          : [CloudCheck, 'All changes saved']
  return (
    <p className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
      <Icon className="size-4" /> {text}
    </p>
  )
}

/** P-5: sign out, and delete the account with all its data. */
export function AccountCard() {
  const navigate = useNavigate()
  const [confirmSignOut, setConfirmSignOut] = useState<number | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSignOut() {
    setBusy(true)
    const unsent = await unsentChangeCount()
    setBusy(false)
    if (unsent > 0) return setConfirmSignOut(unsent)
    await doSignOut()
  }

  async function doSignOut() {
    await signOut()
    navigate('/auth?mode=sign-in', { replace: true })
  }

  async function onDelete() {
    setBusy(true)
    setError(null)
    const result = await deleteAccount()
    setBusy(false)
    if (!result.ok) return setError(result.message)
    navigate('/auth', { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SyncStatus />
        <Button variant="outline" onClick={() => void onSignOut()} disabled={busy}>
          <LogOut /> Sign out
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          Delete account
        </Button>
      </CardContent>

      <Dialog open={confirmSignOut !== null} onOpenChange={(o) => !o && setConfirmSignOut(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out with unsaved changes?</DialogTitle>
            <DialogDescription>
              {confirmSignOut} change{confirmSignOut === 1 ? ' hasn’t' : 's haven’t'} reached the
              server yet, probably because you’re offline. Signing out now discards{' '}
              {confirmSignOut === 1 ? 'it' : 'them'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmSignOut(null)}>
              Stay signed in
            </Button>
            <Button variant="destructive" onClick={() => void doSignOut()}>
              Sign out anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o)
          setTyped('')
          setError(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your profile, body vitals, workouts, PRs, nutrition logs and
              every photo. It can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
            <Input
              id="confirm-delete"
              autoComplete="off"
              autoCapitalize="characters"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={typed.trim().toUpperCase() !== 'DELETE' || busy}
              onClick={() => void onDelete()}
            >
              {busy ? 'Deleting…' : 'Delete everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
