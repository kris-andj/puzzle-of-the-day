<template>
	<div class="leaderboard-container">
		<div class="card border-0 shadow-sm mt-4">
			<div class="card-header bg-primary text-white">
				<h2 class="fs-4 fw-bold mb-3">🏆 Rang lista</h2>
				<p class="lead mb-4">Pogledaj najbolje korisnike i njihova postignuća!</p>
			</div>
			<div class="card-body">
				<div class="table-responsive">
					<table class="table table-hover">
						<thead>
							<tr>
								<th>#</th>
								<th>Korisnik</th>
								<th>Poeni</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(user, idx) in leaderboard" :key="user._id">
								<td>{{ idx + 1 }}</td>
								<td>{{ user.username }}</td>
								<td>{{ user.stats?.totalPoints ?? 0 }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { userAPI } from '../../services/api';

export default {
	name: 'LeaderboardPage',
	data() {
		return {
			leaderboard: [],
			loading: false,
			error: ''
		}
	},
	methods: {
		async fetchLeaderboard() {
			this.loading = true;
			this.error = '';
			try {
				const response = await userAPI.getLeaderboard();
				this.leaderboard = response.data.leaderboard || [];
			} catch (error) {
				this.error = 'Greška pri učitavanju rang liste';
				console.error('Leaderboard error:', error);
			} finally {
				this.loading = false;
			}
		}
	},
	mounted() {
		this.fetchLeaderboard();
	}
}
</script>

<style scoped>
.leaderboard-container {
	max-width: 700px;
	margin: 0 auto;
	padding: 2rem 0;
}

.table th {
	background-color: #f8f9fa;
	font-weight: 600;
}

.table td {
	vertical-align: middle;
}
</style>
