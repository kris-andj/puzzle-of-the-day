<template>
  <div class="login-container">
    <div class="login-form-wrapper">
  <!-- Uklonjena nepostojeća placeholder slika -->
      
      <div class="card border-0 bg-white shadow-sm">
        <div class="card-header">
          <h2 class="fs-4 fw-bold mb-3">🔑 Prijava</h2>
          <p class="lead mb-4">
            Unesite svoje kredencijalne podatke da se prijavite
          </p>
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <div class="mb-3">
              <label class="form-label" for="email">
                <input 
                  type="email" 
                  v-model="email" 
                  class="form-control" 
                  placeholder="Unesite vaš email" 
                  required
                />
              </label>
            </div>
            
            <div class="mb-3">
              <label class="form-label" for="password">
                <input 
                  type="password" 
                  v-model="password" 
                  class="form-control" 
                  placeholder="Unesite lozinku" 
                  required
                />
              </label>
            </div>

            <div class="w-100">
              <button 
                class="btn btn-primary w-100" 
                @click="handleSubmit"
                :disabled="loading"
              >
                <span v-if="loading">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  <span>Proveravanje...</span>
                </span>
                <span v-else>Prijavi se</span>
              </button>
              <div v-if="error" class="alert alert-danger mt-2 w-100 text-center">
                {{ error }}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../../services/api'

export default {
    name: 'LoginPage',
    data() {
      return {
        email: '',
        password: '',
        loading: false,
        error: '',
        userData: null
      }
    },
    methods: {
      async handleSubmit() {
        if (!this.email || !this.password) return;
        this.loading = true;
        this.error = '';
        try {
          const response = await authAPI.login({
            email: this.email,
            password: this.password
          });
          // Store tokens
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          // Redirect to home
          this.$router.push('/');
          window.location.reload();
        } catch (error) {
          if (error.response?.status === 400) {
            this.error = error.response.data.message;
          } else {
            this.error = 'Greška pri prijavi';
          }
          if (this.$toast) {
            this.$toast.error(this.error);
            this.$toast.clear();
          }
        } finally {
          this.loading = false;
        }
      },
      async fetchUserData() {
        try {
          const response = await authAPI.getProfile();
          this.userData = response.data;
        } catch (error) {
          console.error('Fetch user data error:', error);
        }
      }
    },
    computed: {
      isLoggedIn() {
        return !!localStorage.getItem('token');
      }
    }
  }
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem 0;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.spinner-border {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}

.toast-enter-active {
  animation: toastEnter;
  animation-fill-mode: forwards;
}

.toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  width: 280px;
}

@media (max-width: 768px) {
  .login-container {
    margin: 0 auto;
    padding: 2rem 0;
    border-radius: 0 !important;
  }
}
</style>