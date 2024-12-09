import React, { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { LatexRenderer } from '@/components/LatexRenderer'
import { Question } from '@/lib/api'
import QuestionOption from './QuestionOption'

interface QuestionContentProps {
  question: Question;
  parsedOptions: string[];
  selectedAnswer: string;
  onSelectAnswer: (answer: string) => void;
  submittedAnswer: string | null;
  isAnswerCorrect: boolean | null;
  isSubmitting: boolean;
}

const QuestionContent: React.FC<QuestionContentProps> = React.memo(({
  question,
  selectedAnswer,
  onSelectAnswer,
  submittedAnswer,
  isAnswerCorrect,
  isSubmitting
}) => {
  const parsedOptions = useMemo(() => {
    if (question.q_type !== 2) {
      return question.options.split('\n')
        .map(option => option.trim())
        .filter(option => option.length > 0)
    }
    return []
  }, [question.options, question.q_type])

  const handleOptionSelect = useCallback((option: string) => {
    onSelectAnswer(option)
  }, [onSelectAnswer])

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <LatexRenderer content={question.question} />
        </div>

        {question.image && (
          <div className="mb-6">
            <Image
              src={question.image}
              alt="Question diagram"
              width={500}
              height={300}
              className="mx-auto"
            />
          </div>
        )}

        {question.q_type === 2 ? (
          <Textarea
            placeholder="Enter your answer..."
            value={selectedAnswer}
            onChange={(e) => onSelectAnswer(e.target.value)}
            className="w-full h-32 p-4"
          />
        ) : (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={onSelectAnswer}
            className={`space-y-4 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {parsedOptions.map((option, index) => (
              <QuestionOption
                key={index}
                option={option}
                index={index}
                isSelected={selectedAnswer === option}
                isSubmitted={submittedAnswer !== null}
                isCorrect={isAnswerCorrect}
                onSelect={handleOptionSelect}
                disabled={isSubmitting}
              />
            ))}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  )
})

QuestionContent.displayName = 'QuestionContent'

export default QuestionContent

