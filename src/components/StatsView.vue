<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useImpoundStore } from '@/stores/impoundStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const emit = defineEmits<{
  (e: 'navigate-to-impound'): void
}>();

const goToImpound = () => emit('navigate-to-impound');

const store = useImpoundStore();

const lineCanvas = ref<HTMLCanvasElement | null>(null);
const barCanvas = ref<HTMLCanvasElement | null>(null);

let lineChart: Chart | null = null;
let barChart: Chart | null = null;

// --- DATA ---
const groupedByDate = computed(() => {
  const map: Record<string, number> = {};
  store.impoundList.forEach((r: any) => {
    const d = r.date || 'Unknown';
    map[d] = (map[d] || 0) + 1;
  });
  const entries = Object.entries(map).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  return { labels: entries.map(e => e[0]), data: entries.map(e => e[1]) };
});

const byVehicleType = computed(() => {
  const map: Record<string, number> = {};
  store.impoundList.forEach((r: any) => {
    const t = r.vehicleType || 'Unknown';
    map[t] = (map[t] || 0) + 1;
  });
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return { labels: entries.map(e => e[0]), data: entries.map(e => e[1]) };
});

// --- CHARTS ---
const renderLine = () => {
  if (!lineCanvas.value) return;
  if (lineChart) lineChart.destroy();

  lineChart = new Chart(lineCanvas.value, {
    type: 'line',
    data: {
      labels: groupedByDate.value.labels,
      datasets: [{
        label: 'Impounds',
        data: groupedByDate.value.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.15)',
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
};

const renderBar = () => {
  if (!barCanvas.value) return;
  if (barChart) barChart.destroy();

  barChart = new Chart(barCanvas.value, {
    type: 'bar',
    data: {
      labels: byVehicleType.value.labels,
      datasets: [{
        data: byVehicleType.value.data,
        backgroundColor: '#2563eb',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
};

watch(() => store.impoundList.length, () => {
  renderLine();
  renderBar();
});

onMounted(() => {
  renderLine();
  renderBar();
});
</script>

<template>
  <main class="stats-root">

    <!-- 🔵 HEADER (improved) -->
    <header class="app-header">
      <div class="app-brand">
        <svg class="brand-logo" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.2"/>
          <circle cx="8" cy="12" r="1.6" fill="currentColor"/>
          <circle cx="16" cy="12" r="1.6" fill="currentColor"/>
        </svg>
        <div class="brand-text">
          <div class="app-title">BCPS-1 TRAFFIC SECTION</div>
          <div class="app-subtitle">Impoundment Dashboard</div>
        </div>
      </div>

      <nav class="app-nav" aria-label="Primary">
        <button class="nav-btn" @click="goToImpound">Impound List</button>
      </nav>
    </header>

    <!-- DASHBOARD -->
    <section class="dashboard">

      <div class="dashboard-header">
        <h2>Statistics Overview</h2>
        <p>Real-time summary of impounded vehicles</p>
      </div>

      <!-- CARDS -->
      <div class="cards">
        <div class="card">
          <span class="icon">📊</span>
          <h3>Total Impounds</h3>
          <p class="value">{{ store.impoundList.length }}</p>
        </div>

        <div class="card">
          <span class="icon">🚗</span>
          <h3>Most Common Type</h3>
          <p class="value">{{ byVehicleType.labels[0] || '—' }}</p>
        </div>

        <div class="card">
          <span class="icon">📅</span>
          <h3>Recorded Days</h3>
          <p class="value">{{ groupedByDate.labels.length }}</p>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="charts">
        <div class="chart-box">
          <h4>Impounds Over Time</h4>
          <canvas ref="lineCanvas"></canvas>
        </div>

        <div class="chart-box">
          <h4>Vehicle Type Distribution</h4>
          <canvas ref="barCanvas"></canvas>
        </div>
      </div>

    </section>
  </main>
</template>

<style scoped>
/* ROOT */
.stats-root {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f1f5f9, #ffffff);
}

/* HEADER */

/* App header (shared look) */
.app-header {
  display:flex; align-items:center; justify-content:space-between;
  gap:1rem; padding:1rem 1.25rem; background: linear-gradient(90deg,#0b1220,#1e40af);
  color:#fff; box-shadow:0 6px 18px rgba(2,6,23,0.12);
}
.app-brand { display:flex; align-items:center; gap:0.75rem; }
.brand-logo { color:#fff; background: rgba(255,255,255,0.06); padding:6px; border-radius:8px; }
.brand-text .app-title { font-weight:700; font-size:1rem; }
.brand-text .app-subtitle { font-size:0.85rem; opacity:0.9; margin-top:2px; }
.app-nav { display:flex; gap:0.5rem; }
.nav-btn { background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.06); padding:0.45rem 0.75rem; border-radius:8px; cursor:pointer; }
.nav-btn:hover { background:rgba(255,255,255,0.12); }

/* NAV BUTTON */
.btn-nav {
  background: rgba(255,255,255,0.15);
  border: none;
  padding: 0.6rem 1rem;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-nav:hover {
  background: rgba(255,255,255,0.25);
}

/* DASHBOARD */
.dashboard {
  max-width: 1200px;
  margin: auto;
  padding: 2rem;
}

.dashboard-header h2 {
  margin: 0;
}

.dashboard-header p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* CARDS */
.cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  flex: 1;
  background: white;
  padding: 1.2rem;
  border-radius: 0.8rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  text-align: center;
}

.icon {
  font-size: 1.5rem;
}

.value {
  font-size: 1.6rem;
  font-weight: bold;
  margin-top: 0.5rem;
}

/* CHARTS */
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-box {
  background: white;
  padding: 1rem;
  border-radius: 0.8rem;
  height: 350px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.04);
}

.chart-box canvas {
  width: 100%;
  height: 100%;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .cards {
    flex-direction: column;
  }

  .charts {
    grid-template-columns: 1fr;
  }
}
</style>