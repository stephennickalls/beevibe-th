<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold text-white">Sensor Nodes</h3>
        <p class="text-gray-400">ESP32 boards that collect data from individual sensors at each hive</p>
      </div>
      <div class="flex gap-3">
        <button 
          v-if="hubOnline"
          @click="$emit('scan-for-nodes')"
          :disabled="scanning"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg v-if="scanning" class="animate-spin w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          {{ scanning ? 'Scanning...' : 'Scan for Nodes' }}
        </button>
        <button 
          @click="$emit('add-node-manually')"
          class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors"
        >
          Add Manually
        </button>
      </div>
    </div>

    <!-- Sensor Nodes List -->
    <div v-if="sensorNodes.length > 0" class="space-y-4">
      <SensorNodeCard
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
    <div v-else class="text-center py-12 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM8 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-300 mb-2">No Sensor Nodes</h3>
      <p class="text-gray-400 mb-4">
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
import SensorNodeCard from '../sensor/SensorNodeCard.vue'

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
const handleAssignToHive = (node) => {
  emit('assign-to-hive', { nodeId: node.id, node })
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