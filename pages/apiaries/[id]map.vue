<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading apiary details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Apiary Not Found</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <NuxtLink to="/apiaries" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Back to Apiaries
          </NuxtLink>
        </div>
      </div>

      <!-- Apiary Content -->
      <div v-else-if="apiary">
        <!-- Header with breadcrumb and actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div class="mb-4 sm:mb-0">
            <nav class="flex text-sm text-gray-400 mb-2">
              <NuxtLink to="/apiaries" class="hover:text-white transition-colors">Apiaries</NuxtLink>
              <span class="mx-2">→</span>
              <span>{{ apiary.name }}</span>
            </nav>
            <h1 class="text-3xl font-bold">{{ apiary.name }}</h1>
            <div class="flex items-center space-x-4 mt-2">
              <div class="flex items-center space-x-2">
                <div :class="apiary.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-3 h-3 rounded-full"></div>
                <span class="text-sm" :class="apiary.is_active ? 'text-green-400' : 'text-gray-400'">
                  {{ apiary.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div v-if="apiary.uuid" class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">ID:</span>
                <code class="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">{{ apiary.uuid }}</code>
                <button 
                  @click="copyToClipboard(apiary.uuid, 'Apiary ID')"
                  class="text-xs text-blue-400 hover:text-blue-300"
                  title="Copy UUID"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0L9 10.172V13a1 1 0 102 0v-.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button 
              v-if="hasLocationData"
              @click="scrollToLocationSection"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>View on Map</span>
            </button>
            <button 
              @click="showEditModal = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <span>Edit Apiary</span>
            </button>
            <button 
              @click="showDeleteModal = true"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Basic Information Strip -->
        <div class="bg-gray-800 rounded-lg p-4 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            <!-- Basic Info -->
            <div>
              <span class="text-sm text-gray-400">Description:</span>
              <p class="text-gray-200">{{ apiary.description || 'No description' }}</p>
            </div>
            
            <!-- Created Date -->
            <div>
              <span class="text-sm text-gray-400">Created:</span>
              <p class="text-gray-200">{{ formatDate(apiary.installation_date) }}</p>
            </div>
            
            <!-- Last Updated -->
            <div>
              <span class="text-sm text-gray-400">Last Updated:</span>
              <p class="text-gray-200">{{ formatDate(apiary.updated_at) }}</p>
            </div>
            
            <!-- Location Info -->
            <div v-if="hasLocationData">
              <span class="text-sm text-gray-400">Location:</span>
              <p class="text-gray-200 text-sm">
                {{ apiary.address || `${parseFloat(apiary.latitude).toFixed(4)}, ${parseFloat(apiary.longitude).toFixed(4)}` }}
              </p>
            </div>
            
            <!-- Hive Count -->
            <div>
              <span class="text-sm text-gray-400">Total Hives:</span>
              <p class="text-2xl font-bold text-blue-400">{{ apiaryHives.length }}</p>
            </div>
          </div>
        </div>

        <!-- Hives Section -->
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">Hives ({{ apiaryHives.length }})</h3>
            <div class="flex items-center space-x-4">
              <button 
                @click="showAssignHiveModal = true"
                class="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                </svg>
                <span>Assign Existing Hive</span>
              </button>
              
              <button 
                @click="showUnassignHiveModal = true"
                :disabled="apiaryHives.length === 0"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
                <span>Unassign Hive</span>
              </button>
            </div>
          </div>

          <!-- No Hives State -->
          <div v-if="apiaryHives.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" viewBox="0 0 55 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z"/>
              <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z"/>
              <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z"/>
            </svg>
            <h4 class="text-xl font-semibold mb-2">No Hives Yet</h4>
            <p class="text-gray-400 mb-6">This apiary doesn't have any hives assigned yet.</p>
            <div class="flex justify-center space-x-3">
              <button 
                @click="showAssignHiveModal = true"
                class="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg transition-colors"
              >
                Assign Existing Hive
              </button>
            </div>
          </div>

          <!-- Hives Grid -->
          <div v-else class="space-y-4">
            <div 
              v-for="hive in apiaryHives"
              :key="hive.id"
              class="cursor-pointer"
              @click="viewHive(hive)"
            >
              <HiveCard :hive="hive" />
            </div>
          </div>
        </div>

        <!-- Location Section -->
        <div ref="locationSectionRef" class="bg-gray-800 rounded-lg p-6">
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
              @click="showEditModal = true"
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
              :class="{ 'pointer-events-none': anyModalOpen }"
            >
              <LMap
                ref="mapRef"
                :zoom="15"
                :center="[parseFloat(apiary.latitude), parseFloat(apiary.longitude)]"
                :use-global-leaflet="false"
                style="height: 100%; width: 100%;"
                @ready="onMapReady"
                :options="{ zoomControl: !anyModalOpen, scrollWheelZoom: !anyModalOpen, doubleClickZoom: !anyModalOpen, dragging: !anyModalOpen }"
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
                @click="showEditModal = true"
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
      </div>
    </div>

    <!-- Edit Apiary Modal with higher z-index -->
    <div v-if="showEditModal" class="fixed inset-0 z-[60]">
      <EditApiaryModal 
        :show="showEditModal"
        :apiary="apiary"
        @close="showEditModal = false"
        @updated="handleApiaryUpdated"
        @deleted="handleApiaryDeleted"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Delete Apiary</h3>
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete "{{ apiary?.name }}"? 
          {{ apiaryHives.length > 0 ? `This will unassign ${apiaryHives.length} hive${apiaryHives.length > 1 ? 's' : ''} from this apiary.` : '' }}
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Assign Existing Hive Modal -->
    <AssignHiveModal
      :show="showAssignHiveModal"
      :apiary="apiary"
      :available-hives="unassignedHives"
      :assigning="assigningHive"
      @close="showAssignHiveModal = false"
      @assign="handleAssignHive"
    />

    <!-- Unassign Hive Modal with higher z-index -->
    <div v-if="showUnassignHiveModal" class="fixed inset-0 z-[60]">
      <UnassignHiveModal
        ref="unassignHiveModalRef"
        :show="showUnassignHiveModal"
        :hives="apiaryHives"
        @close="showUnassignHiveModal = false"
        @unassign="handleUnassignHive"
      />
    </div>

    <!-- Modal Backdrop - Covers Map When Any Modal is Open -->
    <div 
      v-if="anyModalOpen" 
      class="fixed inset-0 bg-black bg-opacity-75 z-[55]"
      style="pointer-events: none;"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import HiveCard from '~/components/hive/HiveCard.vue'

// Route and navigation
const route = useRoute()
const apiaryId = route.params.id

// Meta
definePageMeta({
  title: 'Apiary Details - BeeVibe Dashboard',
  middleware: ['auth']
})

// Reactive data
const loading = ref(true)
const error = ref(null)
const apiary = ref({})
const activeAlerts = ref([])

// Modal states
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAssignHiveModal = ref(false)
const showUnassignHiveModal = ref(false)

// Refs
const unassignHiveModalRef = ref(null)
const locationSectionRef = ref(null)
const mapRef = ref(null)

// Loading states
const deleting = ref(false)
const assigningHive = ref(false)

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { subscription, loadSubscription } = useSubscription()

// Use the centralized hive data composable
const {
  hivesWithSensorData,
  refreshData: refreshHiveData
} = useHiveData()

// Computed properties
const apiaryHives = computed(() => {
  if (!apiary.value?.id || !hivesWithSensorData.value) return []
  return hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.value.id)
})

const unassignedHives = computed(() => {
  if (!hivesWithSensorData.value) return []
  return hivesWithSensorData.value.filter(hive => !hive.apiary_id)
})

const hasLocationData = computed(() => {
  return apiary.value?.latitude && apiary.value?.longitude
})

const anyModalOpen = computed(() => {
  return showEditModal.value || 
         showDeleteModal.value || 
         showAssignHiveModal.value || 
         showUnassignHiveModal.value
})

// Helper functions
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const scrollToLocationSection = () => {
  if (locationSectionRef.value) {
    locationSectionRef.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const centerMap = () => {
  if (mapRef.value && hasLocationData.value) {
    const leafletMap = mapRef.value.leafletObject
    if (leafletMap) {
      leafletMap.setView([apiary.value.latitude, apiary.value.longitude], 15)
    }
  }
}

const onMapReady = () => {
  console.log('Map is ready!')
}

const viewHive = (hive) => {
  navigateTo(`/hives/${hive.id}`)
}

// Data loading functions
const loadApiaryDetails = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/apiaries/${apiaryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    apiary.value = response.data
    
  } catch (err) {
    error.value = err.message || 'Failed to load apiary details'
  }
}

// Action handlers
const handleApiaryUpdated = (updatedApiary) => {
  apiary.value = { ...apiary.value, ...updatedApiary }
  showEditModal.value = false
}

const handleApiaryDeleted = () => {
  navigateTo('/apiaries')
}

const handleUnassignHive = async (hive) => {
  if (!hive || !hive.id) {
    return
  }
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hives/${hive.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: hive.name,
        description: hive.description,
        apiary_id: null, // Unassign from apiary
        installation_date: hive.installation_date,
        is_active: hive.is_active
      }
    })
    
    if (response?.error) {
      throw new Error(response.error)
    }
    
    if (response && (response.success || response.data)) {
      // Refresh hive data to get updated assignments
      await refreshHiveData()
      
      // Close the modal after successful unassignment
      showUnassignHiveModal.value = false
    } else {
      throw new Error('Unexpected response from server')
    }
    
  } catch (err) {
    alert('Failed to unassign hive: ' + (err.message || 'Unknown error'))
  } finally {
    // Reset the modal loading state
    if (unassignHiveModalRef.value?.resetLoadingState) {
      unassignHiveModalRef.value.resetLoadingState()
    }
  }
}

const confirmDelete = async () => {
  if (!apiary.value) return
  
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/apiaries/${apiary.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    navigateTo('/apiaries')
    
  } catch (err) {
    alert('Failed to delete apiary: ' + (err.message || 'Unknown error'))
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

const handleAssignHive = async (hiveId) => {
  assigningHive.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    // Find the hive data to get its current name
    const hiveToAssign = unassignedHives.value.find(h => h.id === hiveId)
    if (!hiveToAssign) {
      throw new Error('Hive not found')
    }

    const response = await $fetch(`/api/hives/${hiveId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: hiveToAssign.name,
        description: hiveToAssign.description,
        apiary_id: apiary.value.id,
        installation_date: hiveToAssign.installation_date,
        is_active: hiveToAssign.is_active
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Refresh hive data to get updated assignments
    await refreshHiveData()
    showAssignHiveModal.value = false
    
  } catch (err) {
    alert('Failed to assign hive: ' + (err.message || 'Unknown error'))
  } finally {
    assigningHive.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      loadApiaryDetails(),
      refreshHiveData(),
      loadSubscription?.() || Promise.resolve()
    ])
  } catch (err) {
    if (!error.value) {
      error.value = 'Failed to load page'
    }
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  // Cleanup: restore body scroll and remove modal class on component unmount
  document.body.style.overflow = ''
  document.body.classList.remove('modal-open')
})

// Watchers for modal states
watch(anyModalOpen, (isOpen) => {
  // Option 1: Body Scroll Lock
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    document.body.classList.add('modal-open') // Add class to hide Leaflet controls globally
  } else {
    document.body.style.overflow = ''
    document.body.classList.remove('modal-open') // Remove class to show Leaflet controls
  }
  
  // Additional fix: Disable map interactions directly
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

/* Option 3: CSS-Only Solution - Map overlay when modals are open */
.map-container {
  position: relative;
}

.map-container.modal-open::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Darker overlay to better hide controls */
  z-index: 10; /* Higher z-index to cover all map elements */
  pointer-events: all;
  border-radius: 8px; /* Match the container's border-radius */
}

/* Hide ALL Leaflet controls globally when any modal is open */
.modal-open :deep(.leaflet-control-container),
:global(.modal-open .leaflet-control-container) {
  display: none !important;
}

.modal-open :deep(.leaflet-control-attribution),
:global(.modal-open .leaflet-control-attribution) {
  display: none !important;
}

.modal-open :deep(.leaflet-control-zoom),
:global(.modal-open .leaflet-control-zoom) {
  display: none !important;
}

/* Hide controls at the body level when modals are open */
:global(body.modal-open .leaflet-control-container) {
  display: none !important;
}

:global(body.modal-open .leaflet-control-attribution) {
  display: none !important;
}

:global(body.modal-open .leaflet-control-zoom) {
  display: none !important;
}

/* Ensure all Leaflet elements stay below overlay when not hidden */
:deep(.leaflet-control-container) {
  z-index: 1 !important;
}

:deep(.leaflet-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-map-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-tile-pane) {
  z-index: 1 !important;
}
</style>