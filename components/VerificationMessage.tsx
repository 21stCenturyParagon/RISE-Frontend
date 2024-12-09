import React from 'react'
import { Button } from "@/components/ui/button"

interface VerificationMessageProps {
  email: string
  onContinue: () => void
}

const VerificationMessage: React.FC<VerificationMessageProps> = ({ email, onContinue }) => {
  return (
    <div className="text-center mt-6">
      <h2 className="text-xl font-semibold mb-2">Verify Your Email</h2>
      <p className="mb-4">
        We've sent a verification email to <strong>{email}</strong>.
        Please check your inbox and click the verification link to activate your account.
      </p>
      <Button onClick={onContinue} className="w-full bg-[#1C7C54] hover:bg-[#041E3A] text-white">
        Continue to Login
      </Button>
    </div>
  )
}

export default VerificationMessage

