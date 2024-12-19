'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {getCurrentUser, logoutUser} from '@/lib/api'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ArrowLeft } from 'lucide-react'
import { AddTestSeriesModal } from '@/components/AddTestSeriesModal'

interface TestSeries {
  title: string;
  description: string;
  id: number;
  created_at: string;
  updated_at: string;
  question_count: number;
}

async function getTestSeries(): Promise<TestSeries[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/test-series`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch test series');
  }

  return response.json();
}

async function createTestSeries(title: string, description: string): Promise<TestSeries> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/test-series`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error('Failed to create test series');
  }

  return response.json();
}

export default function AdminPage() {
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      router.push('/dashboard')
      return
    }

    fetchTestSeries()
  }, [router])

  async function fetchTestSeries() {
    try {
      const data = await getTestSeries()
      setTestSeries(data)
    } catch (error) {
      console.error('Failed to fetch test series:', error)
      setError('Failed to load test series. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTestSeries = async (title: string, description: string) => {
    try {
      const newTestSeries = await createTestSeries(title, description)
      setTestSeries(prevSeries => [...prevSeries, newTestSeries])
    } catch (error) {
      console.error('Failed to add test series:', error)
      setError('Failed to add test series. Please try again.')
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
            href="/dashboard"
            className="inline-flex items-center text-sm text-[#041E3A] hover:text-[#001122]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex justify-between items-center mt-4">
            <h1 className="text-3xl font-bold text-[#041E3A]">Admin Dashboard</h1>
            <div className="flex space-x-4 items-center">
              <Button variant="outline" onClick={() => router.push('/admin/questions')}>
                All Questions
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                Manage Users
              </Button>
              <AddTestSeriesModal onAddTestSeries={handleAddTestSeries} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testSeries.map((series) => (
            <Card key={series.id} className="w-full h-[180px] p-6 flex flex-col justify-between bg-gradient-to-r from-[#CFF8E7] to-[#28A772] shadow-[0px_2px_4px_rgba(0,0,0,0.1)] rounded-[6px] border-0 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h2 className="text-[#1C7C54] text-xl font-bold truncate">{series.title}</h2>
                <p className="text-[#1C7C54] text-sm line-clamp-2">{series.description || 'No description available'}</p>
              </div>
              <Button
                variant="outline"
                className="w-fit px-6 py-2 mt-2 bg-white border-[#469F6E] text-[#469F6E] hover:bg-white/90 text-sm"
                onClick={() => router.push(`/admin/test-series/${series.id}`)}
              >
                Edit
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

