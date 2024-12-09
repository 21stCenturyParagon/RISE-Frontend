'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { getQuestions, getProfile, getFilters, logoutUser, Question, PaginatedResponse, Filters } from '@/lib/api'
import { LatexRenderer } from '@/components/LatexRenderer'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Profile {
  name: string;
  email: string;
  stats: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
}

export default function DashboardPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
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
    status: '',
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
        // @ts-ignore
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
      [filterType]: value === 'all' ? '' : value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
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

  if (loading) {
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
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow border-b border-[#bcc8cc]">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/dashboard">
            <Image
              src="https://framerusercontent.com/images/q2DtVdC1E9IpHsCozasAYSAAlY.png"
              alt="RISE Logo"
              width={120}
              height={40}
              className="h-10 w-auto cursor-pointer"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/profile" className="text-[#041E3A] hover:text-[#001122]">Profile</Link>
            <Button variant="outline" onClick={() => {
              logoutUser();
              router.push('/auth/login');
            }}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className={`px-4 py-6 sm:px-0 ${changingPage ? 'opacity-50 pointer-events-none' : ''}`}>
          <h1 className="text-3xl font-bold text-[#041E3A] mb-6">Welcome, {profile?.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-[#041E3A]">TMUA</h2>
                <p className="text-[#001122] mb-4">Test of Mathematics for University Admission</p>
                <Button className="w-full bg-[#1C7C54] hover:bg-[#041E3A] text-white">Start Test Series</Button>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-[#041E3A] mb-4">Study Plan</h2>

          <div className="flex flex-wrap gap-4 mb-6">
            <Select onValueChange={(value) => handleFilterChange('difficulty', value)} disabled={changingPage}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {filters?.sources.map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('status', value)} disabled={changingPage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="correct">Correct</SelectItem>
                <SelectItem value="incorrect">Incorrect</SelectItem>
                <SelectItem value="unattempted">Unattempted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {questions && questions.length > 0 ? (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                <ul className="divide-y divide-[#bcc8cc]">
                  {questions.map((question) => (
                    <li key={question.ques_number} className="question-list-item">
                      <Link href={`/questions/${question.ques_number}`} className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {getStatusIcon(question.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#1C7C54] truncate question-preview">
                                {question.ques_number}.{' '}
                                <LatexRenderer
                                  content={question.question}
                                  className="inline"
                                  inline={true}
                                />
                              </span>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                    question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                  {question.difficulty}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <span className="flex items-center text-sm text-[#001122]">
                                  {question.topic}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-[#001122] sm:mt-0">
                                <span>{question.source}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
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
            </>
          ) : (
            <p className="text-[#001122]">No questions available at the moment.</p>
          )}
        </div>
      </main>
    </div>
  )
}

