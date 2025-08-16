<template>
  <div class="bg-gray-800 rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold flex items-center space-x-2">
        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <span>Location</span>
      </h3>
    </div>

    <!-- No Location Data State -->
    <div v-if="!hasLocationData" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
      <h4 class="text-xl font-semibold mb-2">No Location Set</h4>
      <p class="text-gray-400 mb-6">This apiary doesn't have location data yet.</p>
      <button 
        @click="$emit('edit-apiary')"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Add Location Data
      </button>
    </div>

    <!-- Location Data with Map -->
    <div v-else>
      <!-- Address Display -->
      <div v-if="apiary.address" class="mb-4">
        <div class="flex items-start space-x-3 p-4 bg-gray-900 rounded-lg">
          <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          <div>
            <p class="text-sm text-gray-400">Address</p>
            <p class="text-white">{{ apiary.address }}</p>
          </div>
        </div>
      </div>

      <!-- Coordinates Display -->
      <div class="mb-6">
        <div class="flex items-start space-x-3 p-4 bg-gray-900 rounded-lg">
          <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
          </svg>
          <div class="flex-1">
            <p class="text-sm text-gray-400 mb-2">GPS Coordinates</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">Lat:</span>
                <code class="text-sm bg-gray-800 px-2 py-1 rounded border border-gray-700 text-blue-400">
                  {{ parseFloat(apiary.latitude).toFixed(6) }}
                </code>
                <button 
                  @click="copyToClipboard(apiary.latitude, 'Latitude')"
                  class="text-xs text-gray-400 hover:text-white"
                  title="Copy latitude"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                </button>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">Lng:</span>
                <code class="text-sm bg-gray-800 px-2 py-1 rounded border border-gray-700 text-blue-400">
                  {{ parseFloat(apiary.longitude).toFixed(6) }}
                </code>
                <button 
                  @click="copyToClipboard(apiary.longitude, 'Longitude')"
                  class="text-xs text-gray-400 hover:text-white"
                  title="Copy longitude"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Map -->
      <div 
        class="h-80 w-full rounded-lg overflow-hidden border border-gray-700 mb-6"
        :class="{ 'pointer-events-none': modalOpen }"
      >
        <LMap
          ref="mapRef"
          :zoom="15"
          :center="[parseFloat(apiary.latitude), parseFloat(apiary.longitude)]"
          :use-global-leaflet="false"
          style="height: 100%; width: 100%;"
          @ready="onMapReady"
          :options="{ 
            zoomControl: !modalOpen, 
            scrollWheelZoom: !modalOpen, 
            doubleClickZoom: !modalOpen, 
            dragging: !modalOpen 
          }"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
          />
          
          <!-- Custom Apiary Marker -->
          <LMarker
            :lat-lng="[parseFloat(apiary.latitude), parseFloat(apiary.longitude)]"
          >
            <LIcon
              :icon-size="[40, 40]"
              :icon-anchor="[20, 20]"
              :popup-anchor="[0, -20]"
              class-name="custom-apiary-icon"
            >
              <div class="apiary-marker">
                <div class="apiary-marker-inner">
                  <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                </div>
              </div>
            </LIcon>
            
            <!-- Popup Content -->
            <LPopup>
              <div class="p-2">
                <h3 class="font-semibold text-gray-800 mb-1">{{ apiary.name }}</h3>
                <p v-if="apiary.description" class="text-sm text-gray-600 mb-2">{{ apiary.description }}</p>
                <p v-if="apiary.address" class="text-xs text-gray-500">{{ apiary.address }}</p>
                <div class="text-xs text-gray-500 mt-1">
                  <div>Lat: {{ parseFloat(apiary.latitude).toFixed(6) }}</div>
                  <div>Lng: {{ parseFloat(apiary.longitude).toFixed(6) }}</div>
                </div>
              </div>
            </LPopup>
          </LMarker>
        </LMap>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3">
        <button 
          @click="centerMap"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
          </svg>
          <span>Center Map</span>
        </button>
        
        <button 
          @click="openInGoogleMaps"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.029 11H4.083a6.004 6.004 0 002.783 4.118z"/>
          </svg>
          <span>Open in Google Maps</span>
        </button>
        
        <button 
          @click="$emit('edit-apiary')"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          <span>Edit Location</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  apiary: {
    type: Object,
    required: true
  },
  modalOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['edit-apiary'])

// Reactive data
const mapRef = ref(null)

// Computed properties
const hasLocationData = computed(() => {
  return props.apiary?.latitude && props.apiary?.longitude
})

// Methods
const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text.toString())
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text.toString()
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const openInGoogleMaps = () => {
  if (hasLocationData.value) {
    const url = `https://www.google.com/maps?q=${props.apiary.latitude},${props.apiary.longitude}`
    window.open(url, '_blank')
  }
}

const centerMap = () => {
  if (mapRef.value && hasLocationData.value) {
    const leafletMap = mapRef.value.leafletObject
    if (leafletMap) {
      leafletMap.setView([props.apiary.latitude, props.apiary.longitude], 15)
    }
  }
}

const onMapReady = () => {
  console.log('Map is ready!')
}

// Watch for modal state changes to disable/enable map interactions
watch(() => props.modalOpen, (isOpen) => {
  if (mapRef.value?.leafletObject) {
    const map = mapRef.value.leafletObject
    if (isOpen) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
      map.scrollWheelZoom.disable()
      map.boxZoom.disable()
      map.keyboard.disable()
    } else {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
      map.scrollWheelZoom.enable()
      map.boxZoom.enable()
      map.keyboard.enable()
    }
  }
})
</script>

<style scoped>
:deep(.custom-apiary-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.apiary-marker) {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.apiary-marker-inner) {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #fbbf24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:deep(.apiary-marker-inner:hover) {
  background: rgba(0, 0, 0, 0.9);
  border-color: #f59e0b;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-tip) {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Hide Leaflet controls when modal is open */
.pointer-events-none :deep(.leaflet-control-container) {
  display: none !important;
}

.pointer-events-none :deep(.leaflet-control-attribution) {
  display: none !important;
}

.pointer-events-none :deep(.leaflet-control-zoom) {
  display: none !important;
}
</style>