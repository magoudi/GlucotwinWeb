import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { processLocalPayment } from '../lib/subscriptionApi'

export function PaymentPage() {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  // Validation State
  const [fieldErrors, setFieldErrors] = useState<{ cardNumber?: string; expiryDate?: string; cvv?: string }>({})

  function validateForm(): boolean {
    const errors: { cardNumber?: string; expiryDate?: string; cvv?: string } = {}
    let isValid = true

    // Visa starts with 4, typically 16 digits
    const cleanNumber = cardNumber.replace(/\D/g, '')
    if (cleanNumber.length !== 16 || !cleanNumber.startsWith('4')) {
      errors.cardNumber = 'Please enter a valid 16-digit Visa card number starting with 4.'
      isValid = false
    }

    // Expiry Date (MM/YY)
    const expRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/
    const expMatch = expiryDate.match(expRegex)
    if (!expMatch) {
      errors.expiryDate = 'Format must be MM/YY.'
      isValid = false
    } else {
      const month = parseInt(expMatch[1], 10)
      const year = parseInt(`20${expMatch[2]}`, 10)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Card has expired.'
        isValid = false
      }
    }

    // CVV
    const cleanCvv = cvv.replace(/\D/g, '')
    if (cleanCvv.length !== 3) {
      errors.cvv = 'CVV must be 3 digits.'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return

    if (!packageId) {
      setError('Missing package ID.')
      return
    }

    setLoading(true)
    try {
      await processLocalPayment(packageId)
      navigate('/subscription/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Secure Checkout"
        description="Enter your Visa card details to complete your subscription. This is a secure, simulated payment page."
      />

      <div className="mx-auto mt-8 max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-[#0B1120]/60 p-8 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <h2 className="mb-6 text-xl font-extrabold text-white">Payment Information</h2>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-300">Name on Card</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-300">Visa Card Number</label>
              <input
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  // Format as XXXX XXXX XXXX XXXX
                  let val = e.target.value.replace(/\D/g, '')
                  val = val.match(/.{1,4}/g)?.join(' ') || val
                  setCardNumber(val)
                }}
                placeholder="4000 1234 5678 9010"
                className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-1 ${fieldErrors.cardNumber ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500'}`}
              />
              {fieldErrors.cardNumber && <p className="mt-1.5 text-xs font-bold text-red-400">{fieldErrors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-300">Expiry Date</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={expiryDate}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length >= 3) {
                      val = val.slice(0, 2) + '/' + val.slice(2, 4)
                    }
                    setExpiryDate(val)
                  }}
                  placeholder="MM/YY"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-1 ${fieldErrors.expiryDate ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500'}`}
                />
                {fieldErrors.expiryDate && <p className="mt-1.5 text-xs font-bold text-red-400">{fieldErrors.expiryDate}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-300">CVV</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-1 ${fieldErrors.cvv ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-cyan-500 focus:ring-cyan-500'}`}
                />
                {fieldErrors.cvv && <p className="mt-1.5 text-xs font-bold text-red-400">{fieldErrors.cvv}</p>}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 pt-4">
              <Link to="/subscription" className="text-sm font-bold text-slate-400 hover:text-white">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
