<template>
  <div class="container py-4">
  <PuzzleCard v-if="puzzle" :puzzle="puzzle" :show-answer-section="true" @answer-submitted="handleAnswerSubmit" ref="puzzleCard" />
    <div v-else class="alert alert-info">Učitavanje slagalice...</div>
  </div>
</template>

<script>
import { puzzleAPI } from '../../services/api'
import PuzzleCard from '../components/PuzzleCard.vue'

export default {
  name: 'PuzzlePage',
  components: { PuzzleCard },
  data() {
    return {
      puzzle: null
    }
  },
  async created() {
    const id = this.$route.params.id
    const res = await puzzleAPI.getPuzzleById(id)
    this.puzzle = res.data.puzzle
  },
  methods: {
    async handleAnswerSubmit(data) {
      try {
        const response = await puzzleAPI.solvePuzzle(data.puzzleId, data.answerData)
        if (this.$refs.puzzleCard) {
          this.$refs.puzzleCard.setResult(response.data)
        }
      } catch (error) {
        let msg = error.response?.data?.message || 'Greška pri slanju odgovora!';
        alert(msg);
        console.error('Submit answer error:', error)
      }
    }
  }
}
</script>
