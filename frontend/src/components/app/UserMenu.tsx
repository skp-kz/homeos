import { useNavigate } from '@tanstack/react-router'
import {
  ChevronUp,
  Link2,
  LogOut,
  Settings,
} from 'lucide-react'
import { useLogout, useMe } from '../../lib/queries/auth'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

// Sidebar-footer slot: opens a dropdown anchored on the current username with
// Settings (stub for M6.4) and Sign out. Bottom-anchored so the menu pops up
// rather than off the bottom edge.
export function UserMenu() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const user = me.data ?? null
  const feedbackUnseen = user?.feedback_unseen ?? 0
  async function handleSignOut() {
    try {
      await logout.mutateAsync()
    } catch {
      // Even if the network call fails the cache was reset onSettled, so the
      // user already looks signed out locally — just push them to /login.
    }
    void navigate({ to: '/login' })
  }

  if (!user) return null

  return (
    <div className="border-t border-[var(--border-subtle)] py-[var(--space-3)] px-[var(--space-3)] shrink-0 flex flex-col gap-[var(--space-2)]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-[var(--space-2)]"
            aria-label={`Account menu for ${user.username}`}
          >
            <span className="flex-1 text-left truncate">{user.username}</span>
            {feedbackUnseen > 0 ? (
              <span
                aria-label={`${feedbackUnseen} unread feedback`}
                className="size-[var(--space-2)] shrink-0 rounded-full bg-[var(--accent)]"
              />
            ) : null}
            <ChevronUp width={14} height={14} aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-[14rem]">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              void navigate({ to: '/shared' })
            }}
          >
            <Link2 width={14} height={14} /> Shared
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              // When there's unseen feedback, land directly on the Feedback tab
              // (where the badge lives) so the dot isn't a dead end at Profile.
              void navigate({
                to: '/settings',
                search: feedbackUnseen > 0 ? { tab: 'feedback' } : {},
              })
            }}
          >
            <Settings width={14} height={14} /> Settings
            {feedbackUnseen > 0 ? (
              <Badge variant="accent" className="ml-auto">
                {feedbackUnseen}
              </Badge>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              void handleSignOut()
            }}
          >
            <LogOut width={14} height={14} /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
