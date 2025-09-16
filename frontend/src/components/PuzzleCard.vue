<template>
  <div class="puzzle-card">
    <div class="card h-100 shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 class="card-title mb-1">{{ puzzle.title }}</h5>
          <small class="text-muted">{{ puzzle.description }}</small>
        </div>
        <div class="text-end">
          <span class="badge bg-primary fs-6">{{ puzzle.points }} poena</span>
        </div>
      </div>
      
      
      <div class="card-body">
        <div class="mb-3">
          <span class="badge bg-info me-2">
            {{ getCategoryIcon(puzzle.category) }} {{ puzzle.category }}
          </span>
          <span 
            class="badge me-2" 
            :class="getDifficultyClass(puzzle.difficulty)"
          >
            {{ getDifficultyIcon(puzzle.difficulty) }} {{ puzzle.difficulty }}
          </span>
          <small class="text-muted" v-if="puzzle.dateUsed">
            {{ formatDate(puzzle.dateUsed) }}
          </small>
        </div>
        
        <div class="question-box p-3 mb-3 bg-light rounded">
          <strong>Pitanje:</strong>
          <p class="mb-0 mt-2">{{ puzzle.question }}</p>
        </div>
        
        <div v-if="!solved && showAnswerSection">
          <div v-if="puzzle.options && puzzle.options.length > 0" class="mb-3">
            <div class="form-check mb-2" v-for="option in puzzle.options" :key="option">
              <input 
                class="form-check-input" 
                type="radio" 
                :id="`option-${puzzle._id}-${option}`"
                :value="option" 
                v-model="userAnswer"
              >
              <label class="form-check-label" :for="`option-${puzzle._id}-${option}`">
                {{ option }}
              </label>
            </div>
          </div>
          
          <div v-else class="mb-3">
            <label class="form-label">Vaš odgovor:</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="userAnswer" 
              placeholder="Unesite vaš odgovor..."
              @keyup.enter="submitAnswer"
              :disabled="loading"
            >
          </div>
          
          <button 
            class="btn btn-primary w-100" 
            @click="submitAnswer"
            :disabled="!userAnswer || loading"
          >
            <span v-if="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Proverava...
            </span>
            <span v-else>
              📤 Pošalji Odgovor
            </span>
          </button>
        </div>
        
        <div v-if="!solved && showAnswerSection && !isLoggedIn" class="text-center">
          <div class="alert alert-info">
            <strong>Prijavite se</strong> da biste mogli da rešavate slagalice!
          </div>
          <router-link to="/login" class="btn btn-outline-primary">
            🔑 Prijava
          </router-link>
        </div>
        
        <div v-if="solved && result" class="result-section">
          <div 
            class="alert d-flex align-items-center" 
            :class="result.isCorrect ? 'alert-success' : 'alert-danger'"
          >
            <div class="me-3 fs-1">
              {{ result.isCorrect ? '✅' : '❌' }}
            </div>
            <div class="flex-grow-1">
              <h6 class="alert-heading mb-1">
                {{ result.isCorrect ? 'Odličo! Tačan odgovor!' : 'Netačno, probaj ponovo!' }}
              </h6>
              <p class="mb-1">
                <strong>Tačan odgovor:</strong> {{ result.correctAnswer }}
              </p>
              <small>
                <strong>Poeni:</strong> {{ result.pointsEarned || 0 }}
              </small>
            </div>
          </div>
          
          <div class="alert alert-info">
            <h6 class="alert-heading">💡 Objašnjenje:</h6>
            <p class="mb-0">{{ result.explanation }}</p>
          </div>
          
          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-outline-secondary" @click="resetPuzzle">
              🔄 Resetuj
            </button>
            <router-link to="/" class="btn btn-primary">
              🏠 Nova Slagalica
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="card-footer text-muted text-center" v-if="puzzle.createdAt">
        <small>
          Kreirana: {{ formatDate(puzzle.createdAt) }}
          <span v-if="puzzle.createdBy"> | ID: {{ puzzle._id.slice(-6) }}</span>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PuzzleCard',
  props: {
    puzzle: {
      type: Object,
      required: true
    },
    showAnswerSection: {
      type: Boolean,
      default: true
    },
    autoSubmit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userAnswer: '',
      solved: false,
      result: null,
      loading: false
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  methods: {
    async submitAnswer() {
      if (!this.userAnswer.trim()) return
      if (!this.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      this.loading = true
      
      try {
        
        const answerData = {
          userAnswer: this.userAnswer,
          timeSpent: 0 
        }
        
        this.$emit('answer-submitted', {
          puzzleId: this.puzzle._id,
          answerData
        })
        
      } catch (error) {
        console.error('Submit answer error:', error)
      } finally {
        this.loading = false
      }
    },
    
    setResult(resultData) {
      this.result = resultData
      this.solved = true
    },
    
    resetPuzzle() {
      this.userAnswer = ''
      this.solved = false
      this.result = null
      this.loading = false
    },
    
    
    getCategoryIcon(category) {
      const icons = {
        'matematika': '🧮',
        'logika': '🧠',
        'reči': '📝',
        'znanje': '📚',
        'kombinatorika': '🎯'
      }
      return icons[category] || '🧩'
    },
    
    getDifficultyIcon(difficulty) {
      const icons = {
        'easy': '🟢',
        'medium': '🟡',
        'hard': '🔴'
      }
      return icons[difficulty] || '⚪'
    },
    
    getDifficultyClass(difficulty) {
      const classes = {
        'easy': 'bg-success',
        'medium': 'bg-warning',
        'hard': 'bg-danger'
      }
      return classes[difficulty] || 'bg-secondary'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  
  watch: {
    puzzle: {
      handler() {
        this.resetPuzzle()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.puzzle-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.puzzle-card:hover {
  transform: translateY(-2px);
}

.card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 1px solid #dee2e6;
}

.question-box {
  border-left: 4px solid var(--bs-primary);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.result-section .alert {
  border: none;
  border-radius: 10px;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.badge {
  font-size: 0.75em;
  padding: 0.5em 0.75em;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: start !important;
  }
  
  .card-header .text-end {
    margin-top: 0.5rem;
    align-self: stretch;
  }
}
</style>