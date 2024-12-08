import React, { useCallback } from 'react'
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { LatexRenderer } from '@/components/LatexRenderer'
import { cn } from "@/lib/utils"

interface QuestionOptionProps {
  option: string
  index: number
  isSelected: boolean
  isSubmitted: boolean
  isCorrect: boolean | null
  onSelect: (option: string) => void
  disabled: boolean
}

const QuestionOption: React.FC<QuestionOptionProps> = React.memo(({
  option,
  index,
  isSelected,
  isSubmitted,
  isCorrect,
  onSelect,
  disabled
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(option)
    }
  }, [onSelect, option, disabled])

  return (
    <div
      className={cn(
        "flex items-center space-x-2 p-4 border rounded-lg",
        isSubmitted && isSelected && isCorrect && "bg-green-100 border-green-500",
        isSubmitted && isSelected && !isCorrect && "bg-red-100 border-red-500",
        !isSubmitted && "hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      <RadioGroupItem value={option} id={`option-${index}`} checked={isSelected} disabled={disabled} />
      <Label htmlFor={`option-${index}`} className={`flex-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <LatexRenderer content={option} inline={true} />
      </Label>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.option === nextProps.option &&
    prevProps.index === nextProps.index &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSubmitted === nextProps.isSubmitted &&
    prevProps.isCorrect === nextProps.isCorrect &&
    prevProps.disabled === nextProps.disabled
  )
})

QuestionOption.displayName = 'QuestionOption'

export default QuestionOption

