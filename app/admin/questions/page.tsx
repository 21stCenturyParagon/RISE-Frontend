'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
// @ts-ignore
import { getCurrentUser, getQuestions, getFilters, Question, PaginatedResponse, Filters, logoutUser } from '@/lib/api'
import { LatexRenderer } from '@/components/LatexRenderer'
import Image from 'next/image'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  ques_number: number;
  question: string;
  options: string;
  topic: string;
  difficulty: string;
  source: string;
  image: string;
  status: string;
  correct_answer: string;
  solution: string;
  q_type: number;
}

async function createQuestion(question: Omit<Question, 'image' | 'status'>): Promise<Question> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/questions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  });

  if (!response.ok) {
    throw new Error('Failed to create question');
  }

  return response.json();
}

async function deleteQuestion(questionId: number) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete question');
  }

  return response.json();
}

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filters, setFilters] = useState<Filters | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  })
  const [isNewQuestionDialogOpen, setIsNewQuestionDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'image' | 'status'>>({
    ques_number: 0,
    question: '',
    options: '',
    topic: '',
    difficulty: 'Easy',
    source: '',
    correct_answer: '',
    solution: '',
    q_type: 1,
  })
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      router.push('/dashboard')
      return
    }

    fetchQuestions()
    fetchFilters()
  }, [pagination.page, selectedFilters])

  async function fetchQuestions() {
    try {
      setLoading(true)
      const data = await getQuestions(pagination.page, pagination.size, selectedFilters)
      // @ts-ignore
      setQuestions(data.items)
      setPagination({
        total: data.total,
        page: data.page,
        size: data.size,
        total_pages: data.total_pages,
        has_next: data.has_next,
        has_previous: data.has_previous,
        next_page: data.next_page,
        previous_page: data.previous_page,
      })
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      setError('Failed to load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchFilters() {
    try {
      const filtersData = await getFilters()
      setFilters(filtersData)
    } catch (error) {
      console.error('Failed to fetch filters:', error)
      setError('Failed to load filters. Please try again.')
    }
  }

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

  const handleCreateQuestion = async () => {
    try {
      await createQuestion(newQuestion)
      await fetchQuestions()
      setIsNewQuestionDialogOpen(false)
      setNewQuestion({
        ques_number: 0,
        question: '',
        options: '',
        topic: '',
        difficulty: 'Easy',
        source: '',
        correct_answer: '',
        solution: '',
        q_type: 1,
      })
    } catch (error) {
      console.error('Failed to create question:', error)
      setError('Failed to create question. Please try again.')
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion(questionId)
      await fetchQuestions()
    } catch (error) {
      console.error('Failed to delete question:', error)
      setError('Failed to delete question. Please try again.')
    }
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
      <header className="bg-white shadow border-b border-[#bcc8cc] mb-8">
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
            <Link href="/admin" className="text-[#041E3A] hover:text-[#001122]">Manage</Link>
            <Button variant="outline" onClick={() => {
              logoutUser();
              router.push('/auth/login');
            }}>
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-[#041E3A] hover:text-[#001122]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#041E3A] mt-4">All Questions</h1>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex flex-wrap gap-4">
            <Select onValueChange={(value) => handleFilterChange('topic', value)}>
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

            <Select onValueChange={(value) => handleFilterChange('difficulty', value)}>
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

            <Select onValueChange={(value) => handleFilterChange('source', value)}>
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
          <Button className="bg-[#1C7C54] hover:bg-[#041E3A] text-white" onClick={() => setIsNewQuestionDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add New Question
          </Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
          <div className="bg-white border-b-2 border-b-[#f6f7f9] px-4 py-3 sm:px-6 flex items-center font-medium text-sm text-gray-500">
            <div className="w-16">ID</div>
            <div className="flex-1">Question</div>
            <div className="w-24 text-center">Difficulty</div>
            <div className="w-24 text-center">Topic</div>
            <div className="w-24 text-center">Actions</div>
          </div>
          <ul>
            {questions.map((question, index) => (
              <li
                key={question.ques_number}
                className={`question-list-item ${index % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'} group`}
              >
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="w-16 flex-shrink-0">
                    {question.ques_number}
                  </div>
                  <div className="min-w-0 flex-1 flex-grow">
                    <div className="truncate text-sm font-medium text-black group-hover:text-[#1C7C54] transition-colors duration-200">
                      <LatexRenderer
                        content={question.question}
                        className="inline"
                        inline={true}
                      />
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
                    {question.topic}
                  </div>
                  <div className="flex-shrink-0 w-24 text-center">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.ques_number)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          <Button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.has_previous}
          >
            Previous
          </Button>
          <span>Page {pagination.page} of {pagination.total_pages}</span>
          <Button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
          >
            Next
          </Button>
        </div>

        <Dialog open={isNewQuestionDialogOpen} onOpenChange={setIsNewQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Input
                type="number"
                placeholder="Enter question number"
                value={newQuestion.ques_number}
                onChange={(e) => setNewQuestion({ ...newQuestion, ques_number: parseInt(e.target.value) })}
                required
              />
              <Textarea
                placeholder="Enter question text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              />
              <Textarea
                placeholder="Enter options (one per line)"
                value={newQuestion.options}
                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
              />
              <Input
                placeholder="Enter correct answer"
                value={newQuestion.correct_answer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              />
              <Select
                value={newQuestion.difficulty}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value as 'Easy' | 'Medium' | 'Hard' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter topic"
                value={newQuestion.topic}
                onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
              />
              <Input
                placeholder="Enter source"
                value={newQuestion.source}
                onChange={(e) => setNewQuestion({ ...newQuestion, source: e.target.value })}
              />
              <Textarea
                placeholder="Enter solution"
                value={newQuestion.solution}
                onChange={(e) => setNewQuestion({ ...newQuestion, solution: e.target.value })}
              />
              <Select
                value={newQuestion.q_type.toString()}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, q_type: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Objective</SelectItem>
                  <SelectItem value="2">Subjective</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateQuestion}>Create Question</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

