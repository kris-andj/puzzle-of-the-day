import axios from 'axios'

const API_URL = 'http://localhost:5000/api'


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me')
}


export const puzzleAPI = {
  getDailyPuzzle: () => api.get('/puzzles/daily'),
  getAllPuzzles: (params) => api.get('/puzzles', { params }),
  getPuzzleById: (id) => api.get(`/puzzles/${id}`),
  solvePuzzle: (id, answerData) => api.post(`/puzzles/${id}/solve`, answerData),
  createPuzzle: (puzzleData) => api.post('/puzzles', puzzleData),
  updatePuzzle: (id, puzzleData) => api.put(`/puzzles/${id}`, puzzleData),
  deletePuzzle: (id) => api.delete(`/puzzles/${id}`)
}


export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getStats: () => api.get('/users/stats'),
  getLeaderboard: () => api.get('/users/leaderboard'),
  getAllUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`)
}

export default api