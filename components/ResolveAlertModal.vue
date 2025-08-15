
<!-- components/ResolveAlertModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
      <div class="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
        <h3 class="text-lg sm:text-xl font-semibold">Resolve Alert</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white cursor-pointer">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <div class="p-4 sm:p-6">
        <p class="text-gray-300 mb-4 text-sm sm:text-base">
          Are you sure you want to resolve this alert?
        </p>
        <p class="text-sm text-gray-400 mb-4">
          <strong>{{ alert?.title }}</strong>
        </p>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Resolution Notes (Optional)</label>
          <textarea 
            v-model="notes"
            rows="3"
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about how this alert was resolved..."
          ></textarea>
        </div>
        
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            @click="handleResolve" 
            :disabled="resolving"
            class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
          >
            <span v-if="resolving">Resolving...</span>
            <span v-else>Resolve Alert</span>
          </button>
          <button 
            @click="$emit('close')"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  alert: {
    type: Object,
    default: null
  },
  resolving: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['close', 'resolve'])

// State
const notes = ref('')

// Watch for modal show/hide to reset notes
watch(() => props.show, (newShow) => {
  if (newShow) {
    notes.value = ''
  }
})

// Handle resolve
const handleResolve = () => {
  emit('resolve', {
    alert: props.alert,
    notes: notes.value.trim() || null
  })
}
</script>



