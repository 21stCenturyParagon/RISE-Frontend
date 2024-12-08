'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { loginUser } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await loginUser(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Background SVG */}
      <svg
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-rotate"
        width="500"
        height="500"
        viewBox="0 0 384 363"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M186.417 1.24787C92.9734 -5.66658 42.2935 72.6104 5.41705 158.748C-27.9349 236.653 101.589 174.567 151.917 242.748C234.667 354.851 363.167 423.748 382.417 285.748C397.064 180.749 292.143 9.07117 186.417 1.24787Z"
          fill="#1C7C54"
          fillOpacity="0.77"
        />
      </svg>

      {/* Login card */}
      <Card className="w-[400px] p-6 z-10 shadow-xl bg-white/70 backdrop-blur-md border border-[#bcc8cc]">
        <CardContent>
          <div className="flex justify-center mb-8">
            <Image
              src="https://framerusercontent.com/images/q2DtVdC1E9IpHsCozasAYSAAlY.png"
              alt="RISE Logo"
              width={120}
              height={40}
              className="h-12 w-auto"
              priority
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#bcc8cc]"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#bcc8cc]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#1C7C54] hover:bg-[#041E3A] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-[#001122]">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[#1C7C54] hover:underline">
              Sign up
            </Link>
          </p>
          <hr className="border-t border-[#bcc8cc] my-4" />
          <div className="space-y-2">
            <p>By signing in, you agree to RISE&apos;s{' '}
              <Link href="/privacy" className="text-[#1C7C54] hover:underline">
                Privacy Policy
              </Link>
            </p>
            <p>
              Got Questions?{' '}
              <Link href="/contact" className="text-[#1C7C54] hover:underline">
                Contact Us
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

