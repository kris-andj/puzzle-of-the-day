<template>
  <div class="admin-panel">
    <div class="container">
      
      <div class="row align-items-center justify-content-between mb-4">
    <h2 class="section-title">👤 Moj profil</h2>
      </div>
      
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">👥 Upravljanje korisnicima</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Korisnik</th>
                  <th>Poeni</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users.filter(u => u.role !== 'admin')" :key="user._id">
                  <td>{{ user._id.substring(0,8) }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.stats?.totalPoints || 0 }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteUserIfLowPoints(user)" :disabled="loading">
                      <i class="fas fa-trash"></i>
                      <span>Obriši (malo poena)</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">🧩 Upravljanje slagalicama</h5>
        </div>
        <div class="card-body">
          
          <form @submit.prevent="handlePuzzleSubmit" class="mb-4">
            <div class="row g-3">
              <div class="col-md-6">
                <input v-model="puzzleForm.title" class="form-control" placeholder="Naslov slagalice" required />
              </div>
              <div class="col-md-6">
                <select v-model="puzzleForm.category" class="form-select" required>
                  <option value="" disabled>Kategorija</option>
                  <option value="logika">Logika</option>
                  <option value="matematika">Matematika</option>
                  <option value="reči">Reči</option>
                  <option value="znanje">Znanje</option>
                  <option value="kombinatorika">Kombinatorika</option>
                </select>
              </div>
              <div class="col-md-6">
                <select v-model="puzzleForm.difficulty" class="form-select" required>
                  <option value="" disabled>Težina</option>
                  <option value="easy">Lako</option>
                  <option value="medium">Srednje</option>
                  <option value="hard">Teško</option>
                </select>
              </div>
              <div class="col-md-6">
                <input v-model="puzzleForm.points" type="number" min="1" class="form-control" placeholder="Broj poena" required />
              </div>
              <div class="col-12">
                <textarea v-model="puzzleForm.description" class="form-control" placeholder="Opis slagalice" required></textarea>
              </div>
              <div class="col-12">
                <textarea v-model="puzzleForm.question" class="form-control" placeholder="Pitanje" required></textarea>
              </div>
              <div class="col-12">
                <input v-model="puzzleForm.correctAnswer" class="form-control" placeholder="Tačan odgovor" required />
              </div>
              <div class="col-12">
                <input v-model="puzzleForm.options" class="form-control" placeholder="Opcije (odvojene zarezom, opciono)" />
              </div>
              <div class="col-12">
                <textarea v-model="puzzleForm.explanation" class="form-control" placeholder="Objašnjenje" required></textarea>
              </div>
              <div class="col-12 d-flex gap-2">
                <button class="btn btn-success" type="submit" :disabled="puzzleLoading">
                  <span v-if="puzzleEditId">Sačuvaj izmene</span>
                  <span v-else>Dodaj slagalicu</span>
                </button>
                <button v-if="puzzleEditId" class="btn btn-secondary" type="button" @click="resetPuzzleForm">Otkaži</button>
              </div>
            </div>
          </form>
          
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naslov</th>
                  <th>Kategorija</th>
                  <th>Težina</th>
                  <th>Poeni</th>
                  <th>Aktivna</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="puzzle in puzzles" :key="puzzle._id">
                  <td>{{ puzzle._id.substring(0,8) }}</td>
                  <td>{{ puzzle.title }}</td>
                  <td>{{ puzzle.category }}</td>
                  <td>{{ puzzle.difficulty }}</td>
                  <td>{{ puzzle.points }}</td>
                  <td>
                    <span class="badge" :class="puzzle.isActive ? 'bg-success' : 'bg-secondary'">
                      {{ puzzle.isActive ? 'Da' : 'Ne' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-1" @click="editPuzzle(puzzle)"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" @click="deletePuzzle(puzzle._id)" :disabled="puzzleLoading"><i class="fas fa-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI, puzzleAPI } from '../../services/api'

export default {
  name: 'AdminPanel',
  
  data() {
    return {
      users: [],
      loading: false,
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      puzzles: [],
      puzzleForm: {
        title: '',
        description: '',
        category: '',
        difficulty: '',
        question: '',
        correctAnswer: '',
        options: '',
        explanation: '',
        points: 10,
        isActive: true
      },
      puzzleEditId: null,
      puzzleLoading: false
    }
  },
  computed: {
    isAdmin() {
      return this.user && this.user.role === 'admin'
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const response = await userAPI.getAllUsers()
        this.users = response.data.users || []
      } catch (error) {
        console.error('Load users error:', error)
      } finally {
        this.loading = false
      }
    },
    async loadPuzzles() {
      this.puzzleLoading = true
      try {
        const response = await puzzleAPI.getAllPuzzles({ limit: 100 })
        this.puzzles = response.data.puzzles || []
      } catch (error) {
        console.error('Load puzzles error:', error)
      } finally {
        this.puzzleLoading = false
      }
    },
    async handlePuzzleSubmit() {
      this.puzzleLoading = true
      try {
        const payload = {
          ...this.puzzleForm,
          options: this.puzzleForm.options ? this.puzzleForm.options.split(',').map(o => o.trim()) : []
        }
        if (this.puzzleEditId) {
          await puzzleAPI.updatePuzzle(this.puzzleEditId, payload)
        } else {
          await puzzleAPI.createPuzzle(payload)
        }
        this.resetPuzzleForm()
        await this.loadPuzzles()
      } catch (error) {
        alert('Greška pri čuvanju slagalice!')
        console.error('Save puzzle error:', error)
      } finally {
        this.puzzleLoading = false
      }
    },
    editPuzzle(puzzle) {
      this.puzzleEditId = puzzle._id
      this.puzzleForm = {
        title: puzzle.title,
        description: puzzle.description,
        category: puzzle.category,
        difficulty: puzzle.difficulty,
        question: puzzle.question,
        correctAnswer: puzzle.correctAnswer,
        options: puzzle.options ? puzzle.options.join(', ') : '',
        explanation: puzzle.explanation,
        points: puzzle.points,
        isActive: puzzle.isActive
      }
    },
    resetPuzzleForm() {
      this.puzzleEditId = null
      this.puzzleForm = {
        title: '',
        description: '',
        category: '',
        difficulty: '',
        question: '',
        correctAnswer: '',
        options: '',
        explanation: '',
        points: 10,
        isActive: true
      }
    },
    async deletePuzzle(id) {
      if (!confirm('Da li ste sigurni da želite da obrišete ovu slagalicu?')) return
      this.puzzleLoading = true
      try {
        await puzzleAPI.deletePuzzle(id)
        await this.loadPuzzles()
      } catch (error) {
        alert('Greška pri brisanju slagalice!')
        console.error('Delete puzzle error:', error)
      } finally {
        this.puzzleLoading = false
      }
    },
    async toggleUserStatus(userId) {
      this.loading = true
      try {
        await userAPI.toggleUserStatus(userId)
        await this.loadUsers()
      } catch (error) {
        console.error('Toggle user status error:', error)
      } finally {
        this.loading = false
      }
    },
    async editUser(userId) {
      this.loading = true
      try {
        await userAPI.editUser(userId)
        await this.loadUsers()
      } catch (error) {
        console.error('Edit user error:', error)
      } finally {
        this.loading = false
      }
    },
    async deleteUserIfLowPoints(user) {
      if ((user.stats?.totalPoints || 0) > 10) {
        alert('Korisnik ima više od 10 poena i ne može biti obrisan ovom akcijom.');
        return;
      }
      if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) return;
      this.loading = true;
      try {
        await userAPI.deleteUser(user._id);
        await this.loadUsers();
      } catch (error) {
        alert('Greška pri brisanju korisnika!');
        console.error('Delete user error:', error);
      } finally {
        this.loading = false;
      }
    },
    getUserStatusClass(status) {
      if (status === 'active') return 'bg-success text-white'
      if (status === 'inactive') return 'bg-warning text-dark'
      return 'bg-secondary text-white'
    },
    getStatusText(status) {
      if (status === 'active') return 'Aktivan'
      if (status === 'inactive') return 'Neaktivan'
      return 'Nepoznat'
    },
  addPlace() {
      
  },
  editPlace() {
      
  },
  deletePlace() {
      
  }
  },
  mounted() {
    this.loadUsers()
    this.loadPuzzles()
  }
}
</script>

<style scoped>
.admin-panel {
  padding: 2rem 0;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.table td {
  vertical-align: top;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}
</style>