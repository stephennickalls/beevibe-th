<!-- components/AlertSummaryCards.vue -->
<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
    <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
        </div>
        <div>
          <p class="text-lg sm:text-2xl font-bold">{{ criticalCount }}</p>
          <p class="text-xs sm:text-sm text-gray-400">Critical</p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
        </div>
        <div>
          <p class="text-lg sm:text-2xl font-bold">{{ warningCount }}</p>
          <p class="text-xs sm:text-sm text-gray-400">Warning</p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
        </div>
        <div>
          <p class="text-lg sm:text-2xl font-bold">{{ infoCount }}</p>
          <p class="text-xs sm:text-sm text-gray-400">Info</p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4">
      <div class="flex items-center space-x-2 sm:space-x-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
        </div>
        <div>
          <p class="text-lg sm:text-2xl font-bold">{{ resolvedCount }}</p>
          <p class="text-xs sm:text-sm text-gray-400">Resolved</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  criticalCount: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  },
  infoCount: {
    type: Number,
    default: 0
  },
  resolvedCount: {
    type: Number,
    default: 0
  }
})
</script>
