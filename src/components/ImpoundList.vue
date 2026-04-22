<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useImpoundStore } from '@/stores/impoundStore';

interface ImpoundRecord {
  id: number;
  date: string;
  vehicleType: string;
  plateNumber: string;
  color: string;
  driverName: string;
  driverAddress: string;
  registeredOwner: string;
  ownerAddress: string;
  violation1: string;
  violation2: string;
  apprehendedDate: string;
  apprehendedTime: string;
  apprehendedLocation: string;
  apprehendingOfficer: string;
  conformedBy: string;
}

// --- State Management ---
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const showViewModal = ref(false);
const viewingId = ref<number | null>(null);

const form = reactive<ImpoundRecord>({
  id: 0,
  date: "",
  vehicleType: "",
  plateNumber: "",
  color: "",
  driverName: "",
  driverAddress: "",
  registeredOwner: "",
  ownerAddress: "",
  violation1: "",
  violation2: "",
  apprehendedDate: "",
  apprehendedTime: "",
  apprehendedLocation: "",
  apprehendingOfficer: "",
  conformedBy: "",
});

const store = useImpoundStore();
const emit = defineEmits<{
  (e: 'navigate-to-stats'): void
}>();
const impoundList = store.impoundList;
const viewedRecord = computed(() =>
  impoundList.value.find((r) => r.id === viewingId.value)
);
const vehicleTypes = [
  "Motorcycle",
  "Car",
  "Truck",
  "Van",
  "Bus",
  "SUV",
  "Tricycle",
  "Other",
];

// --- Toast Notification ---
const toast = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "danger",
});

const showToast = (message: string, type: "success" | "danger" = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 4000);
};

// --- Keyboard Navigation ---
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    if (showViewModal.value) {
      closeViewModal();
    } else if (showForm.value) {
      closeForm();
    }
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
});

// --- Logic ---
const openViewModal = (id: number) => {
  viewingId.value = id;
  showViewModal.value = true;
};

const resetForm = () => {
  Object.assign(form, {
    id: 0,
    date: "",
    vehicleType: "",
    plateNumber: "",
    color: "",
    driverName: "",
    driverAddress: "",
    registeredOwner: "",
    ownerAddress: "",
    violation1: "",
    violation2: "",
    apprehendedDate: "",
    apprehendedTime: "",
    apprehendedLocation: "",
    apprehendingOfficer: "",
    conformedBy: "",
  });
  isEditing.value = false;
  editingId.value = null;
};

const openForm = () => {
  resetForm();
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingId.value = null;
};

const saveRecord = () => {
  if (isEditing.value && editingId.value !== null) {
    store.updateRecord(editingId.value, { ...form, id: editingId.value });
    showToast("Record updated successfully.");
    viewingId.value = editingId.value;
    showViewModal.value = true;
  } else {
    const newId = store.addRecord({ ...form });
    viewingId.value = newId;
    showViewModal.value = true;
    showToast("New record added successfully.");
  }
  closeForm();
};

const editRecord = (record: ImpoundRecord) => {
  Object.assign(form, record);
  isEditing.value = true;
  editingId.value = record.id;
  showForm.value = true;
};

const deleteRecord = (id: number) => {
  if (
    confirm(
      "Are you sure you want to delete this record? This action cannot be undone.",
    )
  ) {
    impoundList.value = impoundList.value.filter((r) => r.id !== id);
    if (expandedId.value === id) expandedId.value = null;
    showToast("Record deleted successfully.", "danger");
  }
};
</script>

<template>
  <main class="impound-container">
    <header class="header-section">
      <div>
        <h1 class="title">Impoundment System</h1>
        <p class="subtitle">Manage and track vehicle impound records</p>
      </div>
      <button
        class="btn btn-primary"
        @click="openForm"
        aria-label="Create a new entry"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="btn-icon"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>New Entry</span>
      </button>
    </header>

    <section class="table-container" aria-label="Impound Records List">
      <table class="data-table">
        <caption class="sr-only">
          List of all impounded vehicles
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Driver Name</th>
            <th scope="col" class="hide-mobile">Plate No.</th>
            <th scope="col" class="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="record in impoundList" :key="record.id">
             <tr class="summary-row">
              <td class="font-bold">{{ record.date }}</td>
              <td class="driver-summary">
                <span class="avatar-icon" aria-hidden="true">👤</span>
                {{ record.driverName }}
              </td>
              <td class="hide-mobile">{{ record.plateNumber }}</td>
               <td class="text-right">
                 <button
                   class="btn btn-view"
                   @click.stop="openViewModal(record.id)"
                   aria-label="View details"
                 >
                   <svg
                     aria-hidden="true"
                     xmlns="http://www.w3.org/2000/svg"
                     width="16"
                     height="16"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     stroke-width="2"
                     stroke-linecap="round"
                     stroke-linejoin="round"
                   >
                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                     <circle cx="12" cy="12" r="3"></circle>
                   </svg>
                   View
                 </button>
               </td>
            </tr>


          </template>
          <tr v-if="impoundList.length === 0">
            <td colspan="4" class="no-data">
              <div class="empty-state">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-gray-400)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <p>No records found.</p>
                <button class="btn btn-secondary mt-3" @click="openForm">
                  Create your first entry
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- TOAST NOTIFICATION -->
    <div aria-live="polite" aria-atomic="true" class="toast-container">
      <div
        v-if="toast.show"
        class="toast"
        :class="`toast-${toast.type}`"
        role="alert"
      >
        <svg
          v-if="toast.type === 'success'"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg
          v-if="toast.type === 'danger'"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <!-- FORM MODAL -->
    <div
      v-if="showForm"
      class="modal-overlay"
      @click.self="closeForm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-content slide-up">
        <header class="modal-header">
          <h2 id="modal-title">
            {{
              isEditing ? "Edit Impounding Receipt" : "New Impounding Receipt"
            }}
          </h2>
          <button class="close-btn" @click="closeForm" aria-label="Close modal">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <form @submit.prevent="saveRecord" class="impound-form">
          <fieldset class="form-section">
            <legend class="sr-only">General Information</legend>
            <h3 aria-hidden="true">General Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="f-date">Date</label>
                <input id="f-date" type="date" v-model="form.date" required />
              </div>
              <div class="form-group">
                <label for="f-type">Type of Vehicle</label>
                <select id="f-type" v-model="form.vehicleType" required>
                  <option value="" disabled>Select vehicle type</option>
                  <option
                    v-for="type in vehicleTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="f-plate">Plate no.</label>
                <input
                  id="f-plate"
                  type="text"
                  v-model="form.plateNumber"
                  required
                />
              </div>
              <div class="form-group">
                <label for="f-color">Color</label>
                <input id="f-color" type="text" v-model="form.color" required />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend class="sr-only">Driver & Owner Details</legend>
            <h3 aria-hidden="true">Driver & Owner Details</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="f-d-name">Driver's Name</label>
                <input
                  id="f-d-name"
                  type="text"
                  v-model="form.driverName"
                  required
                />
              </div>
              <div class="form-group full-width">
                <label for="f-d-addr">Driver's Address</label>
                <input
                  id="f-d-addr"
                  type="text"
                  v-model="form.driverAddress"
                  required
                />
              </div>
              <div class="form-group full-width">
                <label for="f-o-name">Registered Owner</label>
                <input
                  id="f-o-name"
                  type="text"
                  v-model="form.registeredOwner"
                  required
                />
              </div>
              <div class="form-group full-width">
                <label for="f-o-addr">Owner's Address</label>
                <input
                  id="f-o-addr"
                  type="text"
                  v-model="form.ownerAddress"
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend class="sr-only">Violations</legend>
            <h3 aria-hidden="true">Violations</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="f-v1">Violation 1</label>
                <input
                  id="f-v1"
                  type="text"
                  v-model="form.violation1"
                  required
                />
              </div>
              <div class="form-group full-width">
                <label for="f-v2"
                  >Violation 2
                  <span class="optional-text">(Optional)</span></label
                >
                <input id="f-v2" type="text" v-model="form.violation2" />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section">
            <legend class="sr-only">Apprehension Details</legend>
            <h3 aria-hidden="true">Apprehension Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label for="f-app-date">Apprehended On (Date)</label>
                <input
                  id="f-app-date"
                  type="date"
                  v-model="form.apprehendedDate"
                  required
                />
              </div>
              <div class="form-group">
                <label for="f-app-time">At About (Time)</label>
                <input
                  id="f-app-time"
                  type="time"
                  v-model="form.apprehendedTime"
                  required
                />
              </div>
              <div class="form-group full-width">
                <label for="f-app-loc">Along the vicinity of (Location)</label>
                <input
                  id="f-app-loc"
                  type="text"
                  v-model="form.apprehendedLocation"
                  required
                />
              </div>
              <div class="form-group">
                <label for="f-app-off">Apprehending Officer</label>
                <input
                  id="f-app-off"
                  type="text"
                  v-model="form.apprehendingOfficer"
                  required
                />
              </div>
              <div class="form-group">
                <label for="f-app-conf"
                  >Conformed By (Owner/Driver/Possessor)</label
                >
                <input
                  id="f-app-conf"
                  type="text"
                  v-model="form.conformedBy"
                  required
                />
              </div>
            </div>
          </fieldset>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save Receipt</button>
          </div>
        </form>
      </div>
    </div>

    <!-- VIEW MODAL -->
    <div
      v-if="showViewModal"
      class="modal-overlay"
      @click.self="closeViewModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
    >
      <div class="modal-content slide-up">
        <header class="modal-header">
          <h2 id="view-modal-title">Impounding Receipt Details</h2>
          <button class="close-btn" @click="closeViewModal" aria-label="Close modal">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div class="modal-body">
          <article
            v-if="viewedRecord"
            class="receipt-format"
            aria-label="Impounding Receipt Details"
          >
            <header class="receipt-header">
              <p>Republic of the Philippines</p>
              <p>NATIONAL POLICE COMMISSION</p>
              <p>PHILIPPINE NATIONAL POLICE</p>
              <p>BUTUAN CITY POLICE OFFICE</p>
              <p><strong>BUTUAN CITY POLICE STATION 1</strong></p>
              <p>Butuan City</p>
              <h2 class="receipt-title">IMPOUNDING RECEIPT</h2>
            </header>

            <div class="receipt-body">
              <div class="receipt-row">
                <span class="receipt-label">Date:</span>
                <span class="receipt-value underline">{{ viewedRecord.date }}</span>
              </div>

              <div class="receipt-grid">
                <div class="receipt-row">
                  <span class="receipt-label">Type of Vehicle:</span>
                  <span class="receipt-value underline">{{ viewedRecord.vehicleType }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Plate no.:</span>
                  <span class="receipt-value underline">{{ viewedRecord.plateNumber }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Color:</span>
                  <span class="receipt-value underline">{{ viewedRecord.color }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Driver's Name:</span>
                  <span class="receipt-value underline">{{ viewedRecord.driverName }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Address:</span>
                  <span class="receipt-value underline">{{ viewedRecord.driverAddress }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Registered Owner:</span>
                  <span class="receipt-value underline">{{ viewedRecord.registeredOwner }}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Address:</span>
                  <span class="receipt-value underline">{{ viewedRecord.ownerAddress }}</span>
                </div>
              </div>

              <div class="receipt-violations">
                <span class="receipt-label" id="view-violations-heading">VIOLATIONS:</span>
                <ol class="violation-list" aria-labelledby="view-violations-heading">
                  <li class="receipt-row">
                    <span class="receipt-value underline">{{ viewedRecord.violation1 }}</span>
                  </li>
                  <li v-if="viewedRecord.violation2" class="receipt-row">
                    <span class="receipt-value underline">{{ viewedRecord.violation2 }}</span>
                  </li>
                </ol>
              </div>

              <div class="receipt-narrative">
                <p>
                  Subject MV/MC was apprehended by BCPO Station 1 personnel for violation/s as stated above on
                  <span class="underline-inline">{{ viewedRecord.apprehendedDate }}</span>
                  at about
                  <span class="underline-inline">{{ viewedRecord.apprehendedTime }}</span>
                  along the vicinity of
                  <span class="underline-inline">{{ viewedRecord.apprehendedLocation }}</span>
                  and same was brought for safekeeping subject for the investigation/verification and proper disposition.
                </p>
                <p class="receipt-note">
                  <strong>Note:</strong> Subject MV/MC shall only be released upon presentation of its pertinent original documents and agreement.
                </p>
              </div>

              <div class="receipt-signatures">
                <div class="sig-block">
                  <p>Apprehending Officer:</p>
                  <div class="sig-line">{{ viewedRecord.apprehendingOfficer }}</div>
                </div>
                <div class="sig-block">
                  <p>Conformed:</p>
                  <div class="sig-line">{{ viewedRecord.conformedBy }}</div>
                  <p class="sig-sub">Owner/Driver/Possessor</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="modal-footer">
          <button
            v-if="viewedRecord"
            class="btn btn-edit"
            @click="editRecord(viewedRecord); closeViewModal()"
            aria-label="Edit this record"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button
            v-if="viewedRecord"
            class="btn btn-delete"
            @click="deleteRecord(viewedRecord.id); closeViewModal()"
            aria-label="Delete this record"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
          <button class="btn btn-secondary" @click="closeViewModal">Close</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* --- Layout & Typography --- */
.impound-container {
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: var(--font-sans);
}

.header-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .header-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.title {
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn-primary {
  background-color: var(--color-primary-600);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
}

.btn-primary:active {
  background-color: var(--color-primary-800);
}

.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
}

.btn-edit {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  border-color: var(--color-primary-200);
}

.btn-edit:hover {
  background-color: var(--color-primary-100);
}

.btn-delete {
  background-color: var(--color-danger-50);
  color: var(--color-danger-700);
  border-color: var(--color-danger-200);
}

.btn-delete:hover {
  background-color: #fee2e2;
}

.btn-view {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  border-color: var(--color-primary-200);
}

.btn-view:hover {
  background-color: var(--color-primary-100);
}

.mt-3 {
  margin-top: 1rem;
}

/* --- Table System --- */
.table-container {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.data-table th {
  background: var(--color-gray-50);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-strong);
}

.data-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  color: var(--text-primary);
  vertical-align: middle;
}

.summary-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.summary-row:hover {
  background-color: var(--color-gray-50);
}

.summary-row:focus-visible {
  outline: none;
  background-color: var(--color-primary-50);
  box-shadow: inset var(--focus-ring);
}

.summary-row.is-active {
  background-color: var(--color-primary-50);
}

.font-bold {
  font-weight: 600;
}

.driver-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--color-gray-100);
  border-radius: 50%;
  font-size: 0.85rem;
}

.text-right {
  text-align: right;
}

.expand-icon {
  color: var(--text-muted);
  display: inline-flex;
  transition: transform 0.3s ease;
}

.summary-row.is-active .expand-icon {
  color: var(--color-primary-600);
}

.hide-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hide-mobile {
    display: table-cell;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  text-align: center;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* --- Details Panel --- */
.details-row {
  background-color: var(--bg-body);
}

.details-row td {
  padding: 0;
  border-bottom: 1px solid var(--border-strong);
}

.details-content {
  padding: 1.5rem;
  border-left: 4px solid var(--color-primary-500);
}

@media (min-width: 768px) {
  .details-content {
    padding: 2rem 3rem;
  }
}

/* --- Receipt Format Styles --- */
.receipt-format {
  background: #ffffff;
  padding: 2rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  max-width: 800px;
  margin: 0 auto;
  box-shadow: var(--shadow-sm);
  font-family: var(--font-serif);
  color: #000;
}

@media (min-width: 768px) {
  .receipt-format {
    padding: 3rem;
  }
}

.receipt-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.receipt-header p {
  margin: 2px 0;
  font-size: 1rem;
  line-height: 1.4;
}

@media (min-width: 640px) {
  .receipt-header p {
    font-size: 1.1rem;
  }
}

.receipt-title {
  margin-top: 1.5rem;
  text-decoration: underline;
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 0.05em;
}

.receipt-body {
  font-size: 1rem;
  line-height: 1.6;
}

@media (min-width: 640px) {
  .receipt-body {
    font-size: 1.05rem;
  }
}

.receipt-row {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: baseline;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .receipt-row {
    flex-wrap: nowrap;
  }
}

.receipt-label {
  font-weight: 700;
  width: 100%;
  margin-bottom: 0.25rem;
}

@media (min-width: 640px) {
  .receipt-label {
    width: 180px;
    flex-shrink: 0;
    margin-bottom: 0;
  }
}

.receipt-value.underline {
  flex-grow: 1;
  border-bottom: 1px solid #000;
  padding-left: 0.5rem;
  min-height: 1.5rem;
  display: inline-block;
  width: 100%;
}

.receipt-grid {
  margin-top: 1.5rem;
}

.receipt-violations {
  margin-top: 2rem;
}

.violation-list {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

@media (min-width: 640px) {
  .violation-list {
    margin-left: 3rem;
  }
}

.violation-list li {
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.receipt-narrative {
  margin-top: 2.5rem;
  text-indent: 2rem;
  text-align: justify;
  line-height: 1.8;
}

.underline-inline {
  border-bottom: 1px solid #000;
  padding: 0 10px;
  font-weight: 700;
  display: inline-block;
  min-width: 80px;
  text-align: center;
}

.receipt-note {
  margin-top: 1.5rem;
  text-indent: 0;
  font-size: 0.95rem;
  color: #333;
}

.receipt-signatures {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

@media (min-width: 640px) {
  .receipt-signatures {
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    padding: 0 2rem;
  }
}

.sig-block {
  width: 100%;
  text-align: center;
}

@media (min-width: 640px) {
  .sig-block {
    width: 45%;
  }
}

.sig-line {
  border-bottom: 1px solid #000;
  min-height: 2rem;
  margin-top: 2rem;
  font-weight: 700;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 5px;
}

.sig-sub {
  font-size: 0.85rem;
  margin-top: 5px;
  color: #444;
}

.detail-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-strong);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* --- Form Modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-modal);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--text-primary);
}

.close-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.impound-form {
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 1.5rem;
  background: var(--bg-body);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-strong);
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.optional-text {
  font-weight: normal;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  background-color: var(--bg-surface);
  color: var(--text-primary);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--focus-ring);
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background: var(--bg-surface);
  padding: 1rem 0;
  border-top: 1px solid var(--border-light);
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: sticky;
  bottom: 0;
  background: var(--bg-surface);
  padding: 1rem 0;
  border-top: 1px solid var(--border-light);
}

.full-width {
  grid-column: 1 / -1;
}

/* --- Toast Notification --- */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  color: #fff;
  font-weight: 500;
  animation: slideInRight 0.3s ease-out forwards;
}

.toast-success {
  background-color: var(--color-success-700);
}

.toast-danger {
  background-color: var(--color-danger-700);
}

/* --- Animations --- */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>