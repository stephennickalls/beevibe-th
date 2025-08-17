<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-semibold text-white">Sensor Nodes ({{ sensorNodes.length }})</h3>
        <p class="text-sm text-gray-400 mt-1">
          ESP32 boards that collect data from individual sensors at each hive
        </p>
      </div>
      
      <div class="flex gap-2">
        <button 
          @click="$emit('scan-for-nodes')"
          :disabled="!hubOnline"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          :title="hubOnline ? 'Scan for new sensor nodes' : 'Hub must be online to scan'"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': scanning }" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
          </svg>
          {{ scanning ? 'Scanning...' : 'Scan for Nodes' }}
        </button>
        
        <button 
          @click="$emit('add-node-manually')"
          class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
          </svg>
          Add Manually
        </button>
      </div>
    </div>

    <!-- Sensor Nodes List - Full Width -->
    <div v-if="sensorNodes.length > 0" class="space-y-3">
      <SensorNodeFullWidth
        v-for="node in sensorNodes"
        :key="node.id"
        :sensor-node="node"
        :available-hives="availableHives"
        @assign-to-hive="handleAssignToHive"
        @view-details="handleViewDetails"
        @remove-node="handleRemoveNode"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
      </svg>
      <h4 class="text-xl font-semibold mb-2 text-gray-300">No Sensor Nodes Found</h4>
      <p class="text-gray-400 mb-6">
        {{ hubOnline 
          ? 'No sensor nodes are currently connected to this hub.' 
          : 'Connect your hub to scan for sensor nodes.' 
        }}
      </p>
      <div class="flex justify-center gap-3">
        <button 
          v-if="hubOnline"
          @click="$emit('scan-for-nodes')"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Scan for Sensor Nodes
        </button>
        <button 
          @click="$emit('add-node-manually')"
          class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors"
        >
          Add Node Manually
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
// Import the new full-width component instead of the card
import SensorNodeFullWidth from '../sensor/SensorNodeCard.vue'

// Props
const props = defineProps({
  sensorNodes: {
    type: Array,
    default: () => []
  },
  availableHives: {
    type: Array,
    default: () => []
  },
  hubOnline: {
    type: Boolean,
    default: false
  },
  scanning: {
    type: Boolean,
    default: false
  },
})

// Events
const emit = defineEmits([
  'scan-for-nodes',
  'add-node-manually', 
  'assign-to-hive',
  'view-details',
  'remove-node'
])

// Event handlers
const handleAssignToHive = (nodeId, hiveId) => {
  emit('assign-to-hive', { nodeId, hiveId })
}

const handleViewDetails = (node) => {
  emit('view-details', node)
}

const handleRemoveNode = (node) => {
  emit('remove-node', node)
}
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>