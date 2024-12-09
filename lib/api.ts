const BASE_URL = 'https://rise-mks9.onrender.com/api/v1';

export interface Question {
  q_type: number;
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

