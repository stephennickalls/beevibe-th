<template>
  <div class="group relative rounded-2xl p-8 border-2 feature-card-border transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl overflow-hidden" style="border-color: #F9E900;">
    <div class="relative z-10">
      <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300" style="background-color: #F9E900;">
        <svg class="w-8 h-8 text-black group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-4" style="color: #F9E900;">{{ title }}</h3>
      <p class="text-gray-300 leading-relaxed mb-6">{{ description }}</p>
      <div class="flex items-center" style="color: #F9E900;">
        <span class="text-sm font-medium">Learn more</span>
        <svg class="w-4 h-4 ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconPath: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* Feature card border hover */
.feature-card-border:hover {
  border-color: #9CA3AF !important; /* gray-400 */
}
</style>