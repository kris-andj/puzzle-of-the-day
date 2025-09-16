<template>
  <div class="archive-page container py-4">
    <h2 class="mb-4">📚 Arhiva svih slagalica</h2>
    <div class="row mb-3">
      <div class="col-md-4">
        <select v-model="selectedCategory" class="form-select">
          <option value="">Sve kategorije</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div v-for="puzzle in filteredPuzzles" :key="puzzle._id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ puzzle.title }}</h5>
            <p class="card-text"><b>Kategorija:</b> {{ puzzle.category }}</p>
            <p class="card-text">{{ puzzle.description }}</p>
            <router-link :to="{ name: 'PuzzlePage', params: { id: puzzle._id } }" class="btn btn-primary btn-sm">Radi kviz</router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-if="filteredPuzzles.length === 0" class="alert alert-info mt-4">Nema slagalica za izabranu kategoriju.</div>
  </div>
</template>

<script>
import { puzzleAPI } from '../../services/api'

export default {
  name: 'ArchivePage',
  data() {
    return {
      puzzles: [],
      selectedCategory: '',
      categories: ['matematika', 'logika', 'reči', 'znanje', 'kombinatorika']
    }
  },
  computed: {
    filteredPuzzles() {
      if (!this.selectedCategory) return this.puzzles
      return this.puzzles.filter(p => p.category === this.selectedCategory)
    }
  },
  async created() {
    const res = await puzzleAPI.getAllPuzzles()
    this.puzzles = res.data.puzzles || []
    if (this.$route.query.category) {
      this.selectedCategory = this.$route.query.category
    }
  },
  watch: {
    '$route.query.category'(val) {
      this.selectedCategory = val || ''
    }
  }
}
</script>

<style scoped>
.archive-page {
  min-height: 60vh;
}
</style>
