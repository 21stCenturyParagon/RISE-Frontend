'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from 'lucide-react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { getCurrentUser, logoutUser } from '@/lib/api'
import Image from 'next/image'

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

async function updateUserRole(userId: string, role: string): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/auth/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [router])

  async function fetchUsers() {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Failed to update user role:', error)
      setError('Failed to update user role. Please try again.')
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
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-[#041E3A] hover:text-[#001122]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#041E3A] mt-4">Manage Users</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
          <div className="bg-white border-b-2 border-b-[#f6f7f9] px-4 py-3 sm:px-6 flex items-center font-medium text-sm text-gray-500">
            <div className="flex-1">Name</div>
            <div className="flex-1">Email</div>
            <div className="w-32 text-center">Role</div>
            <div className="w-48 text-center">Created At</div>
            <div className="w-48 text-center">Last Sign In</div>
          </div>
          <ul>
            {users.map((user, index) => (
              <li
                key={user.id}
                className={`flex items-center px-4 py-4 sm:px-6 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-[#f7f8fa]'
                } group`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="w-32 text-center">
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48 text-center text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleString()}
                </div>
                <div className="w-48 text-center text-sm text-gray-500">
                  {new Date(user.last_sign_in_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

