<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section bg-primary text-white py-5 mb-5 rounded">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8 mx-auto text-center">
            <h1 class="display-4 fw-bold mb-3">
              🧩 Dobrodošli u Slagalica Dana
            </h1>
            <p class="lead mb-4">
              Rešavaj zanimljive slagalice svaki dan i vežbaj um kroz različite 
              kategorije zadataka. Takmiči se sa prijateljima i poboljšaj svoje rezultate!
            </p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <button 
                class="btn btn-light btn-lg px-4" 
                @click="scrollToPuzzle"
                v-if="dailyPuzzle"
              >
                🎯 Reši Slagalicu
              </button>
              <router-link 
                to="/register" 
                class="btn btn-outline-light btn-lg px-4"
                v-if="!isLoggedIn"
              >
                🚀 Registruj se
              </router-link>
              <router-link 
                to="/profile" 
                class="btn btn-outline-light btn-lg px-4"
                v-if="isLoggedIn"
              >
                👤 Moj Profil
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Daily Puzzle Section -->
          <section class="daily-puzzle-section mb-5" ref="puzzleSection">
            <div class="d-flex align-items-center justify-content-between mb-4">
              <h2 class="section-title">
                🌟 Slagalica Dana - {{ formatDate(new Date()) }}
              </h2>
              <button 
                class="btn btn-outline-primary btn-sm" 
                @click="refreshDailyPuzzle"
                :disabled="loadingPuzzle"
              >
                <span v-if="loadingPuzzle">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                </span>
                <span v-else>🔄</span>
                Osveži
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="loadingPuzzle" class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Učitava...</span>
              </div>
              <p class="text-muted">Učitavanje današnje slagalice...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger d-flex align-items-center">
              <div class="me-3">❌</div>
              <div>
                <strong>Greška:</strong> {{ error }}
                <button class="btn btn-sm btn-outline-danger ms-3" @click="refreshDailyPuzzle">
                  Pokušaj ponovo
                </button>
              </div>
            </div>

            <!-- Daily Puzzle -->
            <div v-else-if="dailyPuzzle">
              <PuzzleCard 
                :puzzle="dailyPuzzle"
                :show-answer-section="true"
                @answer-submitted="handleAnswerSubmit"
                ref="puzzleCard"
              />
            </div>

            <!-- No Puzzle Available -->
            <div v-else class="alert alert-info text-center py-4">
              <h5>📭 Nema dostupnih slagalica</h5>
              <p class="mb-0">Trenutno nema slagalice za danas. Pokušajte kasnije!</p>
            </div>
          </section>

          <!-- Previous Puzzles Link -->
          <section class="mb-5" v-if="isLoggedIn">
            <div class="card border-0 bg-light">
              <div class="card-body text-center py-4">
                <h5>📚 Želite više slagalica?</h5>
                <p class="text-muted mb-3">
                  Istražite arhivu prethodnih slagalica i vežbajte dodatno
                </p>
                <router-link to="/archive" class="btn btn-primary">
                  📖 Otvori Arhivu
                </router-link>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- User Stats (for logged in users) -->
          <section class="user-stats mb-4" v-if="isLoggedIn && userStats">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">📊 Vaše Statistike</h5>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6 mb-3">
                    <div class="stat-item">
                      <div class="h4 text-primary mb-0">{{ userStats.totalSolved }}</div>
                      <small class="text-muted">Rešeno</small>
                    </div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="stat-item">
                      <div class="h4 text-success mb-0">{{ userStats.correctAnswers }}</div>
                      <small class="text-muted">Tačno</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-item">
                      <div class="h4 text-warning mb-0">{{ userStats.totalPoints }}</div>
                      <small class="text-muted">Poena</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-item">
                      <div class="h4 text-info mb-0">{{ accuracyPercent }}%</div>
                      <small class="text-muted">Tačnost</small>
                    </div>
                  </div>
                </div>
                
                <div class="mt-3">
                  <div class="progress" style="height: 8px;">
                    <div 
                      class="progress-bar bg-success" 
                      :style="`width: ${accuracyPercent}%`"
                    ></div>
                  </div>
                  <small class="text-muted">Tačnost odgovora</small>
                </div>
                
                <router-link to="/profile" class="btn btn-outline-primary btn-sm w-100 mt-3">
                  👤 Detaljan profil
                </router-link>
              </div>
            </div>
          </section>

          <!-- Quick Leaderboard -->
          <section class="quick-leaderboard mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">🏆 Top Igrači</h5>
              </div>
              <div class="card-body">
                <div v-if="loadingLeaderboard" class="text-center py-3">
                  <div class="spinner-border spinner-border-sm text-warning"></div>
                </div>
                
                <div v-else-if="topPlayers.length > 0">
                  <div 
                    class="d-flex align-items-center justify-content-between py-2"
                    v-for="(player, index) in topPlayers.slice(0, 5)" 
                    :key="player._id"
                  >
                    <div class="d-flex align-items-center">
                      <span class="badge me-2" :class="getRankBadgeClass(index)">
                        {{ index + 1 }}
                      </span>
                      <span class="fw-bold">{{ player.username }}</span>
                    </div>
                    <span class="text-warning fw-bold">
                      {{ player.stats.totalPoints }}
                    </span>
                  </div>
                  
                  <router-link to="/leaderboard" class="btn btn-outline-warning btn-sm w-100 mt-3">
                    🏆 Kompletna lista
                  </router-link>
                </div>
                
                <div v-else class="text-center text-muted py-3">
                  <small>Nema podataka o igračima</small>
                </div>
              </div>
            </div>
          </section>

          <!-- Categories Info -->
          <section class="categories-info">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-info text-white">
                <h5 class="mb-0">🎯 Kategorije</h5>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6 mb-3">
                    <div class="category-item" @click="goToCategory('matematika')">
                      <div class="fs-2 mb-1">🧮</div>
                      <small>Matematika</small>
                    </div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="category-item" @click="goToCategory('logika')">
                      <div class="fs-2 mb-1">🧠</div>
                      <small>Logika</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="category-item" @click="goToCategory('reči')">
                      <div class="fs-2 mb-1">📝</div>
                      <small>Reči</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="category-item" @click="goToCategory('znanje')">
                      <div class="fs-2 mb-1">📚</div>
                      <small>Znanje</small>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PuzzleCard from '../components/PuzzleCard.vue'
import { puzzleAPI, userAPI } from '../../services/api'

export default {
  name: 'HomePage',
  components: {
    PuzzleCard
  },
  data() {
    return {
      dailyPuzzle: null,
      userStats: null,
      topPlayers: [],
      loadingPuzzle: false,
      loadingLeaderboard: false,
      error: null
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user && user.role === 'admin'
    },
    accuracyPercent() {
      if (!this.userStats || this.userStats.totalSolved === 0) return 0
      return Math.round((this.userStats.correctAnswers / this.userStats.totalSolved) * 100)
    }
  },
  async created() {
    await Promise.all([
      this.loadDailyPuzzle(),
      this.loadTopPlayers()
    ])
    
    if (this.isLoggedIn) {
      await this.loadUserStats()
    }
  },
  methods: {
    goToCategory(category) {
      this.$router.push({ name: 'ArchivePage', query: { category } })
    },
    async loadDailyPuzzle() {
      try {
        this.loadingPuzzle = true
        this.error = null
        const response = await puzzleAPI.getDailyPuzzle()
        this.dailyPuzzle = response.data.puzzle
      } catch (error) {
        this.error = error.response?.data?.message || 'Greška pri učitavanju slagalice'
        console.error('Load daily puzzle error:', error)
      } finally {
        this.loadingPuzzle = false
      }
    },

    async loadUserStats() {
      try {
        const response = await userAPI.getStats()
        this.userStats = response.data.stats
      } catch (error) {
        console.error('Load user stats error:', error)
      }
    },

    async loadTopPlayers() {
      try {
        this.loadingLeaderboard = true
        const response = await userAPI.getLeaderboard()
        this.topPlayers = response.data.leaderboard || []
      } catch (error) {
        console.error('Load top players error:', error)
      } finally {
        this.loadingLeaderboard = false
      }
    },

    async handleAnswerSubmit(data) {
      try {
        const response = await puzzleAPI.solvePuzzle(data.puzzleId, data.answerData)
        
        // Update puzzle card with result
        if (this.$refs.puzzleCard) {
          this.$refs.puzzleCard.setResult(response.data)
        }
        
        // Refresh user stats
        if (this.isLoggedIn) {
          await this.loadUserStats()
        }
        
      } catch (error) {
        if (error.response?.status === 400) {
          this.error = error.response.data.message
        } else {
          this.error = 'Greška pri slanju odgovora'
        }
        console.error('Submit answer error:', error)
      }
    },

    async refreshDailyPuzzle() {
      await this.loadDailyPuzzle()
      if (this.$refs.puzzleCard) {
        this.$refs.puzzleCard.resetPuzzle()
      }
    },

    scrollToPuzzle() {
      if (this.$refs.puzzleSection) {
        this.$refs.puzzleSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    },
    formatDate(date) {
      return date.toLocaleDateString('sr-RS', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    getRankBadgeClass(index) {
      if (index === 0) return 'bg-warning text-dark'
      if (index === 1) return 'bg-secondary'
      if (index === 2) return 'bg-danger'
      return 'bg-primary'
    }
  }
}
</script>

<style scoped>
.home-page {
  padding-top: 20px;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px !important;
  margin-bottom: 3rem;
}

.section-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 1rem;
}

.stat-item {
  transition: transform 0.3s ease;
  cursor: default;
}

.stat-item:hover {
  transform: scale(1.05);
}

.category-item {
  transition: transform 0.3s ease;
  cursor: default;
}

.category-item:hover {
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .hero-section {
    margin: -20px -15px 3rem -15px;
    border-radius: 0 !important;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .col-6 {
    margin-bottom: 1rem;
  }
}
</style>