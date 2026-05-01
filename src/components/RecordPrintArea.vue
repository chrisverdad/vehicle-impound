<template>
  <div id="record-receipt-print-area" style="display:none">
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
      <div class="receipt-date">Date: <span ref="rpDate"></span></div>
      <div class="receipt-title">IMPOUNDING RECEIPT</div>
      <div class="field-row"><span class="field-label">Type of Vehicle</span><span class="field-colon">:</span><span class="field-value" ref="rpType"></span></div>
      <div class="field-row"><span class="field-label">Plate no.</span><span class="field-colon">:</span><span class="field-value" ref="rpPlate"></span></div>
      <div class="field-row"><span class="field-label">Color</span><span class="field-colon">:</span><span class="field-value" ref="rpColor"></span></div>
      <div class="field-row"><span class="field-label">Driver's Name</span><span class="field-colon">:</span><span class="field-value" ref="rpDriver"></span></div>
      <div class="field-row"><span class="field-label">Address</span><span class="field-colon">:</span><span class="field-value" ref="rpDriverAddr"></span></div>
      <div class="field-row"><span class="field-label">Registered Owner</span><span class="field-colon">:</span><span class="field-value" ref="rpOwner"></span></div>
      <div class="field-row"><span class="field-label">Address</span><span class="field-colon">:</span><span class="field-value" ref="rpOwnerAddr"></span></div>
      <div class="violations-section">
        <strong>VIOLATIONS:</strong>
        <div class="vio-row"><span class="vio-num">1.</span><span class="vio-line" ref="rpVio1"></span></div>
        <div class="vio-row"><span class="vio-num">2.</span><span class="vio-line" ref="rpVio2"></span></div>
      </div>
      <div class="receipt-body" ref="rpBody"></div>
      <div class="receipt-note">Note: Subject MV/MC shall only be released upon presentation of its pertinent original documents and agreement.</div>
      <div class="receipt-sigs">
        <div class="sig-title">Apprehending Officer:</div>
        <div class="sig-group">
          <div class="conformed">
            <div style="font-size:12.5px;margin-bottom:4px">Conformed:</div>
            <div class="sig-line-block" style="align-items:flex-start">
              <div style="width:200px;border-top:1px solid #000;padding-top:4px;font-size:12px;text-align:center;margin-top:40px">Owner/Driver/Possessor</div>
            </div>
          </div>
          <div class="sig-line-block">
            <div class="sig-underline" ref="rpOfficer"></div>
            <div class="sig-extra-line">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fmtDate } from '../composables/useImpoundStore.js'

const rpDate = ref(null); const rpType = ref(null); const rpPlate = ref(null)
const rpColor = ref(null); const rpDriver = ref(null); const rpDriverAddr = ref(null)
const rpOwner = ref(null); const rpOwnerAddr = ref(null); const rpVio1 = ref(null)
const rpVio2 = ref(null); const rpOfficer = ref(null); const rpBody = ref(null)

function fillAndPrint(r) {
  rpDate.value.textContent       = fmtDate(r.date) || ''
  rpType.value.textContent       = r.type || ''
  rpPlate.value.textContent      = r.plate || ''
  rpColor.value.textContent      = r.color || ''
  rpDriver.value.textContent     = r.driver || ''
  rpDriverAddr.value.textContent = r.driverAddress || ''
  rpOwner.value.textContent      = r.owner || ''
  rpOwnerAddr.value.textContent  = r.ownerAddress || ''
  rpVio1.value.textContent       = r.vio1 || ''
  rpVio2.value.textContent       = r.vio2 || ''
  rpOfficer.value.textContent    = r.officer || ''
  rpBody.value.innerHTML = `Subject MV/MC was apprehended by BCPO Station 1 personnel for violation/s as stated above on <u>&nbsp;${fmtDate(r.date)||''}&nbsp;</u> at about <u>&nbsp;${r.time||''}&nbsp;</u> along the vicinity of <u>&nbsp;${r.location||''}&nbsp;</u> and same was brought for safekeeping subject for the investigation/verification and proper disposition.`
  document.body.setAttribute('data-print-mode', 'record-receipt')
  setTimeout(() => {
    window.print()
    setTimeout(() => document.body.removeAttribute('data-print-mode'), 500)
  }, 100)
}

defineExpose({ fillAndPrint })
</script>
