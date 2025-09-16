import { userAPI } from '../services/api'
import api from '../services/api'

<template>
  <footer class="bg-light border-top mt-auto">
    <div class="container py-4">
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-3">
          <h5 class="text-primary">🧩 Slagalica Dana</h5>
          <p class="text-muted">
            Mentalno vežbanje kroz zabavu. Rešavaj zanimljive slagalice svaki dan i 
            vežbaj um kroz različite kategorije zadataka.
          </p>
        </div>
        
        <div class="col-md-6 col-lg-4 mb-3">
          <h6 class="text-dark">Brze veze</h6>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="text-decoration-none text-muted">
                🏠 Početna
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/leaderboard" class="text-decoration-none text-muted">
                🏆 Rang Lista
              </router-link>
            </li>
            <li class="mb-2" v-if="!isLoggedIn">
              <router-link to="/register" class="text-decoration-none text-muted">
                📝 Registruj se
              </router-link>
            </li>
            <li class="mb-2" v-if="isLoggedIn">
              <router-link to="/profile" class="text-decoration-none text-muted">
                👤 Moj Profil
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="col-lg-4 mb-3">
          <h6 class="text-dark">Statistike aplikacije</h6>
          <div class="row" v-if="appStats">
            <div class="col-6">
              <div class="text-center">
                <div class="h5 text-primary mb-0">{{ appStats.totalUsers }}</div>
                <small class="text-muted">Korisnika</small>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <div class="h5 text-success mb-0">{{ appStats.totalSolved }}</div>
                <small class="text-muted">Rešeno</small>
              </div>
            </div>
          </div>
          
          <div v-else class="text-muted">
            <small>Učitavanje statistika...</small>
          </div>
        </div>
      </div>
      
      <hr class="my-4">
      
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="text-muted mb-0">
            &copy; {{ currentYear }} Slagalica Dana - SE330 Projekat
          </p>
        </div>
        <div class="col-md-6 text-md-end">
          <small class="text-muted">
            Verzija {{ appVersion }} | 
            <span class="text-success">Server: {{ serverStatus }}</span>
          </small>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { userAPI } from '../../services/api'
import api from '../../services/api'

export default {
  name: 'AppFooter',
  data() {
    return {
      appStats: null,
      appVersion: '1.0.0',
      serverStatus: 'Checking...',
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  async mounted() {
    await this.loadAppStats()
    await this.checkServerStatus()
  },
  methods: {
    async loadAppStats() {
      try {
        const leaderboardResponse = await userAPI.getLeaderboard()
        
        const users = leaderboardResponse.data.leaderboard
        const totalUsers = users.length
        const totalSolved = users.reduce((sum, user) => sum + (user.stats?.totalSolved || 0), 0)
        
        this.appStats = {
          totalUsers,
          totalSolved
        }
      } catch (error) {
        console.error('Error loading app stats:', error)
        this.appStats = {
          totalUsers: '...',
          totalSolved: '...'
        }
      }
    },
    
    async checkServerStatus() {
      try {
        const response = await api.get('/health')
        if (response.data.status === 'OK') {
          this.serverStatus = 'Online'
        }
      } catch (error) {
        this.serverStatus = 'Offline'
        console.error('Server status check failed:', error)
      }
    }
  }
}
</script>

<style scoped>
footer {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
}

.list-unstyled a {
  transition: all 0.3s ease;
  display: inline-block;
}

.list-unstyled a:hover {
  color: var(--bs-primary) !important;
  transform: translateX(3px);
}

.border-top {
  border-color: #dee2e6 !important;
}

.h5 {
  font-weight: 700;
  transition: transform 0.3s ease;
}

.text-center:hover .h5 {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .h5 {
    font-size: 1.1rem;
  }
  
  .col-6 {
    margin-bottom: 1rem;
  }
}
</style>