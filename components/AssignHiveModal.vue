<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-lg font-semibold">Assign Existing Hive</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- No Available Hives -->
        <div v-if="availableHives.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <h4 class="text-lg font-semibold mb-2 text-gray-300">No Unassigned Hives</h4>
          <p class="text-gray-400 mb-4">All your hives are already assigned to apiaries.</p>
          <button 
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        <!-- Available Hives List -->
        <div v-else class="space-y-3">
          <div class="mb-4">
            <p class="text-sm text-gray-400">
              Select a hive to assign to "{{ apiary?.name }}". 
              Only unassigned hives are shown.
            </p>
          </div>

          <div 
            v-for="hive in availableHives" 
            :key="hive.id"
            @click="selectHive(hive)"
            :class="selectedHiveId === hive.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'"
            class="border rounded-lg p-4 cursor-pointer transition-colors"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h4 class="font-medium">{{ hive.name || `Hive ${hive.id}` }}</h4>
                  <div class="flex items-center space-x-1">
                    <div :class="hive.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                    <span class="text-xs" :class="hive.is_active ? 'text-green-400' : 'text-gray-400'">
                      {{ hive.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                
                <p v-if="hive.description" class="text-sm text-gray-300 mb-2">{{ hive.description }}</p>
                
                <div class="flex items-center space-x-4 text-xs text-gray-400">
                  <span v-if="hive.installation_date">{{ formatDate(hive.installation_date) }}</span>
                  <span v-if="hive.sensor_count">{{ hive.sensor_count }} sensors</span>
                </div>
              </div>
              
              <div class="ml-4">
                <div 
                  :class="selectedHiveId === hive.id ? 'bg-blue-600' : 'bg-gray-600'"
                  class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg v-if="selectedHiveId === hive.id" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleAssign"
          :disabled="!selectedHiveId || assigning"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg v-if="assigning" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ assigning ? 'Assigning...' : 'Assign Hive' }}</span>
        </button>
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
  apiary: {
    type: Object,
    default: null
  },
  availableHives: {
    type: Array,
    default: () => []
  },
  assigning: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'assign'])

// State
const selectedHiveId = ref(null)

// Methods
const selectHive = (hive) => {
  selectedHiveId.value = hive.id
}

const handleAssign = () => {
  if (selectedHiveId.value) {
    emit('assign', selectedHiveId.value)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Reset selection when modal is closed/opened
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedHiveId.value = null
  }
})
</script>