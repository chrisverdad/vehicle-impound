<template>
  <div class="modal-bg" v-if="showEditModal" @click.self="showEditModal = false" style="z-index:1100">
    <div class="modal" style="max-width:700px;padding:0;overflow:hidden">
      <div class="modal-header" style="padding:16px 24px;margin-bottom:0;border-bottom:1px solid var(--border2)">
        <h2>Edit Record — {{ form.plate }}</h2>
        <button class="modal-close" @click="showEditModal = false">✕</button>
      </div>

      <div v-if="form" style="padding:20px 24px;max-height:65vh;overflow-y:auto">
        <div class="form-grid" style="margin-bottom:16px">
          <div class="form-group">
            <label>TYPE OF VEHICLE</label>
            <select v-model="form.type">
              <option value="">-- Select Type --</option>
              <option>Motorcycle</option><option>Car</option><option>SUV</option>
              <option>Pickup Truck</option><option>Truck</option><option>Van</option>
              <option>Jeepney</option><option>Tricycle</option><option>Other</option>
            </select>
          </div>
          <div class="form-group"><label>PLATE NUMBER</label><input v-model="form.plate" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>COLOR</label><input v-model="form.color" /></div>
          <div class="form-group"><label>ENGINE NUMBER</label><input v-model="form.engineNo" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>CHASSIS NUMBER</label><input v-model="form.chassisNo" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>DATE APPREHENDED</label><input type="date" v-model="form.date" /></div>
          <div class="form-group"><label>TIME</label><input type="time" v-model="form.time" /></div>
          <div class="form-group"><label>LOCATION</label><input v-model="form.location" /></div>
        </div>

        <div class="form-grid" style="margin-bottom:16px">
          <div class="form-group full"><label>DRIVER'S NAME</label><input v-model="form.driver" /></div>
          <div class="form-group full"><label>DRIVER'S ADDRESS</label><input v-model="form.driverAddress" /></div>
          <div class="form-group full"><label>REGISTERED OWNER</label><input v-model="form.owner" /></div>
          <div class="form-group full"><label>OWNER'S ADDRESS</label><input v-model="form.ownerAddress" /></div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>VIOLATION 1</label>
            <select v-model="form.vio1">
              <option value="">-- Select --</option>
              <option v-for="v in violations" :key="v">{{ v }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>VIOLATION 2</label>
            <select v-model="form.vio2">
              <option value="">-- None --</option>
              <option v-for="v in violations" :key="v">{{ v }}</option>
            </select>
          </div>
          <div class="form-group full"><OfficerMultiSelect :officer1="form.officer" :officer2="form.officer2" @update:officer1="form.officer=$event" @update:officer2="form.officer2=$event" /></div>
          <div class="form-group"><label>REMARKS</label><input v-model="form.remarks" /></div>
        </div>
      </div>

      <div style="padding:16px 24px;display:flex;gap:10px;flex-wrap:wrap;border-top:1px solid var(--border2)">
        <button class="btn btn-primary" @click="doUpdate">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Changes
        </button>
        <button class="btn btn-secondary" @click="showEditModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useImpoundStore } from '../composables/useImpoundStore.js'
import OfficerMultiSelect from './OfficerMultiSelect.vue'

const { showEditModal, editTarget, updateRecord } = useImpoundStore()

const violations = ['No Helmet','No License','Expired Registration','No Registration','Reckless Driving','Illegal Parking','DUI/DWI','Overloading','Obstruction of Traffic','Illegal Modification','Hit and Run','Other Traffic Violation']

const form = ref({})

watch(editTarget, (val) => {
  if (val) form.value = { ...val }
})

function doUpdate() {
  if (!form.value.plate || !form.value.type || !form.value.driver) {
    alert('Please fill in required fields: Vehicle Type, Plate Number, and Driver Name.')
    return
  }
  updateRecord(form.value)
}
</script>
