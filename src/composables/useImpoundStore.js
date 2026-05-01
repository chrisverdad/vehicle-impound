import { ref, computed, watch } from 'vue'
import { sampleRecords } from '../data/sampleRecords.js'

// ── Load persisted records from localStorage ──
function loadRecords() {
  try {
    const saved = localStorage.getItem('bcpo_records')
    if (saved) {
      const data = JSON.parse(saved)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return [...sampleRecords]
}

function loadNextId() {
  try {
    const saved = localStorage.getItem('bcpo_nextId')
    if (saved) return parseInt(saved, 10)
  } catch {}
  return 8
}

// ── Singleton state (shared across all components) ──
const isLoggedIn = ref(false)
const page = ref('dashboard')
const reportTab = ref('overview')
const records = ref(loadRecords())
const nextId = ref(loadNextId())
const currentTime = ref('')
const showModal = ref(false)
const selectedRecord = ref(null)
const showLogoutDialog = ref(false)
const mobileMenuOpen = ref(false)
const showReleaseDialog = ref(false)
const releaseTarget = ref(null)
const releaseMode = ref('release')
const showEditModal = ref(false)
const editTarget = ref(null)
const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const showDetailsModal = ref(false)
const detailRecord = ref(null)

// ── Toast ──
let _toastTimer = null
const toast = ref({ show: false, type: 'success', title: '', message: '', duration: 3500 })
function showToast(type, title, message, duration = 3500) {
  if (_toastTimer) clearTimeout(_toastTimer)
  toast.value = { show: true, type, title, message, duration }
  _toastTimer = setTimeout(() => { toast.value.show = false }, duration)
}
function hideToast() { toast.value.show = false; if (_toastTimer) clearTimeout(_toastTimer) }

// ── Auto-persist records to localStorage ──
function persistRecords() {
  try {
    localStorage.setItem('bcpo_records', JSON.stringify(records.value))
    localStorage.setItem('bcpo_nextId', String(nextId.value))
  } catch {}
}

watch(records, persistRecords, { deep: true })

// ── Computed ──
const todayDate = computed(() =>
  new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)
const todayStr = computed(() => new Date().toISOString().split('T')[0])
const totalImpounded = computed(() => records.value.length)
const totalReleased = computed(() => records.value.filter(r => r.status === 'Released').length)
const activeImpounded = computed(() => records.value.filter(r => r.status === 'Impounded').length)

const todayCount = computed(() => records.value.filter(r => r.date === todayStr.value).length)

// ── Clock ──
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
updateTime()
setInterval(updateTime, 1000)

// ── Utility ──
export function fmtDate(d) {
  if (!d) return ''
  const p = d.split('-')
  return p.length === 3 ? `${p[1]}/${p[2]}/${p[0]}` : d
}

export function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function useImpoundStore() {
  function login() { isLoggedIn.value = true }

  function confirmLogout() {
    showLogoutDialog.value = false
    mobileMenuOpen.value = false
    isLoggedIn.value = false
    page.value = 'dashboard'
  }

  function viewRecord(r) {
    selectedRecord.value = r
    showModal.value = true
  }

  function viewDetails(r) {
    detailRecord.value = r
    showDetailsModal.value = true
  }

  function releaseVehicle(r) {
    releaseTarget.value = r
    releaseMode.value = 'release'
    showReleaseDialog.value = true
  }

  function doConfirmedRelease() {
    if (releaseTarget.value) {
      const rec = records.value.find(x => x.id === releaseTarget.value.id)
      if (rec) rec.status = 'Released'
      persistRecords()
      showToast('success', 'Vehicle Released', `${releaseTarget.value.plate} has been released successfully.`)
    }
    showReleaseDialog.value = false
    releaseTarget.value = null
    showModal.value = false
  }

  function saveRecord(form) {
    const rec = { ...form, id: nextId.value++, status: 'Impounded' }
    records.value.push(rec)
    persistRecords()
    showToast('success', 'Record Saved', `Vehicle ${rec.plate || ''} has been impounded and saved.`)
    return rec
  }

  function impoundVehicle(r) {
    releaseTarget.value = r
    releaseMode.value = 'impound'
    showReleaseDialog.value = true
  }

  function doConfirmedImpound() {
    if (releaseTarget.value) {
      const rec = records.value.find(x => x.id === releaseTarget.value.id)
      if (rec) rec.status = 'Impounded'
      persistRecords()
      showToast('warning', 'Vehicle Re-Impounded', `${releaseTarget.value.plate} status changed to Impounded.`)
    }
    showReleaseDialog.value = false
    releaseTarget.value = null
    showModal.value = false
  }

  // ── Edit ──
  function editRecord(r) {
    editTarget.value = { ...r }
    showEditModal.value = true
  }

  function updateRecord(updated) {
    const idx = records.value.findIndex(x => x.id === updated.id)
    if (idx !== -1) {
      records.value[idx] = { ...updated }
      persistRecords()
      showToast('info', 'Record Updated', `${updated.plate || 'Record'} has been updated successfully.`)
    }
    showEditModal.value = false
    editTarget.value = null
    showModal.value = false
  }

  // ── Delete ──
  function deleteRecord(r) {
    deleteTarget.value = r
    showDeleteDialog.value = true
  }

  function doConfirmedDelete() {
    if (deleteTarget.value) {
      const plate = deleteTarget.value.plate
      records.value = records.value.filter(x => x.id !== deleteTarget.value.id)
      persistRecords()
      showToast('danger', 'Record Deleted', `Vehicle ${plate || ''} has been permanently deleted.`)
    }
    showDeleteDialog.value = false
    deleteTarget.value = null
    showModal.value = false
  }

  function downloadCSV(list) {
    const headers = ['ID','Date','Plate','Type','Color','Driver','Driver Address','Owner','Owner Address','Violation 1','Violation 2','Location','Officer','Status']
    const rows = list.map(r => [r.id, fmtDate(r.date), r.plate, r.type, r.color, r.driver, r.driverAddress, r.owner, r.ownerAddress, r.vio1, r.vio2, r.location, r.officer, r.status])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `impound_records_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return {
    isLoggedIn, page, reportTab, records, nextId, currentTime,
    showModal, selectedRecord, showLogoutDialog, mobileMenuOpen,
    showReleaseDialog, releaseTarget, releaseMode,
    showEditModal, editTarget,
    showDeleteDialog, deleteTarget,
    showDetailsModal, detailRecord,
    toast, hideToast,
    todayDate, todayStr, totalImpounded, totalReleased,
    activeImpounded, todayCount,
    login, confirmLogout, viewRecord, viewDetails, releaseVehicle, doConfirmedRelease,
    impoundVehicle, doConfirmedImpound,
    editRecord, updateRecord, deleteRecord, doConfirmedDelete,
    saveRecord, downloadCSV,
  }
}
