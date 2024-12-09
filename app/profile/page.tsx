'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getQuestions, getProfile, getFilters, Question, PaginatedResponse, Filters } from '@/lib/api'
import { Progress } from "@/components/ui/progress"
import { LatexRenderer } from '@/components/LatexRenderer'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Profile {
  user: {
    name: string;
    email: string;
  };
  stats: {
    easy: {
      total: number;
      correct: number;
    };
    medium: {
      total: number;
      correct: number;
    };
    hard: {
      total: number;
      correct: number;
    };
  };
  solved_questions: number;
}

function CircularProgress({ stats }: { stats: Profile['stats'] }) {
  const total = stats.easy.total + stats.medium.total + stats.hard.total;
  const solved = stats.easy.correct + stats.medium.correct + stats.hard.correct;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const calculatePercentage = (value: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const easyPercentage = calculatePercentage(stats.easy.correct);
  const mediumPercentage = calculatePercentage(stats.medium.correct);
  const hardPercentage = calculatePercentage(stats.hard.correct);

  const strokeDashoffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className="text-red-500"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset(easyPercentage + mediumPercentage + hardPercentage)}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className="text-yellow-500"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset(easyPercentage + mediumPercentage)}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className="text-green-500"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset(easyPercentage)}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">
          {solved}/{total}
        </span>
      </div>
    </div>
  );
}

function DifficultyProgress({ label, value, total, colorClass }: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const percentage = (value / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}/{total}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingPage, setChangingPage] = useState(false)
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Question>, 'items'>>({
    total: 0,
    page: 1,
    size: 10,
    total_pages: 0,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null,
  })
  const [selectedFilters, setSelectedFilters] = useState({
    difficulty: '',
    topic: '',
    source: '',
    status: 'correct,incorrect',
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    async function fetchData() {
      try {
        setChangingPage(true)
        const [questionsData, profileData, filtersData] = await Promise.all([
          getQuestions(pagination.page, pagination.size, selectedFilters),
          getProfile(),
          getFilters(),
        ])
        setQuestions(questionsData.items)
        setPagination({
          total: questionsData.total,
          page: questionsData.page,
          size: questionsData.size,
          total_pages: questionsData.total_pages,
          has_next: questionsData.has_next,
          has_previous: questionsData.has_previous,
          next_page: questionsData.next_page,
          previous_page: questionsData.previous_page,
        })
        setProfile(profileData)
        setFilters(filtersData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        if (error instanceof Error && error.message === 'No authentication token found') {
          router.push('/auth/login')
        }
      } finally {
        setLoading(false)
        setChangingPage(false)
      }
    }

    fetchData()
  }, [router, pagination.page, pagination.size, selectedFilters])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value === 'all' ? '' : value,
      status: 'correct,incorrect', // Always keep this filter
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when filter changes
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="text-green-500 w-6 h-6" />
      case 'incorrect':
        return <XCircle className="text-red-500 w-6 h-6" />
      default:
        return <BookOpen className="text-gray-500 w-6 h-6" />
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(pagination.total_pages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          onClick={() => handlePageChange(i)}
          className="mx-1"
          disabled={changingPage}
        >
          {i}
        </Button>
      )
    }

    return pageNumbers
  }

  if (loading || !profile) {
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

  const totalSolved = profile.stats.easy.correct + profile.stats.medium.correct + profile.stats.hard.correct;
  const totalQuestions = profile.stats.easy.total + profile.stats.medium.total + profile.stats.hard.total;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-[#041E3A] hover:text-[#001122]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-[#646265]">Your Profile</h1>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <Image
                  src="https://pathwayactivities.co.uk/wp-content/uploads/2016/04/Profile_avatar_placeholder_large-circle.png"
                  alt="Profile picture"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold text-[#041E3A]">{profile.user.name}</h2>
                  <p className="text-[#001122]">{profile.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-[#041E3A]">Questions Answered</h3>
                <CircularProgress stats={profile.stats} />
              </div>
            </div>
            <div className="space-y-4">
              <DifficultyProgress
                label="Easy"
                value={profile.stats.easy.correct}
                total={profile.stats.easy.total}
                colorClass="bg-green-500"
              />
              <DifficultyProgress
                label="Medium"
                value={profile.stats.medium.correct}
                total={profile.stats.medium.total}
                colorClass="bg-yellow-500"
              />
              <DifficultyProgress
                label="Hard"
                value={profile.stats.hard.correct}
                total={profile.stats.hard.total}
                colorClass="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#646265] mb-4">Attempted Questions</h2>
            <div className="flex flex-wrap gap-4 mb-6">
              <Select onValueChange={(value) => handleFilterChange('difficulty', value)} disabled={changingPage}>
                <SelectTrigger className="w-[180px] border-none bg-gray-100 px-4 py-2">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {filters?.difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('topic', value)} disabled={changingPage}>
                <SelectTrigger className="w-[180px] border-none bg-gray-100 px-4 py-2">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {filters?.topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('source', value)} disabled={changingPage}>
                <SelectTrigger className="w-[180px] border-none bg-gray-100 px-4 py-2">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {filters?.sources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {questions && questions.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                <div className="bg-white border-b-2 border-b-[#f6f7f9] px-4 py-3 sm:px-6 flex items-center font-medium text-sm text-gray-500">
                  <div className="w-16">Status</div>
                  <div className="flex-1">Question</div>
                  <div className="w-24 text-center">Difficulty</div>
                  <div className="w-24 text-center">Source</div>
                </div>
                <ul>
                  {questions.map((question, index) => (
                    <li
                      key={question.ques_number}
                      className={`question-list-item ${index % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'} group`}
                    >
                      <Link
                        href={`/questions/${question.ques_number}`}
                        className="block px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-16">
                            {getStatusIcon(question.status)}
                          </div>
                          <div className="min-w-0 flex-1 flex-grow">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#646265] group-hover:text-[#1C7C54] transition-colors duration-200 truncate question-preview">
                                {question.ques_number}.{' '}
                                <LatexRenderer
                                  content={question.question}
                                  className="inline"
                                  inline={true}
                                />
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {question.topic}
                            </div>
                          </div>
                          <div className="flex-shrink-0 w-24 text-center">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}>
                              {question.difficulty}
                            </span>
                          </div>
                          <div className="flex-shrink-0 w-24 text-center text-sm text-black">
                            {question.source}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[#001122]">No attempted questions available. Try solving some questions to see them here!</p>
            )}
            <div className="flex justify-center items-center space-x-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_previous || changingPage}
                className="bg-[#1C7C54] hover:bg-[#041E3A] text-white"
              >
                Previous
              </Button>
              {renderPageNumbers()}
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next || changingPage}
                className="bg-[#1C7C54] hover:bg-[#041E3A] text-white"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

