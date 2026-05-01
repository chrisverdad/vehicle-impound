<template>
  <div>
    <div class="page-header">
      <div class="breadcrumb"><span @click="page='dashboard'" style="cursor:pointer">Home</span> › User Manual</div>
      <h1>User Manual</h1>
      <p>Guide to using the BCPO Station 1 Impound Management System</p>
    </div>
    <div class="grid-2" style="gap:20px">
      <div class="card"><div class="card-title" style="margin-bottom:16px">🏠 Dashboard</div><p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">The Dashboard provides real-time summary of all impounded and released vehicles. Key metrics displayed include:<br><br>• <strong>Total Impounded</strong> — Cumulative count of all impounded vehicles.<br>• <strong>Total Released</strong> — Vehicles verified and released.<br>• <strong>Currently Held</strong> — Active impounds pending release.<br>• <strong>Today's Apprehensions</strong> — Records entered today.<br><br>Use the "Release" button on any active record to mark a vehicle as released.</p></div>
      <div class="card"><div class="card-title" style="margin-bottom:16px">📄 Creating a Receipt</div><p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">Click <strong>Impounding Receipt</strong> in the header navigation to open the form. Required fields:<br><br>• <strong>Vehicle Info</strong> — Type, plate, color, date &amp; time of apprehension.<br>• <strong>Driver Info</strong> — Full name and address of the driver.<br>• <strong>Owner Info</strong> — Registered owner details.<br>• <strong>Violations</strong> — Select from the dropdown (up to 2 violations).<br>• <strong>Officer</strong> — Apprehending officer's full name.<br><br>Click <strong>Save Record</strong> to commit to the database, then <strong>Preview Receipt</strong> to view the formatted official receipt, and <strong>Print Receipt</strong> to send to the printer.</p></div>
      <div class="card"><div class="card-title" style="margin-bottom:16px">📊 Statistics &amp; Reports</div><p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">The Reports section contains three tabs:<br><br>• <strong>Overview</strong> — Monthly trend chart, vehicle type and status distribution charts with export buttons.<br>• <strong>All Records</strong> — Full searchable/filterable table. Filter by status and vehicle type. Export to CSV format using the download button.<br>• <strong>Violations Analysis</strong> — Bar chart and table of most common violations. Export available.<br><br>CSV export downloads a comma-separated file suitable for opening in spreadsheet software.</p></div>
      <div class="card"><div class="card-title" style="margin-bottom:16px">💾 Backup &amp; Restore</div><p style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7">Click <strong>Backup &amp; Restore</strong> in the navigation to manage your data backups. Features include:<br><br>• <strong>Create Backup</strong> — Download all current impound records as a .json file.<br>• <strong>Restore</strong> — Upload a previously saved backup file to reload records.<br>• <strong>Backup Summary</strong> — View record counts before exporting.<br>• <strong>Drag &amp; Drop</strong> — Easily drop a backup file to restore it.<br><br>It is recommended to create a backup at the end of every shift.</p></div>
    </div>
    <div style="margin-top:20px" class="card">
      <div class="card-title" style="margin-bottom:16px">🔄 Workflow Summary</div>
      <div style="display:flex;align-items:center;gap:0;overflow-x:auto;padding:10px 0">
        <div v-for="(step,i) in workflow" :key="i" style="display:flex;align-items:center">
          <div style="text-align:center;min-width:130px">
            <div style="width:50px;height:50px;border-radius:50%;background:rgba(201,168,76,0.15);border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 8px">{{ step.icon }}</div>
            <div style="font-size:12px;font-weight:600;color:var(--gold2)">{{ step.title }}</div>
            <div style="font-size:10px;color:var(--gray);margin-top:3px">{{ step.desc }}</div>
          </div>
          <div v-if="i < workflow.length-1" style="color:var(--gold);font-size:20px;margin:0 4px;opacity:0.5">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImpoundStore } from '../../composables/useImpoundStore.js'
const { page } = useImpoundStore()
const workflow = [
  { icon:'🚔', title:'Apprehend',    desc:'Vehicle stopped' },
  { icon:'📋', title:'Fill Form',    desc:'Enter details' },
  { icon:'💾', title:'Save Record',  desc:'Commit to DB' },
  { icon:'🖨️', title:'Print Receipt',desc:'Official copy' },
  { icon:'🔍', title:'Verify Docs',  desc:'Check papers' },
  { icon:'✅', title:'Release',      desc:'Mark as released' },
]
</script>
