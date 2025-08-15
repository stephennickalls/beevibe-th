<template>
  <aside class="hidden md:flex flex-col w-16 bg-gray-950 text-white shadow-md p-3">
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
          <img src="/images/BeeVibe-Logos/SVGs/Bee-Blue.svg" alt="BeeVibe Logo" class="w-6 h-6" />
        </div>
      </div>
      
      <!-- Main Navigation Icons -->
      <nav class="flex flex-col items-center space-y-3 flex-grow">
        <!-- Dashboard -->
        <NuxtLink to="/dashboard-v2" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/dashboard-v2' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
        </NuxtLink>
        
        <!-- Apiaries Link -->
        <NuxtLink to="/apiaries" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/apiaries') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Hubs Link -->
        <NuxtLink to="/hubs" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/hubs') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <!-- Updated Hub Network Icon -->
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 694 825" xmlns="http://www.w3.org/2000/svg">
            <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
            <path d="M493.885 327.195V496.804L347 581.607L200.115 496.804V327.195L347 242.392L493.885 327.195Z" stroke="currentColor" stroke-width="18" fill="none"/>
            <path d="M381.568 671.782L415.75 730.987L381.568 790.191L313.204 790.191L279.023 730.987L313.204 671.782L381.568 671.782Z"/>
            <path d="M359.281 586.24C359.69 579.902 354.884 574.433 348.546 574.024C342.207 573.615 336.738 578.422 336.329 584.76L347.805 585.5L359.281 586.24ZM336.306 725.592L336.398 737.092L359.397 736.907L359.305 725.408L347.805 725.5L336.306 725.592ZM347.805 585.5L336.329 584.76C335.494 597.707 335.975 684.473 336.306 725.592L347.805 725.5L359.305 725.408C358.968 683.527 358.517 598.093 359.281 586.24L347.805 585.5Z"/>
            <path d="M382.568 152.591L416.75 93.3862L382.568 34.1817L314.204 34.1817L280.023 93.3862L314.204 152.591L382.568 152.591Z"/>
            <path d="M360.281 238.133C360.69 244.471 355.884 249.94 349.546 250.349C343.207 250.758 337.738 245.952 337.329 239.613L348.805 238.873L360.281 238.133ZM337.306 98.7807L337.398 87.2811L360.397 87.4658L360.305 98.9654L348.805 98.873L337.306 98.7807ZM348.805 238.873L337.329 239.613C336.494 226.666 336.975 139.9 337.306 98.7807L348.805 98.873L360.305 98.9654C359.968 140.846 359.517 226.28 360.281 238.133L348.805 238.873Z"/>
            <path d="M556.325 250.568L590.507 191.363L658.87 191.363L693.052 250.568L658.87 309.772L590.507 309.772L556.325 250.568Z"/>
            <path d="M493.387 312.64C487.693 315.455 485.36 322.352 488.175 328.045C490.99 333.739 497.887 336.072 503.58 333.257L498.484 322.949L493.387 312.64ZM625.557 262.861L635.47 257.031L623.81 237.206L613.897 243.036L619.727 252.949L625.557 262.861ZM498.484 322.949L503.58 333.257C515.211 327.507 590.111 283.707 625.557 262.861L619.727 252.949L613.897 243.036C577.796 264.267 504.034 307.375 493.387 312.64L498.484 322.949Z"/>
            <path d="M140.932 254.569L106.75 195.364L38.3863 195.364L4.20456 254.569L38.3863 313.773L106.75 313.773L140.932 254.569Z"/>
            <path d="M203.87 316.64C209.563 319.455 211.897 326.353 209.082 332.046C206.267 337.74 199.369 340.073 193.676 337.258L198.773 326.949L203.87 316.64ZM71.6995 266.862L61.7867 261.032L73.4463 241.207L83.3591 247.036L77.5293 256.949L71.6995 266.862ZM198.773 326.949L193.676 337.258C182.046 331.508 107.145 287.708 71.6995 266.862L77.5293 256.949L83.3591 247.036C119.46 268.268 193.222 311.376 203.87 316.64L198.773 326.949Z"/>
            <path d="M556.325 572.618L590.507 631.823L658.87 631.823L693.052 572.618L658.87 513.414L590.507 513.414L556.325 572.618Z"/>
            <path d="M493.387 510.547C487.693 507.732 485.36 500.834 488.175 495.141C490.99 489.447 497.887 487.114 503.58 489.929L498.484 500.238L493.387 510.547ZM625.557 560.325L635.47 566.155L623.81 585.98L613.897 580.151L619.727 570.238L625.557 560.325ZM498.484 500.238L503.58 489.929C515.211 495.679 590.111 539.479 625.557 560.325L619.727 570.238L613.897 580.151C577.796 558.919 504.034 515.811 493.387 510.547L498.484 500.238Z"/>
            <path d="M136.931 573.618L102.75 632.823L34.3862 632.823L0.204471 573.618L34.3862 514.414L102.75 514.414L136.931 573.618Z"/>
            <path d="M199.87 511.547C205.563 508.732 207.896 501.834 205.082 496.141C202.267 490.447 195.369 488.114 189.676 490.929L194.773 501.238L199.87 511.547ZM67.6993 561.325L57.7866 567.155L69.4462 586.98L79.359 581.151L73.5292 571.238L67.6993 561.325ZM194.773 501.238L189.676 490.929C178.046 496.679 103.145 540.479 67.6993 561.325L73.5292 571.238L79.359 581.151C115.46 559.919 189.222 516.811 199.87 511.547L194.773 501.238Z"/>
          </svg>
        </NuxtLink>
        
        <!-- Hives Link -->
        <NuxtLink to="/hives" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/hives') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-4 h-4" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
            <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z" fill="currentColor"/>
            <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z" fill="currentColor"/>
          </svg>
        </NuxtLink>
        
        <!-- Sensors Link -->
        <NuxtLink to="/sensors" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/sensors') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Analytics Link -->
        <NuxtLink to="/analytics" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/analytics') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Alerts Link -->
        <NuxtLink to="/alerts" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors relative" :class="isActiveRoute('/alerts') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <div v-if="alertCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {{ alertCount }}
          </div>
        </NuxtLink>
      </nav>
      
      <!-- Account Management Link (Bottom) -->
      <div class="mt-auto pt-3 flex justify-center">
        <NuxtLink to="/account" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/account') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup>
// Props for alert count
defineProps({
  alertCount: {
    type: Number,
    default: 0
  }
})

const route = useRoute()

// Helper function to check if a route is active
const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>