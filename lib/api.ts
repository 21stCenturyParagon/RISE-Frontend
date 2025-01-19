const BASE_URL = 'https://rise-mks9.onrender.com/api/v1';

export interface Question {
  ques_number: number;
  question: string;
  options: string;
  topic: string;
  difficulty: string;
  source: string;
  image: string;
  status: string;
  correct_answer: string;
  explanation: string;
  q_type: number; // Add this line
}

export interface PaginatedResponse<T> {
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

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function signupUser(email: string, password: string, name: string) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    throw new Error('Signup failed');
  }

  return response.json();
}


export async function getQuestions(
  page: number = 1,
  size: number = 10,
  filters: {difficulty?: string; topic?: string; source?: string; status?: string} = {}
): Promise<PaginatedResponse<Question>> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  // Only add non-empty filters to the params
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      if (key === 'status') {
        // Split the status string and add each status separately
        value.split(',').forEach(status => params.append('status', status.trim()));
      } else {
        params.append(key, value);
      }
    }
  });

  const response = await fetch(`${BASE_URL}/questions?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`, { cause: errorData });
  }

  return response.json();
}

export interface Filters {
  difficulties: string[];
  topics: string[];
  sources: string[];
}

export async function getFilters(): Promise<Filters> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/questions/filters`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filters');
  }

  return response.json();
}

export async function submitAnswer(id: string, answer: string) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/questions/${id}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answer }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }

  return response.json();
}

export interface ProfileData {
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

export async function getProfile(): Promise<ProfileData> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/progress/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
}

export function logoutUser() {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function getCurrentUser() {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
}

export interface TestSeries {
  // Define the structure of a TestSeries object here
}

export async function getTestSeries(): Promise<TestSeries[]> {
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

export async function getNextFilteredQuestion(currentId: string, filters: Record<string, string>): Promise<Question | null> {
  const questionOrder = JSON.parse(localStorage.getItem('questionOrder') || '[]');
  const currentIndex = questionOrder.indexOf(parseInt(currentId));
  if (currentIndex < questionOrder.length - 1) {
    const nextQuestionId = questionOrder[currentIndex + 1];
    return getQuestion(nextQuestionId.toString());
  }
  return null;
}

export async function getQuestion(id: string): Promise<Question> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/questions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }

  return response.json();
}

export async function getQuestionCount(): Promise<number> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${BASE_URL}/questions/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch question count');
  }

  const data = await response.json();
  return data.total;
}

export async function bulkImportQuestions(file: File): Promise<{ message: string }> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/admin/bulk-import-csv`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to bulk import questions');
  }

  return response.json();
}

