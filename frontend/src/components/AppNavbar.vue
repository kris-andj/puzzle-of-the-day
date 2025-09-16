<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container">
      
      <router-link class="navbar-brand fw-bold" to="/">
        <span class="fs-3">🧩</span>
        Slagalica Dana
      </router-link>
      
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      
      <div class="collapse navbar-collapse" id="navbarNav">
        
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" active-class="active">
              🏠 Početna
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/leaderboard" active-class="active">
              🏆 Rang Lista
            </router-link>
          </li>
        </ul>
        
        
        <ul class="navbar-nav">
          
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login" active-class="active">
                🔑 Prijava
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link btn btn-outline-light ms-2" to="/register">
                📝 Registracija
              </router-link>
            </li>
          </template>
          
          
          <template v-else>
            <li class="nav-item dropdown" v-if="user">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <span class="me-2">👤</span>
                <span class="fw-bold">{{ user.username }}</span>
                <span v-if="userStats" class="badge bg-warning ms-2">
                  {{ userStats.totalPoints }}
                </span>
              </a>
              
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    👤 Moj Profil
                  </router-link>
                </li>
                <li v-if="user.role === 'admin'">
                  <router-link class="dropdown-item" to="/admin">
                    ⚙️ Admin Panel
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click="logout">
                    🚪 Odjava
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { userAPI } from '../../services/api'

export default {
  name: 'AppNavbar',
  data() {
    return {
      userStats: null
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    },
    user() {
      const userData = localStorage.getItem('user')
      if (!userData || userData === 'undefined') return null
      try {
        return JSON.parse(userData)
      } catch (e) {
        
        localStorage.removeItem('user')
        return null
      }
    }
  },
  async mounted() {
    if (this.isLoggedIn) {
      await this.loadUserStats()
    }
  },
  methods: {
    async loadUserStats() {
      try {
        const response = await userAPI.getStats()
        this.userStats = response.data.stats
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    },
    
    logout() {
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      
      this.$router.push('/')
      
      
      window.location.reload()
    }
  },
  
  watch: {
    
    isLoggedIn(newVal) {
      if (newVal) {
        this.loadUserStats()
      } else {
        this.userStats = null
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  padding: 0.75rem 0;
}

.navbar-brand {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #fff !important;
  background-color: rgba(255,255,255,0.1);
  border-radius: 5px;
}

.nav-link.active {
  color: #fff !important;
  background-color: rgba(255,255,255,0.2);
  border-radius: 5px;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}


body {
  padding-top: 80px;
}
</style>