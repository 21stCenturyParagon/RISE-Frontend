'use client'

import {useState, useEffect, use} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { logoutUser, getCurrentUser } from '@/lib/api'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import AdminCenterButton from '@/components/AdminCenterButton'
import { LatexRenderer } from '@/components/LatexRenderer'

interface Question {
  ques_number: number;
  question: string;
  topic: string;
  difficulty: string;
  source: string;
  status: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

async function getTestSeriesQuestions(id: string, page: number, size: number): Promise<PaginatedResponse<Question>> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`https://rise-mks9.onrender.com/api/v1/admin/test-series/${id}/questions?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch test series questions');
  }

  return response.json();
}

export default function TestSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)
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
  const searchParams = useSearchParams()
  const [testSeriesTitle, setTestSeriesTitle] = useState<string>(searchParams.get('title') || 'Test Series')
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
        const questionsData = await getTestSeriesQuestions(resolvedParams.id, pagination.page, pagination.size)
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
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError('Failed to load test series questions. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, resolvedParams.id, pagination.page, pagination.size])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
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
            <Link href="/dashboard" className="text-[#041E3A] hover:text-[#001122]">Dashboard</Link>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-[#041E3A] hover:text-[#001122]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#041E3A] mt-4">{testSeriesTitle}</h1>
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
                  disabled={!pagination.has_previous}
                  className="bg-[#1C7C54] hover:bg-[#041E3A] text-white"
                >
                  Previous
                </Button>
                {renderPageNumbers()}
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.has_next}
                  className="bg-[#1C7C54] hover:bg-[#041E3A] text-white"
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-[#001122]">No questions available for this test series at the moment.</p>
          )}
        </div>
      </main>
    </div>
  )
}

