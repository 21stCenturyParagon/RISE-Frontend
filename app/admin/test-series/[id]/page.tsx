'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { use } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import Image from "next/image";
import {logoutUser} from "@/lib/api";

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

interface TestSeries {
  id: number;
  title: string;
  description: string;
  questions: Question[];
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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getTestSeriesQuestions(seriesId: string, page: number = 1, size: number = 10): Promise<PaginatedResponse<Question>> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/test-series/${seriesId}/questions?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch test series questions');
  }

  return response.json();
}

async function addQuestionsToTestSeries(seriesId: number, questions: { question_id: number; order: number }[]) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/test-series/${seriesId}/questions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questions),
  });

  if (!response.ok) {
    throw new Error('Failed to add questions to test series');
  }

  return response.json();
}

async function removeQuestionFromTestSeries(seriesId: number, questionId: number) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/test-series/${seriesId}/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to remove question from test series');
  }

  return response.json();
}

async function createQuestion(question: Omit<Question, 'ques_number' | 'image' | 'status' | 'solution_image'>): Promise<Question> {
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

async function updateQuestion(questionId: number, questionData: Partial<Question>) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });

  if (!response.ok) {
    throw new Error('Failed to update question');
  }

  return response.json();
}

async function updateTestSeries(seriesId: number, title: string, description: string) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/test-series/${seriesId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to update test series');
  }

  return response.json();
}

async function deleteTestSeries(seriesId: number) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/test-series/${seriesId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete test series');
  }

  return response.json();
}

export default function TestSeriesManagementPage({ params }: { params: Promise<{ id: string }> }) {
  // @ts-ignore
  const unwrappedParams = use(params)
  // @ts-ignore
  const seriesId = unwrappedParams.id
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = useState(false)
  const [isNewQuestionDialogOpen, setIsNewQuestionDialogOpen] = useState(false)
  const [isEditSeriesDialogOpen, setIsEditSeriesDialogOpen] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'ques_number' | 'image' | 'status' | 'solution_image'>>({
    question: '',
    options: '',
    topic: '',
    difficulty: 'easy',
    source: '',
    correct_answer: '',
    solution: '',
    q_type: 1,
  })
  const [editedSeries, setEditedSeries] = useState({ title: '', description: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [questionIdsToAdd, setQuestionIdsToAdd] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchTestSeriesQuestions()
  }, [seriesId, currentPage])

  async function fetchTestSeriesQuestions() {
    try {
      setLoading(true)
      const data = await getTestSeriesQuestions(seriesId, currentPage)
      setQuestions(data.items)
      setTotalPages(data.total_pages)
      setTestSeries({
        id: parseInt(seriesId),
        title: 'Test Series',
        description: 'Description',
        questions: data.items,
      })
    } catch (error) {
      console.error('Failed to fetch test series questions:', error)
      setError('Failed to load test series questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestions = async () => {
    try {
      const questionIds = questionIdsToAdd.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      const questionsToAdd = questionIds.map((id, index) => ({ question_id: id, order: questions.length + index + 1 }))

      await addQuestionsToTestSeries(parseInt(seriesId), questionsToAdd)
      await fetchTestSeriesQuestions()
      setIsAddQuestionDialogOpen(false)
      setQuestionIdsToAdd('')
    } catch (error) {
      console.error('Failed to add questions:', error)
      setError('Failed to add questions. Please try again.')
    }
  }

  const handleRemoveQuestion = async (questionId: number) => {
    try {
      await removeQuestionFromTestSeries(parseInt(seriesId), questionId)
      await fetchTestSeriesQuestions()
    } catch (error) {
      console.error('Failed to remove question:', error)
      setError('Failed to remove question. Please try again.')
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion(questionId)
      await fetchTestSeriesQuestions()
    } catch (error) {
      console.error('Failed to delete question:', error)
      setError('Failed to delete question. Please try again.')
    }
  }

  const handleCreateQuestion = async () => {
    try {
      const createdQuestion = await createQuestion(newQuestion)
      await addQuestionsToTestSeries(parseInt(seriesId), [{ question_id: createdQuestion.ques_number, order: questions.length + 1}])
      await fetchTestSeriesQuestions()
      setIsNewQuestionDialogOpen(false)
      setNewQuestion({
        question: '',
        options: '',
        topic: '',
        difficulty: 'easy',
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

  const handleUpdateTestSeries = async () => {
    try {
      await updateTestSeries(parseInt(seriesId), editedSeries.title, editedSeries.description)
      setTestSeries(prev => prev ? { ...prev, ...editedSeries } : null)
      setIsEditSeriesDialogOpen(false)
    } catch (error) {
      console.error('Failed to update test series:', error)
      setError('Failed to update test series. Please try again.')
    }
  }

  const handleDeleteTestSeries = async () => {
    try {
      await deleteTestSeries(parseInt(seriesId))
      router.push('/admin')
    } catch (error) {
      console.error('Failed to delete test series:', error)
      setError('Failed to delete test series. Please try again.')
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
          <div className="flex justify-between items-center mt-4">
            <h1 className="text-3xl font-bold text-[#041E3A]">{testSeries?.title}</h1>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => setIsEditSeriesDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Series
              </Button>
              <Button variant="destructive" onClick={handleDeleteTestSeries}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Series
              </Button>
            </div>
          </div>
          <p className="text-[#001122] mt-2">{testSeries?.description}</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#041E3A]">Questions in this Test Series</h2>
          <div className="space-x-4">
            <Button className="bg-[#1C7C54] hover:bg-[#041E3A] text-white" onClick={() => setIsAddQuestionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Existing Question
            </Button>
            <Button className="bg-[#1C7C54] hover:bg-[#041E3A] text-white" onClick={() => setIsNewQuestionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Create New Question
            </Button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
          <div className="bg-white border-b-2 border-b-[#f6f7f9] px-4 py-3 sm:px-6 flex items-center font-medium text-sm text-gray-500">
            <div className="w-16">ID</div>
            <div className="flex-1">Question</div>
            <div className="w-24 text-center">Difficulty</div>
            <div className="w-24 text-center">Topic</div>
            <div className="w-48 text-center">Actions</div>
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
                      {question.question}
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
                  <div className="flex-shrink-0 w-48 text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleRemoveQuestion(question.ques_number)}>Remove</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.ques_number)}>Delete</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>

        <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Questions to Test Series</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Textarea
                placeholder="Enter question IDs (comma-separated)"
                value={questionIdsToAdd}
                onChange={(e) => setQuestionIdsToAdd(e.target.value)}
              />
              <Button onClick={handleAddQuestions}>Add Questions</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isNewQuestionDialogOpen} onOpenChange={setIsNewQuestionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
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
                onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value as 'easy' | 'medium' | 'hard' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
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
              <Button onClick={handleCreateQuestion}>Create and Add Question</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditSeriesDialogOpen} onOpenChange={setIsEditSeriesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Test Series</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Input
                placeholder="Enter series title"
                value={editedSeries.title}
                onChange={(e) => setEditedSeries({ ...editedSeries, title: e.target.value })}
              />
              <Textarea
                placeholder="Enter series description"
                value={editedSeries.description}
                onChange={(e) => setEditedSeries({ ...editedSeries, description: e.target.value })}
              />
              <Button onClick={handleUpdateTestSeries}>Update Test Series</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

