"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function GetTokenPage() {
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extensionStatus, setExtensionStatus] = useState<'checking' | 'ready' | 'sending' | 'sent' | 'not_found' | 'error'>('checking')
  const [extensionError, setExtensionError] = useState<string | null>(null)

  // Listen for messages from the extension content script
  const handleExtensionMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== window.location.origin) return

    const data = event.data
    if (!data || data.source !== 'pulse-extension-response') return

    console.log('Received from extension:', data)

    if (data.action === 'ready') {
      setExtensionStatus('ready')
    } else if (data.action === 'tokenSent') {
      if (data.success) {
        setExtensionStatus('sent')
        setExtensionError(null)
      } else {
        setExtensionStatus('error')
        setExtensionError(data.error || 'Failed to send token')
      }
    }
  }, [])

  useEffect(() => {
    // Listen for extension messages
    window.addEventListener('message', handleExtensionMessage)

    // Check for extension after a short delay
    const checkTimer = setTimeout(() => {
      if (extensionStatus === 'checking') {
        setExtensionStatus('not_found')
      }
    }, 2000)

    return () => {
      window.removeEventListener('message', handleExtensionMessage)
      clearTimeout(checkTimer)
    }
  }, [handleExtensionMessage, extensionStatus])

  useEffect(() => {
    const getToken = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          setError("You are not logged in. Please log in first.")
          return
        }

        setToken(session.access_token)
      } catch (err: any) {
        setError(err.message || "Failed to get token")
      }
    }

    getToken()
  }, [])

  // Auto-send token when both token and extension are ready
  useEffect(() => {
    if (token && extensionStatus === 'ready') {
      sendTokenToExtension()
    }
  }, [token, extensionStatus])

  const sendTokenToExtension = () => {
    if (!token) return

    setExtensionStatus('sending')

    // Send token to content script via postMessage
    window.postMessage({
      source: 'pulse-app-auth',
      action: 'sendToken',
      token: token
    }, window.location.origin)

    // Timeout fallback
    setTimeout(() => {
      if (extensionStatus === 'sending') {
        setExtensionStatus('not_found')
      }
    }, 3000)
  }

  const copyToClipboard = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyExtensionCommand = async () => {
    if (token) {
      const command = `chrome.storage.local.set({ authToken: '${token}' });`
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusDisplay = () => {
    switch (extensionStatus) {
      case 'checking':
        return { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: 'Looking for extension...', color: 'text-muted-foreground' }
      case 'ready':
        return { icon: <RefreshCw className="w-5 h-5" />, text: 'Extension found! Sending token...', color: 'text-blue-500' }
      case 'sending':
        return { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: 'Sending token to extension...', color: 'text-blue-500' }
      case 'sent':
        return { icon: <CheckCircle className="w-5 h-5" />, text: 'Token sent successfully! You can close this page.', color: 'text-green-500' }
      case 'error':
        return { icon: <XCircle className="w-5 h-5" />, text: extensionError || 'Error sending token', color: 'text-red-500' }
      case 'not_found':
        return { icon: <XCircle className="w-5 h-5" />, text: 'Extension not detected. Use manual method below.', color: 'text-yellow-500' }
      default:
        return { icon: null, text: '', color: '' }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <Card className="p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-foreground mb-4">Extension Authentication</h1>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="mt-2"
            >
              Go to Login
            </Button>
          </div>
        )}

        {token ? (
          <div className="space-y-4">
            {/* Status Display */}
            <div className={`p-4 rounded-lg border ${extensionStatus === 'sent' ? 'bg-green-500/10 border-green-500/30' :
                extensionStatus === 'error' || extensionStatus === 'not_found' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
              }`}>
              <div className={`flex items-center gap-3 ${status.color}`}>
                {status.icon}
                <span className="font-medium">{status.text}</span>
              </div>

              {extensionStatus === 'sent' && (
                <p className="text-sm text-muted-foreground mt-2">
                  The extension is now connected. Click "Refresh Settings" in the extension popup to load your settings.
                </p>
              )}

              {(extensionStatus === 'not_found' || extensionStatus === 'error') && (
                <Button
                  onClick={sendTokenToExtension}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Manual Method - shown when extension not found */}
            {(extensionStatus === 'not_found' || extensionStatus === 'error') && (
              <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-3">Manual Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Click the PULSE AI extension icon in Chrome</li>
                  <li>Right-click on the popup and select "Inspect"</li>
                  <li>Go to the Console tab</li>
                  <li>Copy and paste the command below, then press Enter</li>
                </ol>
                <div className="mt-3 p-3 bg-background rounded border border-border">
                  <code className="text-xs font-mono break-all block max-h-20 overflow-auto">
                    {`chrome.storage.local.set({ authToken: '${token}' });`}
                  </code>
                  <Button
                    onClick={copyExtensionCommand}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {copied ? <><Check className="w-4 h-4 mr-2" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Command</>}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  After running the command, click "Refresh Settings" in the extension popup.
                </p>
              </div>
            )}

            {/* Token Display (collapsed by default) */}
            <details className="p-4 bg-secondary/30 border border-border rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                View Raw Token
              </summary>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={token}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-xs font-mono truncate"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </details>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-600">
                <strong>Note:</strong> Tokens expire after some time. If the extension stops working, return to this page to get a new token.
              </p>
            </div>
          </div>
        ) : !error && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your authentication...</p>
          </div>
        )}
      </Card>
    </div>
  )
}
