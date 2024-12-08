'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react'
import { Question, getProfile, ProfileData } from '@/lib/api'
import QuestionContent from '@/components/QuestionContent'
import { SolutionDialog } from '@/components/SolutionDialog'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface QuestionResponse extends Question {
  solution: string;
  solution_image: string | null;
}

async function getQuestion(id: string): Promise<QuestionResponse> {
  const response = await fetch(`https://rise-mks9.onrender.com/api/v1/questions/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }

  return response.json();
}

async function submitAnswer(questionId: number, selectedAnswer: string, timeTaken: number, isCorrect: boolean) {
  const response = await fetch('https://rise-mks9.onrender.com/api/v1/progress/attempt', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_id: questionId,
      selected_answer: selectedAnswer,
      time_taken: timeTaken,
      is_correct: isCorrect
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }

  return response.json();
}

function useTimer() {
  const [time, setTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return time
}

function Timer() {
  const time = useTimer()

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-2 border rounded-lg p-3 bg-white">
      <Clock className="h-5 w-5" />
      <div>
        <div className="text-sm text-gray-500">Time Spent</div>
        <div className="font-mono">{formatTime(time)}</div>
      </div>
    </div>
  )
}

export default function QuestionPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<QuestionResponse | null>(null)
  const [parsedOptions, setParsedOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const router = useRouter()
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [isSolutionOpen, setIsSolutionOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const time = useTimer()

  const fetchProfileData = useCallback(async () => {
    try {
      const data = await getProfile()
      setProfileData(data)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    async function fetchData() {
      setIsLoading(true)
      try {
        const [questionData, profileData] = await Promise.all([
          getQuestion(params.id),
          getProfile()
        ])
        setQuestion(questionData)
        setProfileData(profileData)
        if (questionData.q_type !== 2) {
          setParsedOptions(
            questionData.options.split('\n')
              .map(option => option.trim())
              .filter(option => option.length > 0)
          )
        }
        setSelectedAnswer('')
        setSubmittedAnswer(null)
        setIsAnswerCorrect(null)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError('Failed to load question. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleSubmit = useCallback(async () => {
    if (!selectedAnswer || !question) return;

    const optionIndex = parsedOptions.findIndex(option => option === selectedAnswer);
    const selectedOption = String.fromCharCode(65 + optionIndex);
    const isCorrect = selectedOption === question.correct_answer;

    try {
      setIsSubmitting(true)
      await submitAnswer(question.ques_number, selectedOption, time, isCorrect)
      await fetchProfileData()
      setSubmittedAnswer(selectedAnswer)
      setIsAnswerCorrect(isCorrect)
    } catch (error) {
      console.error('Failed to submit answer:', error)
      setError('Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedAnswer, question, parsedOptions, time, fetchProfileData])

  const handleSelectAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer)
  }, [])

  const handleNext = useCallback(() => {
    router.push(`/questions/${parseInt(params.id) + 1}`)
  }, [router, params.id])

  const { totalCorrect, totalIncorrect } = useMemo(() => {
    if (!profileData) return { totalCorrect: 0, totalIncorrect: 0 };
    const totalCorrect = profileData.stats.easy.correct + profileData.stats.medium.correct + profileData.stats.hard.correct;
    const totalQuestions = profileData.stats.easy.total + profileData.stats.medium.total + profileData.stats.hard.total;
    const totalIncorrect = totalQuestions - totalCorrect;
    return { totalCorrect, totalIncorrect };
  }, [profileData])

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">
          <AlertTriangle className="h-6 w-6 inline mr-2" />
          {error}
        </div>
      </div>
    )
  }

  if (isLoading || !question || !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-1/3 max-w-md">
          <DotLottieReact
            src="https://lottie.host/9290c9bb-b2b7-4460-8f64-c99423ae2ce8/Zs8Aq8WC9P.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Image
              src="https://framerusercontent.com/images/q2DtVdC1E9IpHsCozasAYSAAlY.png"
              alt="RISE Logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-[#041E3A]">TMUA | Question {question.ques_number}</h1>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {question.difficulty}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {question.topic}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              {question.source}
            </span>
          </div>
        </div>

        <QuestionContent
          question={question}
          parsedOptions={parsedOptions}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={handleSelectAnswer}
          submittedAnswer={submittedAnswer}
          isAnswerCorrect={isAnswerCorrect}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className={`w-80 bg-white border-l border-[#bcc8cc] flex flex-col ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="p-6 flex-1 flex flex-col">
          <div className="space-y-6 flex-grow">
            <Timer />
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-[#041E3A]">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                {totalCorrect} correct
              </Button>
              <Button variant="outline" className="w-full justify-start text-[#041E3A]">
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                {totalIncorrect} incorrect
              </Button>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => router.push('/dashboard')} disabled={isSubmitting}>
              <LogOut className="h-4 w-4 mr-2" />
              End Test
            </Button>
          </div>
        </div>
        <div className="p-6 border-t border-[#bcc8cc]">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full text-[#041E3A]"
              onClick={() => router.push(`/questions/${parseInt(params.id) + 1}`)}
              disabled={isLoading || isSubmitting}
            >
              Next
            </Button>
            <Button
              className="w-full bg-[#1C7C54] hover:bg-[#041E3A] text-white"
              onClick={handleSubmit}
              disabled={!selectedAnswer || isLoading || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (submittedAnswer ? 'Resubmit' : 'Submit')}
            </Button>
            <Button
              variant="outline"
              className="w-full text-[#041E3A]"
              onClick={() => setIsSolutionOpen(true)}
              disabled={isLoading || isSubmitting}
            >
              View Solution
            </Button>
          </div>
        </div>
      </div>

      <SolutionDialog
        isOpen={isSolutionOpen}
        onOpenChange={setIsSolutionOpen}
        solution={question.solution}
        solutionImage={question.solution_image}
      />
    </div>
  )
}

