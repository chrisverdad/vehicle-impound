<template>
  <div>
    <div class="page-header no-print">
      <div class="breadcrumb"><span @click="page='dashboard'" style="cursor:pointer">Home</span> <span style="color:var(--gray)">›</span> Impounding Receipt</div>
      <h1>Create Impounding Receipt</h1>
      <p>Fill in the form below to generate an official impound receipt</p>
    </div>

    <div v-if="receiptSaved" class="alert alert-success no-print">
      ✅ Record successfully saved! Receipt ID: <strong>{{ savedId }}</strong> — You can now print the receipt below.
    </div>

    <div class="grid-2 no-print" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><div class="card-title">Vehicle Information</div></div>
        <div class="form-grid">
          <div class="form-group">
            <label>TYPE OF VEHICLE</label>
            <select v-model="form.type">
              <option value="">-- Select Type --</option>
              <option>Motorcycle</option><option>Car</option><option>SUV</option>
              <option>Pickup Truck</option><option>Truck</option><option>Van</option>
              <option>Jeepney</option><option>Tricycle</option><option>Other</option>
            </select>
          </div>
          <div class="form-group"><label>PLATE NUMBER</label><input v-model="form.plate" placeholder="e.g. ABC 1234" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>COLOR</label><input v-model="form.color" placeholder="e.g. Red / Black" /></div>
          <div class="form-group"><label>ENGINE NUMBER</label><input v-model="form.engineNo" placeholder="e.g. 4AF1234567" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>CHASSIS NUMBER</label><input v-model="form.chassisNo" placeholder="e.g. MHF1234567" style="text-transform:uppercase" /></div>
          <div class="form-group"><label>DATE APPREHENDED</label><input type="date" v-model="form.date" /></div>
          <div class="form-group"><label>TIME</label><input type="time" v-model="form.time" /></div>
          <div class="form-group"><label>LOCATION (ALONG VICINITY OF)</label><input v-model="form.location" placeholder="e.g. J.C. Aquino Ave." /></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Driver &amp; Owner Information</div></div>
        <div class="form-grid">
          <div class="form-group full"><label>DRIVER'S NAME</label><input v-model="form.driver" placeholder="Full Name" /></div>
          <div class="form-group full"><label>DRIVER'S ADDRESS</label><input v-model="form.driverAddress" placeholder="Complete Address" /></div>
          <div class="form-group full"><label>REGISTERED OWNER</label><input v-model="form.owner" placeholder="Full Name" /></div>
          <div class="form-group full"><label>OWNER'S ADDRESS</label><input v-model="form.ownerAddress" placeholder="Complete Address" /></div>
        </div>
      </div>
    </div>

    <div class="grid-2 no-print" style="margin-bottom:20px">
      <div class="card">
        <div class="card-header"><div class="card-title">Violations</div></div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="form-group">
            <label>VIOLATION 1</label>
            <select v-model="form.vio1">
              <option value="">-- Select Violation --</option>
              <option v-for="v in violations" :key="v">{{ v }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>VIOLATION 2 (Optional)</label>
            <select v-model="form.vio2">
              <option value="">-- None --</option>
              <option v-for="v in violations" :key="v">{{ v }}</option>
            </select>
          </div>
          <div class="form-group full"><OfficerMultiSelect :officer1="form.officer" :officer2="form.officer2" @update:officer1="form.officer=$event" @update:officer2="form.officer2=$event" /></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Additional Notes</div></div>
        <div class="form-group"><label>REMARKS / NOTES</label><textarea v-model="form.remarks" placeholder="Any additional information..." style="min-height:120px"></textarea></div>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border2)">
          <div style="font-size:12px;color:var(--gray);margin-bottom:8px">CONFORMED BY (Owner/Driver Signature)</div>
          <div style="height:40px;border-bottom:1px solid rgba(255,255,255,0.15)"></div>
          <div style="font-size:11px;color:var(--gray);margin-top:4px">Owner / Driver / Possessor</div>
        </div>
      </div>
    </div>

    <div class="no-print" style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap">
      <button class="btn btn-primary" @click="doSave">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save Record
      </button>
      <button class="btn btn-secondary" @click="showReceipt = true">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Preview Receipt
      </button>
      <button class="btn btn-success" v-if="receiptSaved" @click="() => window.print()">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print Receipt
      </button>

      <button class="btn btn-danger" @click="resetForm">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.08"/></svg>
        Clear Form
      </button>
    </div>

    <!-- Receipt Preview -->
    <div v-if="showReceipt" class="card" style="padding:0;overflow:hidden">
      <div class="no-print" style="padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border2)">
        <div class="card-title">Receipt Preview</div>
        <button class="btn btn-success btn-sm" @click="() => window.print()">🖨️ Print</button>
      </div>
      <div id="receipt-print-area" style="padding:20px;background:#f8f8f8">
        <div class="receipt-preview">
          <div class="receipt-header">
            <div class="logos">
              <div class="logo-circle" style="font-size:7px;font-weight:800;line-height:1.3">NAPOLCOM<br>PNP</div>
              <div class="header-text">
                <h4>Republic of the Philippines</h4>
                <h4>NATIONAL POLICE COMMISSION</h4>
                <h4>PHILIPPINE NATIONAL POLICE</h4>
                <h3>BUTUAN CITY POLICE OFFICE</h3>
                <h2>BUTUAN CITY POLICE STATION 1</h2>
                <h5>Butuan City</h5>
              </div>
              <div class="logo-circle" style="font-size:7px;font-weight:800;line-height:1.3">BCPO<br>STATION 1</div>
            </div>
          </div>
          <div class="receipt-date">Date: <span>{{ form.date ? fmtDate(form.date) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' }}</span></div>
          <div class="receipt-title">IMPOUNDING RECEIPT</div>
          <div class="field-row"><span class="field-label">Type of Vehicle</span><span class="field-colon">:</span><span class="field-value">{{ form.type }}</span></div>
          <div class="field-row"><span class="field-label">Plate no.</span><span class="field-colon">:</span><span class="field-value">{{ form.plate }}</span></div>
          <div class="field-row"><span class="field-label">Color</span><span class="field-colon">:</span><span class="field-value">{{ form.color }}</span></div>
          <div class="field-row"><span class="field-label">Driver's Name</span><span class="field-colon">:</span><span class="field-value">{{ form.driver }}</span></div>
          <div class="field-row"><span class="field-label">Address</span><span class="field-colon">:</span><span class="field-value">{{ form.driverAddress }}</span></div>
          <div class="field-row"><span class="field-label">Registered Owner</span><span class="field-colon">:</span><span class="field-value">{{ form.owner }}</span></div>
          <div class="field-row"><span class="field-label">Address</span><span class="field-colon">:</span><span class="field-value">{{ form.ownerAddress }}</span></div>
          <div class="violations-section">
            <strong>VIOLATIONS:</strong>
            <div class="vio-row"><span class="vio-num">1.</span><span class="vio-line">{{ form.vio1 }}</span></div>
            <div class="vio-row"><span class="vio-num">2.</span><span class="vio-line">{{ form.vio2 }}</span></div>
          </div>
          <div class="receipt-body">Subject MV/MC was apprehended by BCPO Station 1 personnel for violation/s as stated above on <u>&nbsp;{{ fmtDate(form.date) }}&nbsp;</u> at about <u>&nbsp;{{ fmtTime(form.time) }}&nbsp;</u> along the vicinity of <u>&nbsp;{{ form.location }}&nbsp;</u> and same was brought for safekeeping subject for the investigation/verification and proper disposition.</div>
          <div class="receipt-note">Note: Subject MV/MC shall only be released upon presentation of its pertinent original documents and agreement.</div>
          <div class="receipt-sigs">
            <div class="sig-title">Apprehending Officer/s:</div>
            <div class="sig-group">
              <div class="conformed">
                <div style="font-size:12.5px;margin-bottom:4px">Conformed:</div>
                <div class="sig-line-block" style="align-items:flex-start">
                  <div style="width:200px;border-top:1px solid #000;padding-top:4px;font-size:12px;text-align:center;margin-top:40px">Owner/Driver/Possessor</div>
                </div>
              </div>
              <div style="display:flex;gap:20px;flex-wrap:wrap">
                <div class="sig-line-block">
                  <div style="font-weight:bold;font-size:13px;text-align:center;margin-top:40px;margin-bottom:4px">{{ form.officer }}</div>
                  <div style="border-top:1px solid #000;width:100%"></div>
                  <div style="font-size:11px;text-align:center;color:#888;margin-top:3px">Apprehending Officer</div>
                </div>
                <div class="sig-line-block">
                  <div style="font-weight:bold;font-size:13px;text-align:center;margin-top:40px;margin-bottom:4px">{{ form.officer2 }}</div>
                  <div style="border-top:1px solid #000;width:100%"></div>
                  <div style="font-size:11px;text-align:center;color:#888;margin-top:3px">Apprehending Officer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useImpoundStore, fmtDate, fmtTime } from '../../composables/useImpoundStore.js'
import OfficerMultiSelect from '../OfficerMultiSelect.vue'

const { page, saveRecord } = useImpoundStore()

const violations = ['No Helmet','No License','Expired Registration','No Registration','Reckless Driving','Illegal Parking','DUI/DWI','Overloading','Obstruction of Traffic','Illegal Modification','Hit and Run','Other Traffic Violation']

const blankForm = () => ({ type:'',plate:'',color:'',engineNo:'',chassisNo:'',date:new Date().toISOString().split('T')[0],time:'',location:'',driver:'',driverAddress:'',owner:'',ownerAddress:'',vio1:'',vio2:'',officer:'',officer2:'',remarks:'' })

const form        = ref(blankForm())
const showReceipt = ref(false)
const receiptSaved = ref(false)
const savedId     = ref('')

function doSave() {
  if (!form.value.plate || !form.value.type || !form.value.driver) {
    alert('Please fill in required fields: Vehicle Type, Plate Number, and Driver Name.')
    return
  }
  const rec = saveRecord(form.value)
  savedId.value = 'IR-2025-' + String(rec.id).padStart(4, '0')
  receiptSaved.value = true
  showReceipt.value  = true

}

function resetForm() {
  form.value     = blankForm()
  showReceipt.value  = false
  receiptSaved.value = false
  savedId.value  = ''
}


</script>
