
<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="container">
        <div class="row align-items-start">
          <div class="col-md-3 text-center">
            <img 
              src="https://placehold.co/150x150/e2e8f5?text=Korisnik" 
              alt="Korisnički profil" 
              class="rounded-circle img-fluid"
            />
            <h2 class="mt-3">{{ userProfile.username }}</h2>
            <p class="text-muted">{{ userProfile.email }}</p>
          </div>
          <div class="col-md-9">
            <div v-if="userProfile.role !== 'admin'" class="profile-tabs justify-content-center mt-4 mb-4 d-flex gap-3">
              <button 
                class="tab-button btn btn-primary px-4 py-2"
                :class="{'tab-active': activeTab === 'stats', 'btn-primary': activeTab === 'stats', 'btn-outline-primary': activeTab !== 'stats'}"
                @click="setActiveTab('stats')"
              >
                <i class="fas fa-chart-bar me-2"></i>
                <span>Statistika</span>
              </button>
              <button 
                class="tab-button btn btn-primary px-4 py-2"
                :class="{'tab-active': activeTab === 'achievements', 'btn-primary': activeTab === 'achievements', 'btn-outline-primary': activeTab !== 'achievements'}"
                @click="setActiveTab('achievements')"
              >
                <i class="fas fa-trophy me-2"></i>
                <span>Postignuća</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Stats Tab -->
  <div v-if="activeTab === 'stats' && userProfile.role !== 'admin'" class="profile-content">
      <div class="stats-cards row">
        <!-- Total Solved -->
        <div class="col-md-4 mb-4">
          <div class="stat-card">
            <div class="header">
              <i class="fas fa-flag-check text-primary"></i>
              <span class="fs-4">Statistika</span>
              <span class="badge bg-warning text-dark float-right">{{ userStats.totalSolved }}</span>
              <span class="badge bg-success text-white float-right">+{{ userStats.streak }}</span>
            </div>
            <div class="chart-placeholder bg-gray-100" style="height: 200px;"></div>
          </div>
        </div>
        <!-- Correct Answers -->
        <div class="col-md-4 mb-4">
          <div class="stat-card">
            <div class="header">
              <i class="fas fa-bullseye text-success"></i>
              <span class="fs-4">Tačni odgovori</span>
              <span class="badge bg-info text-white float-right">{{ userStats.correctAnswers }}</span>
              <span class="badge bg-warning text-white float-right">{{ userStats.accuracy }}%</span>
            </div>
            <div class="chart-placeholder bg-gray-100" style="height: 200px;"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Achievements Tab -->
    <div v-if="activeTab === 'achievements' && userProfile.role !== 'admin'" class="profile-content">
      <h3 class="section-title">Rešeni kvizovi</h3>
      <div v-if="recentActivity && recentActivity.length">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Naziv kviza</th>
                <th>Kategorija</th>
                <th>Poeni</th>
                <th>Odgovor</th>
                <th>Tačno</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="progress in recentActivity" :key="progress._id">
                <td>{{ progress.puzzle?.title || '-' }}</td>
                <td>{{ progress.puzzle?.category || '-' }}</td>
                <td>{{ progress.pointsEarned }}</td>
                <td>{{ progress.userAnswer }}</td>
                <td>
                  <span v-if="progress.isCorrect" class="text-success">Tačno</span>
                  <span v-else class="text-danger">Netačno</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="alert alert-info mt-3">Nema rešenih kvizova.</div>
    </div>
  </div>
</template>


<script>
import { userAPI } from '../../services/api';

export default {
  name: 'ProfilePage',
  data() {
    return {
      activeTab: 'stats',
      userProfile: {
        username: '',
        email: ''
      },
      userStats: {
        totalSolved: 0,
        streak: 0,
        correctAnswers: 0,
        accuracy: 0
      },
  userAchievements: [],
  recentActivity: []
    }
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  methods: {
    async loadUserProfile() {
      try {
        const response = await userAPI.getProfile();
        this.userProfile = response.data.user || { username: '', email: '' };
      } catch (error) {
        console.error('Load user profile error:', error);
      }
    },
    async loadUserStats() {
      try {
        const response = await userAPI.getStats();
        this.userStats = response.data.stats || { totalSolved: 0, streak: 0, correctAnswers: 0, accuracy: 0 };
        this.recentActivity = response.data.recentActivity || [];
      } catch (error) {
        console.error('Load user stats error:', error);
      }
    },
  // async loadUserAchievements() {
  //   try {
  //     const response = await userAPI.getUserAchievements();
  //     this.userAchievements = response.data.achievements || [];
  //   } catch (error) {
  //     console.error('Load achievements error:', error);
  //   }
  // },
    setActiveTab(tab) {
      this.activeTab = tab;
    }
  },
  mounted() {
  this.loadUserProfile();
  this.loadUserStats();
  // this.loadUserAchievements();
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
}

.profile-header {
  padding-bottom: 2rem;
}

.profile-content {
  padding: 2rem 0;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.achievement-card {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.achievement-card:hover {
  transform: scale(1.03);
}

.chart-placeholder {
  background: #e2e8f5;
  border-radius: 12px;
}


/* Novi stil za tab dugmiće */
.profile-tabs {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.tab-button {
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
  transition: all 0.2s;
}
.tab-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #0d6efd33;
}
.tab-active {
  background: #0d6efd !important;
  color: #fff !important;
  border: 1.5px solid #0d6efd !important;
}
.tab-button:not(.tab-active) {
  background: #fff !important;
  color: #0d6efd !important;
  border: 1.5px solid #0d6efd !important;
}

.section-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 1rem;
}

.achievement-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.text-muted {
  opacity: 0.7;
}
</style>