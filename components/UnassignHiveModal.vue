<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-lg mx-4 w-full">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Unassign Hive from Apiary</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <p class="text-gray-300 mb-4">
        Select a hive to unassign from this apiary. The hive will become unassigned but will not be deleted.
      </p>
      
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div 
          v-for="hive in hives"
          :key="hive.id"
          class="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div :class="hive.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-3 h-3 rounded-full"></div>
            <div>
              <p class="font-medium">{{ hive.name }}</p>
              <p class="text-sm text-gray-400">{{ hive.description || 'No description' }}</p>
            </div>
          </div>
          <button
            @click="handleUnassign(hive)"
            :disabled="unassigningHiveId === hive.id"
            class="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
          >
            {{ unassigningHiveId === hive.id ? 'Unassigning...' : 'Unassign' }}
          </button>
        </div>
      </div>
      
      <div class="flex justify-end mt-6">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  hives: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'unassign'])

// State - track which specific hive is being unassigned
const unassigningHiveId = ref(null)

// Handle unassign hive
const handleUnassign = (hive) => {
  console.log('UnassignHiveModal: handleUnassign called for hive:', hive.name)
  unassigningHiveId.value = hive.id
  
  // Emit the unassign event to parent
  emit('unassign', hive)
}

// Expose method to reset loading state from parent
const resetLoadingState = () => {
  console.log('UnassignHiveModal: resetLoadingState called')
  unassigningHiveId.value = null
}

// Expose the reset function to parent component
defineExpose({
  resetLoadingState
})
</script>