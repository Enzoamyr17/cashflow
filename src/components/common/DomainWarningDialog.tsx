"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const NEW_DOMAIN = "flow.gregorio-dev.cloud"
const SESSION_KEY = "domain-warning-shown"

export function DomainWarningDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") return

    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem(SESSION_KEY)
    if (alreadyShown) return

    // Check if current domain is NOT the new domain
    const hostname = window.location.hostname
    if (hostname !== NEW_DOMAIN) {
      setOpen(true)
      sessionStorage.setItem(SESSION_KEY, "true")
    }
  }, [])

  const handleRedirect = () => {
    const currentPath = window.location.pathname
    const currentSearch = window.location.search
    const newUrl = `https://${NEW_DOMAIN}${currentPath}${currentSearch}`
    window.location.href = newUrl
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Domain Update Notice</AlertDialogTitle>
          <AlertDialogDescription>
            We&apos;ve moved to a new domain! Please update your bookmarks and
            start using <span className="font-semibold"><a href={`https://${NEW_DOMAIN}`} className="text-blue-500 hover:underline">{NEW_DOMAIN}</a></span>.
            <br />
            <br />
            This domain will be discontinued soon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)} className="bg-transparent border border-zinc-600 text-zinc-600 hover:text-zinc-800 hover:bg-transparent">
            Remind Me Later
          </AlertDialogAction>
          <AlertDialogAction onClick={handleRedirect}>
            Go to New Domain
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
