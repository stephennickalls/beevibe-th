<!-- components/apiary/DeleteApiaryModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold">Delete Apiary</h3>
            <p class="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete <strong>"{{ apiary?.name }}"</strong>?
          <span v-if="hiveCount > 0" class="block mt-2 text-yellow-400">
            This will unassign {{ hiveCount }} hive{{ hiveCount > 1 ? 's' : '' }} from this apiary.
          </span>
        </p>
        
        <!-- Confirmation Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Type <strong>{{ apiary?.name }}</strong> to confirm:
          </label>
          <input
            v-model="confirmationInput"
            type="text"
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            :placeholder="apiary?.name"
            @keyup.enter="isConfirmationValid && handleDelete()"
          />
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="handleClose"
            class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete"
            :disabled="!isConfirmationValid || deleting"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
          >
            <svg v-if="deleting" class="w-4 h-4 animate-spin mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
            </svg>
            <span>{{ deleting ? 'Deleting...' : 'Delete Apiary' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  apiary: {
    type: Object,
    default: null
  },
  deleting: {
    type: Boolean,
    default: false
  },
  hiveCount: {
    type: Number,
    default: 0
  }
})

// Events
const emit = defineEmits(['close', 'delete'])

// State
const confirmationInput = ref('')

// Computed
const isConfirmationValid = computed(() => {
  return confirmationInput.value.trim() === props.apiary?.name
})

// Methods
const handleClose = () => {
  confirmationInput.value = ''
  emit('close')
}

const handleDelete = () => {
  if (!isConfirmationValid.value || props.deleting) return
  emit('delete')
}

// Reset confirmation input when modal is closed
watch(() => props.show, (newShow) => {
  if (!newShow) {
    confirmationInput.value = ''
  }
})

// Prevent body scroll when modal is open
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Loading spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transition animations */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus styles */
input:focus {
  outline: none;
}

/* Ensure modal appears above everything */
.z-50 {
  z-index: 50;
}
</style>