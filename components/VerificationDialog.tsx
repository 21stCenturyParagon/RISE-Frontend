import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface VerificationDialogProps {
  isOpen: boolean
  email: string
  onContinue: () => void
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({ isOpen, email, onContinue }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a verification email to <strong>{email}</strong>.
            Please check your inbox and click the verification link to activate your account.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button onClick={onContinue} className="w-full bg-[#1C7C54] hover:bg-[#041E3A] text-white">
            Continue to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default VerificationDialog

