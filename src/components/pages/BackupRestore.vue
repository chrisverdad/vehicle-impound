<template>
  <div>
    <div class="page-header">
      <div class="breadcrumb"><span @click="page='dashboard'" style="cursor:pointer">Home</span> › Backup &amp; Restore</div>
      <h1>Backup &amp; Restore</h1>
      <p>Local and cloud backup options for your impound records</p>
    </div>

    <div v-if="msg" class="alert" :class="msg.type==='success'?'alert-success':'alert-danger'">{{ msg.text }}</div>

    <!-- CLOUD SETUP -->
    <div class="card" style="margin-bottom:20px;border:1px solid rgba(33,150,243,0.25);background:linear-gradient(135deg,rgba(33,150,243,0.05),rgba(33,150,243,0.02))">
      <div class="card-header">
        <div class="card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          ☁️ Cloud Backup Setup
        </div>
        <span v-if="cloudConfigured" style="font-size:11px;background:rgba(39,174,96,0.15);color:#27ae60;border:1px solid rgba(39,174,96,0.3);padding:3px 10px;border-radius:20px;font-weight:600">● CONNECTED</span>
        <span v-else style="font-size:11px;background:rgba(192,57,43,0.15);color:#e74c3c;border:1px solid rgba(192,57,43,0.3);padding:3px 10px;border-radius:20px;font-weight:600">● NOT CONFIGURED</span>
      </div>

      <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px">
        Connect to <strong style="color:#4fc3f7">JSONBin.io</strong> (free cloud storage) to enable cloud backup and auto-sync.
        Get a free API key at <strong style="color:var(--gold2)">jsonbin.io</strong> → Sign Up → Master Key.
      </p>

      <div class="form-grid" style="margin-bottom:16px">
        <div class="form-group full">
          <label>JSONBIN.IO MASTER KEY (X-Master-Key)</label>
          <div style="position:relative">
            <input :type="showApiKey?'text':'password'" v-model="apiKey" placeholder="$2a$10$..." style="width:100%;padding-right:40px" />
            <button @click="showApiKey=!showApiKey" type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray);padding:4px">
              <svg v-if="showApiKey" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="form-group full">
          <label>BIN ID <span style="color:var(--gray);font-weight:400">(auto-created on first save, or paste existing)</span></label>
          <input v-model="binId" placeholder="Leave empty to create a new bin automatically" />
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" @click="saveCloudConfig" :disabled="!apiKey">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
          Save Cloud Config
        </button>
        <button class="btn btn-secondary" v-if="cloudConfigured" @click="clearCloudConfig">Clear Config</button>
      </div>

      <div v-if="cloudConfigured" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border2);font-size:12px;color:var(--gray)">
        <span>Auto-sync: <strong style="color:#27ae60">ON</strong> — Records are automatically saved to cloud on every change.</span>
        <span v-if="lastCloudSync" style="margin-left:16px">Last synced: <strong style="color:var(--gold2)">{{ lastCloudSync }}</strong></span>
      </div>
    </div>

    <!-- CLOUD ACTIONS -->
    <div v-if="cloudConfigured" class="grid-2" style="margin-bottom:20px">
      <div class="card" style="border:1px solid rgba(33,150,243,0.2)">
        <div class="card-header"><div class="card-title">☁️ Save to Cloud</div></div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px">Manually push all current records to the cloud now. Auto-sync already does this on every record change.</p>
        <button class="btn btn-primary" @click="cloudBackup" :disabled="cloudLoading" style="width:100%">
          <svg v-if="!cloudLoading" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>
          <span v-if="cloudLoading">⏳ Saving...</span>
          <span v-else>☁️ Save to Cloud Now</span>
        </button>
      </div>
      <div class="card" style="border:1px solid rgba(39,174,96,0.2)">
        <div class="card-header"><div class="card-title">☁️ Restore from Cloud</div></div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px"><span style="color:#e74c3c">⚠</span> This will replace all current records with the latest cloud backup.</p>
        <button class="btn btn-success" @click="cloudRestore" :disabled="cloudLoading" style="width:100%">
          <svg v-if="!cloudLoading" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="16" x2="12" y2="7"/></svg>
          <span v-if="cloudLoading">⏳ Restoring...</span>
          <span v-else>☁️ Restore from Cloud</span>
        </button>
      </div>
    </div>

    <!-- LOCAL BACKUP -->
    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><div class="card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Download Local Backup
        </div></div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:20px">Export all records as a <strong style="color:var(--gold2)">JSON backup file</strong> saved to your device.</p>
        <div style="background:rgba(201,168,76,0.06);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:20px">
          <div style="font-size:12px;color:var(--gray);margin-bottom:10px;font-weight:600;letter-spacing:0.5px">BACKUP SUMMARY</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--gray)">Total Records</span><strong style="color:var(--gold2)">{{ records.length }}</strong></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--gray)">Impounded</span><strong style="color:#e74c3c">{{ activeImpounded }}</strong></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--gray)">Released</span><strong style="color:#27ae60">{{ totalReleased }}</strong></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--gray)">Backup Date</span><strong style="color:rgba(255,255,255,0.8)">{{ todayDate }}</strong></div>
          </div>
        </div>
        <button class="btn btn-primary" @click="createBackup" style="width:100%">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Download Backup File (.json)
        </button>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 8 12 3 17 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Restore from Local File
        </div></div>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:20px">Select a <strong style="color:var(--gold2)">.json backup file</strong> to restore records. <span style="color:#e74c3c">⚠ This will replace all current records.</span></p>
        <div style="background:rgba(255,255,255,0.03);border:2px dashed rgba(255,255,255,0.12);border-radius:8px;padding:28px;text-align:center;margin-bottom:16px;cursor:pointer;transition:border-color 0.2s"
             @click="fileInput.click()" @dragover.prevent @drop.prevent="onDrop"
             :style="restoreFile ? 'border-color:rgba(39,174,96,0.5);background:rgba(39,174,96,0.05)' : ''">
          <div style="font-size:28px;margin-bottom:8px">{{ restoreFile ? '✅' : '📂' }}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7)">{{ restoreFile ? restoreFile.name : 'Click to browse or drag & drop your backup file here' }}</div>
          <div v-if="!restoreFile" style="font-size:11px;color:var(--gray);margin-top:4px">Accepts .json backup files only</div>
        </div>
        <input type="file" ref="fileInput" accept=".json" style="display:none" @change="onFileSelect" />
        <button class="btn btn-success" @click="doRestore" :disabled="!restoreFile" style="width:100%" :style="restoreFile?'':'opacity:0.5'">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.08"/></svg>
          Restore from File
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useImpoundStore } from '../../composables/useImpoundStore.js'

const { page, records, activeImpounded, totalReleased, todayDate, nextId } = useImpoundStore()

const msg = ref(null)
const restoreFile = ref(null)
const fileInput = ref(null)
const cloudLoading = ref(false)
const showApiKey = ref(false)

// Cloud config — persisted in localStorage
const apiKey = ref(localStorage.getItem('bcpo_cloud_key') || '')
const binId = ref(localStorage.getItem('bcpo_cloud_bin') || '')
const lastCloudSync = ref(localStorage.getItem('bcpo_cloud_sync') || '')
const cloudConfigured = ref(!!(apiKey.value && binId.value))

function flash(type, text) { msg.value = { type, text }; setTimeout(() => msg.value = null, 6000) }

// ── Cloud Config ──
function saveCloudConfig() {
  localStorage.setItem('bcpo_cloud_key', apiKey.value)
  localStorage.setItem('bcpo_cloud_bin', binId.value)
  cloudConfigured.value = !!(apiKey.value)
  flash('success', '✅ Cloud configuration saved.')
}

function clearCloudConfig() {
  apiKey.value = ''; binId.value = ''; lastCloudSync.value = ''
  localStorage.removeItem('bcpo_cloud_key')
  localStorage.removeItem('bcpo_cloud_bin')
  localStorage.removeItem('bcpo_cloud_sync')
  cloudConfigured.value = false
  flash('success', 'Cloud config cleared.')
}

// ── Cloud Save ──
async function cloudBackup() {
  if (!apiKey.value) return
  cloudLoading.value = true
  try {
    const payload = {
      version: '1.0', system: 'BCPO Station 1', savedAt: new Date().toISOString(),
      totalRecords: records.value.length, records: records.value
    }
    let res
    if (binId.value) {
      // Update existing bin
      res = await fetch(`https://api.jsonbin.io/v3/b/${binId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey.value },
        body: JSON.stringify(payload)
      })
    } else {
      // Create new bin
      res = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey.value,
          'X-Bin-Name': 'BCPO-Impound-Records',
          'X-Bin-Private': 'true'
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        binId.value = data.metadata.id
        localStorage.setItem('bcpo_cloud_bin', binId.value)
        cloudConfigured.value = true
        res = { ok: true }
      }
    }
    if (res.ok || res.status === 200) {
      const now = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
      lastCloudSync.value = now
      localStorage.setItem('bcpo_cloud_sync', now)
      flash('success', `✅ Cloud backup saved successfully at ${now}.`)
    } else {
      const err = await res.json().catch(() => ({}))
      flash('danger', `❌ Cloud save failed: ${err.message || res.status}. Check your API key.`)
    }
  } catch (e) {
    flash('danger', '❌ Network error. Check your internet connection.')
  }
  cloudLoading.value = false
}

// ── Cloud Restore ──
async function cloudRestore() {
  if (!apiKey.value || !binId.value) return
  if (!confirm('Restore from cloud? This will replace all current records.')) return
  cloudLoading.value = true
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId.value}/latest`, {
      headers: { 'X-Master-Key': apiKey.value }
    })
    if (!res.ok) {
      flash('danger', '❌ Cloud restore failed. Check your API key and Bin ID.')
    } else {
      const data = await res.json()
      const payload = data.record
      if (!payload.records || !Array.isArray(payload.records)) throw new Error('Invalid data')
      records.value = payload.records
      nextId.value = Math.max(...payload.records.map(r => r.id || 0), 0) + 1
      flash('success', `✅ Restored ${payload.records.length} records from cloud (saved ${payload.savedAt?.split('T')[0]}).`)
    }
  } catch {
    flash('danger', '❌ Failed to parse cloud data. The backup may be corrupted.')
  }
  cloudLoading.value = false
}

// ── Auto-sync to cloud on record changes ──
watch(records, () => {
  if (cloudConfigured.value && apiKey.value && binId.value) {
    cloudBackup()
  }
}, { deep: true })

// ── Local Backup ──
function createBackup() {
  const data = { version:'1.0', system:'BCPO Station 1 Impound Management System', exportedAt: new Date().toISOString(), totalRecords: records.value.length, records: records.value }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type:'application/json' }))
  a.download = `bcpo_impound_backup_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  flash('success', '✅ Backup downloaded successfully!')
}

function onFileSelect(e) { restoreFile.value = e.target.files[0] || null }
function onDrop(e) { const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.json')) restoreFile.value = f }

function doRestore() {
  if (!restoreFile.value) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (!data.records || !Array.isArray(data.records)) throw new Error()
      if (!confirm(`Restore ${data.records.length} records from backup dated ${data.exportedAt?.split('T')[0] ?? 'unknown'}?\n\nThis will replace all current records.`)) return
      records.value = data.records
      nextId.value = Math.max(...data.records.map(r => r.id || 0), 0) + 1
      restoreFile.value = null
      flash('success', `✅ Restored ${data.records.length} records successfully.`)
    } catch { flash('danger', '❌ Failed to restore: Invalid or corrupted backup file.') }
  }
  reader.readAsText(restoreFile.value)
}
</script>
