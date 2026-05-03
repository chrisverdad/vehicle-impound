<template>
  <div>
    <div class="page-header">
      <div class="breadcrumb"><span @click="page='dashboard'" style="cursor:pointer">Home</span> <span style="color:var(--gray)">›</span> Statistics &amp; Reports</div>
      <h1>Statistics &amp; Reports</h1>
      <p>Analytics, data summaries, and export tools</p>
    </div>

    <div class="tabs no-print">
      <div class="tab" :class="{ active: tab === 'overview' }"    @click="tab='overview'">Overview</div>
      <div class="tab" :class="{ active: tab === 'violations' }"  @click="tab='violations'">Violations Analysis</div>
    </div>

    <!-- OVERVIEW -->
    <div v-if="tab === 'overview'">
      <div class="stat-grid" style="margin-bottom:20px">
        <div class="stat-card gold"><div class="stat-val gold">{{ totalImpounded }}</div><div class="stat-label">Total Impounded</div></div>
        <div class="stat-card green"><div class="stat-val green">{{ totalReleased }}</div><div class="stat-label">Released</div></div>
        <div class="stat-card red"><div class="stat-val red">{{ activeImpounded }}</div><div class="stat-label">Active / Held</div></div>

      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><div class="card-title">Monthly Trend</div><button class="btn btn-secondary btn-sm" @click="downloadCSV(filteredRecords)">⬇ CSV</button></div>
          <div class="chart-wrap"><canvas ref="reportMonthlyRef"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Status Breakdown</div></div>
          <div style="position:relative;height:300px"><canvas ref="reportStatusRef"></canvas></div>
          <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;font-size:12px">
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#e74c3c;margin-right:5px"></span>Impounded {{ activeImpounded }}</span>
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27ae60;margin-right:5px"></span>Released {{ totalReleased }}</span>

          </div>
        </div>
      </div>
    </div>



    <!-- VIOLATIONS -->
    <div v-if="tab === 'violations'">
      <div class="card">
        <div class="card-header"><div class="card-title">Top Violations</div><button class="btn btn-secondary btn-sm" @click="downloadCSV(filteredRecords)">⬇ Export</button></div>
        <div class="chart-wrap" style="height:320px"><canvas ref="violationRef"></canvas></div>
      </div>
      <div class="section-divider"></div>
      <div class="card" style="margin-top:0">
        <div class="card-header"><div class="card-title">Violation Summary</div></div>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Violation</th><th>Count</th><th>% of Total</th><th>Trend</th></tr></thead>
            <tbody>
              <tr v-for="v in violationStats" :key="v.name">
                <td>{{ v.name }}</td>
                <td><strong style="color:var(--gold2)">{{ v.count }}</strong></td>
                <td>{{ totalImpounded > 0 ? Math.round(v.count/totalImpounded*100) : 0 }}%</td>
                <td><div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;width:100px"><div style="height:6px;background:var(--gold);border-radius:3px" :style="{width:(totalImpounded>0?(v.count/totalImpounded*100):0)+'%'}"></div></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useImpoundStore } from '../../composables/useImpoundStore.js'

Chart.register(...registerables)

const { page, records, totalImpounded, totalReleased, activeImpounded, downloadCSV } = useImpoundStore()

const tab = ref('overview')

const violationStats = computed(() => {
  const c = {}
  records.value.forEach(r => { if(r.vio1) c[r.vio1]=(c[r.vio1]||0)+1; if(r.vio2) c[r.vio2]=(c[r.vio2]||0)+1 })
  return Object.entries(c).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)
})

const reportMonthlyRef = ref(null); const reportStatusRef = ref(null); const violationRef = ref(null)
const charts = {}

function destroyChart(id) { if(charts[id]){ charts[id].destroy(); delete charts[id] } }

function buildOverviewCharts() {
  const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']
  const imp = [8,12,9,15,11,14,10,16,totalImpounded.value]
  const rel = [6,9,7,11,8,10,8,13,totalReleased.value]
  if(reportMonthlyRef.value){ destroyChart('rm'); charts['rm'] = new Chart(reportMonthlyRef.value, { type:'line', data:{ labels:months, datasets:[{label:'Impounded',data:imp,borderColor:'#c9a84c',backgroundColor:'rgba(201,168,76,0.08)',tension:0.4,fill:true,borderWidth:2},{label:'Released',data:rel,borderColor:'#27ae60',backgroundColor:'rgba(39,174,96,0.06)',tension:0.4,fill:true,borderWidth:2}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8892a4',font:{size:11}},grid:{color:'rgba(255,255,255,0.04)'}},y:{ticks:{color:'#8892a4',font:{size:11}},grid:{color:'rgba(255,255,255,0.06)'}}}} }) }
  if(reportStatusRef.value){ destroyChart('rs'); charts['rs'] = new Chart(reportStatusRef.value, { type:'doughnut', data:{ labels:['Impounded','Released'], datasets:[{data:[activeImpounded.value,totalReleased.value],backgroundColor:['#e74c3c','#27ae60'],borderColor:'rgba(0,0,0,0)'}]}, options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}} }) }
}

function buildViolationChart() {
  if(!violationRef.value) return
  destroyChart('vc')
  const stats = violationStats.value.slice(0,10)
  if(!stats.length) return
  const palette = ['rgba(201,168,76,0.82)','rgba(39,174,96,0.82)','rgba(33,150,243,0.82)','rgba(231,76,60,0.82)','rgba(155,89,182,0.82)','rgba(243,156,18,0.82)','rgba(26,188,156,0.82)','rgba(52,152,219,0.82)','rgba(230,126,34,0.82)','rgba(189,195,199,0.82)']
  charts['vc'] = new Chart(violationRef.value, { type:'bar', data:{ labels:stats.map(v=>v.name), datasets:[{label:'Cases',data:stats.map(v=>v.count),backgroundColor:stats.map((_,i)=>palette[i%palette.length]),borderWidth:1,borderRadius:5}]}, options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8892a4',font:{size:11}},grid:{color:'rgba(255,255,255,0.06)'}},y:{ticks:{color:'#ddd',font:{size:12}},grid:{display:false}}}} })
}

watch(tab, async (v) => {
  await nextTick()
  if(v==='overview') buildOverviewCharts()
  if(v==='violations') buildViolationChart()
})

onMounted(() => buildOverviewCharts())
</script>
