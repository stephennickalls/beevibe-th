<template>
  <div class="text-center py-12">
    <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-gray-400">{{ message }}</p>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>