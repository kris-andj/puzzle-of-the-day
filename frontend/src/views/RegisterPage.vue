<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <img 
        src="https://placehold.co/300x200/f8f9fa?text=Registrirajte" 
        alt="Registracija" 
        class="rounded-circle img-fluid me-3"
      />
      
      <div class="card border-0 bg-white shadow-sm">
        <div class="card-header bg-primary text-white">
          <h2 class="fs-4 fw-bold mb-3">🔑 Registracija</h2>
          <p class="lead mb-4">
            Kreirajte novi nalog i pristupite igranju slagalica!
          </p>
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <div class="mb-3">
              <label class="form-label" for="username">
                <input 
                  type="text" 
                  v-model="username" 
                  class="form-control" 
                  placeholder="Unesite korisničko ime" 
                  required
                />
              </label>
            </div>
            
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
            
            <div class="mb-3">
              <label class="form-label" for="confirmPassword">
                <input 
                  type="password" 
                  v-model="confirmPassword" 
                  class="form-control" 
                  placeholder="Ponovite lozinku" 
                  required
                />
              </label>
            </div>
            
            <button 
              class="btn btn-primary w-100" 
              @click="handleSubmit"
              :disabled="loading || !isValid"
            >
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-1"></span>
                <span>Proveravanje...</span>
              </span>
              <span v-else>Registruj se</span>
            </button>
            <div v-if="error" class="alert alert-danger mt-2 w-100 text-center">
              {{ error }}
            </div>
            </div>
          </div>
      </div>
    </div>
  </div>
  </template>

<script>
import { authAPI } from '../../services/api';

export default {
  name: 'RegisterPage',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: '',
      userData: null
    }
  },
  computed: {
    isValid() {
      return (
        this.username &&
        this.email &&
        this.password &&
        this.confirmPassword &&
        this.password === this.confirmPassword
      );
    },
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isValid) return;
      this.loading = true;
      this.error = '';
      try {
        const response = await authAPI.register({
          username: this.username,
          email: this.email,
          password: this.password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.$router.push('/');
        window.location.reload();
      } catch (error) {
        if (error.response?.status === 400) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Greška pri registraciji';
        }
        if (this.$toast) {
          this.$toast.error(this.error);
          this.$toast.clear();
        }
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Optionally fetch user data if needed
  }
}
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem 0;
  border-radius: 12px !important;
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
  .register-container {
    margin: 0 auto;
    padding: 2rem 0;
    border-radius: 0 !important;
  }
  
  .col-6 {
    margin-bottom: 1rem;
  }
  
  .display-4 {
    font-size: 2rem;
  }
  
  .col-6 {
    margin-bottom: 1rem;
  }
}
</style>