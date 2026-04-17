<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ImpoundRecord {
  id: number
  date: string
  vehicleType: string
  color: string
  plateNumber: string
  chassisNumber: string
  engineNumber: string
  driverName: string
  address: string
  violation: string
  placeOfIncident: string
  appointmentDateTime: string
  appointmentOfficer: string
}

// --- State Management ---
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const expandedId = ref<number | null>(null)

const form = reactive<ImpoundRecord>({
  id: 0,
  date: '',
  vehicleType: '',
  color: '',
  plateNumber: '',
  chassisNumber: '',
  engineNumber: '',
  driverName: '',
  address: '',
  violation: '',
  placeOfIncident: '',
  appointmentDateTime: '',
  appointmentOfficer: ''
})

const impoundList = ref<ImpoundRecord[]>([])
const vehicleTypes = ['Motorcycle', 'Car', 'Truck', 'Van', 'Bus', 'SUV', 'Tricycle', 'Other']

// --- Logic ---
const toggleRow = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}

const resetForm = () => {
  Object.assign(form, {
    id: 0, date: '', vehicleType: '', color: '', plateNumber: '',
    chassisNumber: '', engineNumber: '', driverName: '', address: '',
    violation: '', placeOfIncident: '', appointmentDateTime: '', appointmentOfficer: ''
  })
  isEditing.value = false
  editingId.value = null
}

const openForm = () => {
  resetForm()
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  resetForm()
}

const saveRecord = () => {
  if (isEditing.value && editingId.value !== null) {
    const index = impoundList.value.findIndex(r => r.id === editingId.value)
    if (index !== -1) impoundList.value[index] = { ...form }
  } else {
    const newId = impoundList.value.length > 0 ? Math.max(...impoundList.value.map(r => r.id)) + 1 : 1
    impoundList.value.push({ ...form, id: newId })
  }
  closeForm()
}

const editRecord = (record: ImpoundRecord) => {
  Object.assign(form, record)
  isEditing.value = true
  editingId.value = record.id
  showForm.value = true
}

const deleteRecord = (id: number) => {
  if (confirm('Are you sure you want to delete this record?')) {
    impoundList.value = impoundList.value.filter(r => r.id !== id)
    if (expandedId.value === id) expandedId.value = null
  }
}
</script>

<template>
  <div class="impound-container">
    <div class="header-section">
      <h1 class="title">IMPOUNDMENT SYSTEM</h1>
      <button class="btn btn-primary" @click="openForm">
        <span class="btn-icon">+</span> New Entry
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Driver Name</th>
            <th class="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="record in impoundList" :key="record.id">
            <tr @click="toggleRow(record.id)" class="summary-row" :class="{ 'is-active': expandedId === record.id }">
              <td class="font-bold">{{ record.date }}</td>
              <td class="driver-summary">👤 {{ record.driverName }}</td>
              <td class="text-right">
                <span class="expand-icon">{{ expandedId === record.id ? '▲' : '▼' }}</span>
              </td>
            </tr>

            <tr v-if="expandedId === record.id" class="details-row">
              <td colspan="3">
                <div class="details-content">
                  <div class="details-grid">
                    <div class="detail-item"><strong>Type of Vehicle</strong>{{ record.vehicleType }}</div>
                    <div class="detail-item"><strong>Color</strong>{{ record.color }}</div>
                    <div class="detail-item"><strong>Plate Number</strong>{{ record.plateNumber }}</div>
                    <div class="detail-item"><strong>Chassis No.</strong>{{ record.chassisNumber }}</div>
                    <div class="detail-item"><strong>Engine No.</strong>{{ record.engineNumber }}</div>
                    <div class="detail-item"><strong>Violation</strong><span class="violation-badge">{{ record.violation }}</span></div>
                    <div class="detail-item full-width"><strong>Address</strong>{{ record.address }}</div>
                    <div class="detail-item"><strong>Place of Incident</strong>{{ record.placeOfIncident }}</div>
                    <div class="detail-item"><strong>Appointment Date/Time</strong>{{ record.appointmentDateTime.replace('T', ' ') }}</div>
                    <div class="detail-item"><strong>Appointment Officer</strong>{{ record.appointmentOfficer }}</div>
                  </div>
                  
                  <div class="detail-footer">
                    <button class="btn btn-edit" @click.stop="editRecord(record)">✏️ Edit</button>
                    <button class="btn btn-delete" @click.stop="deleteRecord(record.id)">🗑️ Delete</button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="impoundList.length === 0">
            <td colspan="3" class="no-data">No records found. Click "New Entry" to start.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Record' : 'Add New Record' }}</h2>
          <button class="close-btn" @click="closeForm">✕</button>
        </div>
        
        <form @submit.prevent="saveRecord" class="impound-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Date</label>
              <input type="date" v-model="form.date" required />
            </div>
            <div class="form-group">
              <label>Type of Vehicle</label>
              <select v-model="form.vehicleType" required>
                <option value="" disabled>Select vehicle type</option>
                <option v-for="type in vehicleTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Color</label>
              <input type="text" v-model="form.color" placeholder="e.g. Red" required />
            </div>
            <div class="form-group">
              <label>Plate Number</label>
              <input type="text" v-model="form.plateNumber" required />
            </div>
            <div class="form-group">
              <label>Chassis No.</label>
              <input type="text" v-model="form.chassisNumber" required />
            </div>
            <div class="form-group">
              <label>Engine No.</label>
              <input type="text" v-model="form.engineNumber" required />
            </div>
            <div class="form-group full-width">
              <label>Driver's Name</label>
              <input type="text" v-model="form.driverName" required />
            </div>
            <div class="form-group full-width">
              <label>Address</label>
              <input type="text" v-model="form.address" required />
            </div>
            <div class="form-group">
              <label>Violation</label>
              <input type="text" v-model="form.violation" required />
            </div>
            <div class="form-group">
              <label>Place of Incident</label>
              <input type="text" v-model="form.placeOfIncident" required />
            </div>
            <div class="form-group">
              <label>Appointment Date/Time</label>
              <input type="datetime-local" v-model="form.appointmentDateTime" required />
            </div>
            <div class="form-group">
              <label>Appointment Officer</label>
              <input type="text" v-model="form.appointmentOfficer" required />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.impound-container { padding: 2rem; max-width: 900px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.header-section { display: flex; justify-content: space-between; margin-bottom: 2rem; align-items: center; }
.title { color: #1e3a5f; margin: 0; font-size: 1.5rem; }

.table-container { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #1e3a5f; color: white; padding: 1rem; text-align: left; }
.data-table td { padding: 1rem; border-bottom: 1px solid #edf2f7; }

.summary-row { cursor: pointer; transition: background 0.2s; }
.summary-row:hover { background: #f7fafc; }
.summary-row.is-active { background: #ebf4ff; }

.details-content { padding: 1.5rem; background: #fcfcfc; border-left: 4px solid #2563eb; animation: fadeIn 0.3s ease; }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.detail-item { font-size: 0.9rem; color: #4a5568; }
.detail-item strong { display: block; font-size: 0.7rem; color: #a0aec0; text-transform: uppercase; margin-bottom: 2px; }
.violation-badge { background: #fff5f5; color: #c53030; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }

.detail-footer { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #edf2f7; display: flex; gap: 10px; }

.btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-primary { background: #2563eb; color: white; }
.btn-edit { background: #edf2ff; color: #4c51bf; }
.btn-delete { background: #fff5f5; color: #c53030; }
.btn-secondary { background: #edf2f7; color: #4a5568; }

.full-width { grid-column: span 2; }
.text-right { text-align: right; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: white; border-radius: 12px; width: 95%; max-width: 650px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 1.2rem; background: #1e3a5f; color: white; display: flex; justify-content: space-between; }
.impound-form { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group label { display: block; font-size: 0.8rem; margin-bottom: 4px; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 0.6rem; border: 1px solid #cbd5e0; border-radius: 4px; }
.form-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 10px; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>