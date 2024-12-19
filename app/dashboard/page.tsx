'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { getQuestions, getProfile, getFilters, logoutUser, Question, PaginatedResponse, Filters, getCurrentUser, ProfileData } from '@/lib/api'
import { LatexRenderer } from '@/components/LatexRenderer'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import AdminCenterButton from '@/components/AdminCenterButton'

type Profile = ProfileData;

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
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const user = getCurrentUser()
    setCurrentUser(user)

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
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') && (
              <AdminCenterButton />
            )}
            <Button variant="outline" onClick={() => {
              logoutUser();
              router.push('/auth/login');
            }}>
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <div className="border-b border-gray-200 mb-6"></div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className={`px-4 py-6 sm:px-0 ${changingPage ? 'opacity-50 pointer-events-none' : ''}`}>
          <h1 className="text-3xl font-bold text-[#041E3A] mb-6">Welcome {profile?.user.name}...</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="w-[400px] h-[180px] p-8 flex flex-col justify-between bg-gradient-to-r from-[#CFF8E7] to-[#28A772] shadow-[0px_2px_4px_rgba(0,0,0,0.1)] rounded-[6px] border-0">
              <div className="flex flex-col gap-3">
                <h2 className="text-[#1C7C54] text-2xl font-bold">TMUA</h2>
                <p className="text-[#1C7C54] text-sm">Test of Mathematics for University Admission</p>
              </div>
              <Button
                variant="outline"
                className="w-fit px-6 py-2 mt-4 bg-white border-[#469F6E] text-[#469F6E] hover:border-[#469F6E] hover:text-white text-sm"
              >
                Start Test Series
              </Button>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-[#041E3A] mb-4">Study Plan</h2>

          <div className="flex flex-wrap gap-4 mb-6">
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

            <Select onValueChange={(value) => handleFilterChange('status', value)} disabled={changingPage}>
              <SelectTrigger className="w-[180px] border-none bg-gray-100 px-4 py-2">
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
                              <span className="text-sm font-medium text-black group-hover:text-[#1C7C54] transition-colors duration-200 truncate question-preview">
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

