<!-- components/AlertsList.vue -->
<template>
  <div>
    <!-- No Alerts State -->
    <div v-if="alerts.length === 0" class="bg-gray-900 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
      <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
      </svg>
      <h3 class="text-lg sm:text-xl font-semibold mb-2">{{ emptyTitle }}</h3>
      <p class="text-gray-400 text-sm sm:text-base">{{ emptyMessage }}</p>
    </div>

    <!-- Alerts List -->
    <div v-else class="space-y-3 sm:space-y-4">
      <AlertCard
        v-for="alert in alerts"
        :key="alert.id"
        :alert="alert"
        @resolve="$emit('resolve', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import AlertCard from './AlertCard.vue'

// Props
const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  },
  emptyTitle: {
    type: String,
    default: 'No Active Alerts'
  },
  emptyMessage: {
    type: String,
    default: 'Your apiary is running smoothly!'
  }
})

// Events
const emit = defineEmits(['resolve'])
</script>