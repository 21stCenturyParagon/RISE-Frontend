import React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LatexRenderer } from '@/components/LatexRenderer'

interface SolutionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  solution: string
  solutionImage?: string | null
}

export function SolutionDialog({ isOpen, onOpenChange, solution, solutionImage }: SolutionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solution</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            <LatexRenderer content={solution} />
          </pre>
          {solutionImage && (
            <div className="mt-4">
              <Image
                src={solutionImage}
                alt="Solution diagram"
                width={500}
                height={300}
                className="mx-auto"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

