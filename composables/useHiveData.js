// composables/useHiveData.js - Fixed with enhanced debugging and user validation
import { ref, computed, watch } from 'vue'

// Global state (shared across all components using this composable)
const hives = ref([])
const sensors = ref([])
const latestReadings = ref([])
const loading = ref(false)
const error = ref(null)
const lastUpdate = ref(null)

// Loading states for individual data types
const hivesLoading = ref(false)
const sensorsLoading = ref(false)
const readingsLoading = ref(false)

export const useHiveData = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Helper function to get auth token with validation
  const getAuthToken = async () => {
    if (!user.value) {
      console.error('useHiveData: No user available')
      return null
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('useHiveData: Session error:', error)
        return null
      }
      
      if (!session?.access_token) {
        console.error('useHiveData: No access token in session')
        return null
      }
      
      console.log('useHiveData: Got auth token for user:', user.value.id)
      return session.access_token
      
    } catch (err) {
      console.error('useHiveData: Error getting auth token:', err)
      return null
    }
  }

  // Individual fetch functions
  const fetchHives = async () => {
    if (!user.value) {
      console.error('fetchHives: No user available')
      return { success: false, error: 'No user' }
    }
    
    console.log('fetchHives: Starting fetch for user:', user.value.id)
    hivesLoading.value = true
    
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }
      
      console.log('fetchHives: Making API request to /api/hives')
      
      const response = await $fetch('/api/hives', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('fetchHives: API response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (!response.success) {
        throw new Error('API returned unsuccessful response')
      }
      
      // Validate that all returned hives belong to current user
      if (response.data && Array.isArray(response.data)) {
        const currentUserId = user.value.id
        console.log('fetchHives: Validating hive ownership for user:', currentUserId)
        
        const invalidHives = response.data.filter(hive => hive.user_id !== currentUserId)
        if (invalidHives.length > 0) {
          console.error('fetchHives: Found hives belonging to other users:', invalidHives)
          throw new Error('Data integrity error: Received hives from other users')
        }
        
        console.log(`fetchHives: ✅ All ${response.data.length} hives belong to current user`)
        hives.value = response.data
      } else {
        console.log('fetchHives: No hives data in response')
        hives.value = []
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load hives'
      console.error('fetchHives: Error:', errorMessage)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      hivesLoading.value = false
    }
  }

  const fetchSensors = async (hiveId = null) => {
    if (!user.value) {
      console.error('fetchSensors: No user available')
      return { success: false, error: 'No user' }
    }
    
    console.log('fetchSensors: Starting fetch for user:', user.value.id, 'hiveId:', hiveId)
    sensorsLoading.value = true
    
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }
      
      const url = hiveId ? `/api/sensors?hive_id=${hiveId}` : '/api/sensors'
      console.log('fetchSensors: Making API request to:', url)
      
      const response = await $fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('fetchSensors: API response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (!response.success) {
        throw new Error('API returned unsuccessful response')
      }
      
      // Validate that all returned sensors belong to current user
      if (response.data && Array.isArray(response.data)) {
        const currentUserId = user.value.id
        const invalidSensors = response.data.filter(sensor => sensor.user_id !== currentUserId)
        if (invalidSensors.length > 0) {
          console.error('fetchSensors: Found sensors belonging to other users:', invalidSensors)
          throw new Error('Data integrity error: Received sensors from other users')
        }
        
        if (hiveId) {
          sensors.value = sensors.value.filter(s => s.hive_id !== hiveId).concat(response.data)
        } else {
          sensors.value = response.data
        }
      } else {
        if (!hiveId) {
          sensors.value = []
        }
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load sensors'
      console.error('fetchSensors: Error:', errorMessage)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      sensorsLoading.value = false
    }
  }

  const fetchLatestReadings = async (hiveIds = null) => {
    if (!user.value) {
      console.error('fetchLatestReadings: No user available')
      return { success: false, error: 'No user' }
    }
    
    console.log('fetchLatestReadings: Starting fetch for user:', user.value.id)
    readingsLoading.value = true
    
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }
      
      let url = '/api/readings/latest'
      if (hiveIds) {
        const idsString = Array.isArray(hiveIds) ? hiveIds.join(',') : hiveIds
        url += `?hive_ids=${idsString}`
      } else if (hives.value.length > 0) {
        const allHiveIds = hives.value.map(h => h.id).join(',')
        url += `?hive_ids=${allHiveIds}`
      }
      
      console.log('fetchLatestReadings: Making API request to:', url)
      
      const response = await $fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('fetchLatestReadings: API response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (!response.success) {
        throw new Error('API returned unsuccessful response')
      }
      
      if (response.data) {
        latestReadings.value = response.data
      } else {
        latestReadings.value = []
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load readings'
      console.error('fetchLatestReadings: Error:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      readingsLoading.value = false
    }
  }

  // Combined data loading with better error handling
  const loadAllData = async (options = {}) => {
    if (!user.value) {
      console.error('loadAllData: No user available')
      return { success: false, error: 'No user' }
    }
    
    console.log('loadAllData: Starting data load for user:', user.value.id)
    loading.value = true
    error.value = null
    
    try {
      // Load hives first (required for everything else)
      console.log('loadAllData: Step 1 - Loading hives')
      const hivesResult = await fetchHives()
      if (!hivesResult.success) {
        throw new Error(hivesResult.error)
      }
      
      // Only proceed if we have hives or if explicitly requested
      if (hives.value.length === 0 && !options.loadEvenIfEmpty) {
        console.log('loadAllData: No hives found, skipping sensors and readings')
        lastUpdate.value = new Date()
        return { success: true, message: 'No hives to load data for' }
      }
      
      // Load sensors and readings in parallel
      console.log('loadAllData: Step 2 - Loading sensors and readings')
      const [sensorsResult, readingsResult] = await Promise.all([
        fetchSensors(),
        fetchLatestReadings()
      ])
      
      // Check for errors but don't fail the whole operation
      if (!sensorsResult.success) {
        console.warn('loadAllData: Sensors failed to load:', sensorsResult.error)
      }
      if (!readingsResult.success) {
        console.warn('loadAllData: Readings failed to load:', readingsResult.error)
      }
      
      // Force reactivity update by accessing computed properties
      const hivesCount = hivesWithSensorData.value.length
      const sensorsCount = sensorsWithLatestReadings.value.length
      
      console.log(`loadAllData: ✅ Complete. Hives: ${hivesCount}, Sensors: ${sensorsCount}`)
      
      lastUpdate.value = new Date()
      return { success: true }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data'
      console.error('loadAllData: Error:', errorMessage)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Refresh function (same as loadAllData but always runs)
  const refreshData = async () => {
    console.log('refreshData: Forcing data refresh')
    return await loadAllData({ loadEvenIfEmpty: true })
  }

  // Computed properties for enhanced data
  const hivesWithSensorData = computed(() => {
    if (hives.value.length === 0) {
      return []
    }
    
    return hives.value.map(hive => {
      // Get sensors for this hive
      const hiveSensors = sensors.value.filter(s => s.hive_id === hive.id)
      
      // Add latest_reading to each sensor
      const hiveSensorsWithReadings = hiveSensors.map(sensor => {
        const sensorReadings = latestReadings.value.filter(r => r.sensor_id === sensor.id)
        const latestReading = sensorReadings.length > 0 
          ? sensorReadings.reduce((latest, current) => 
              new Date(current.reading_time) > new Date(latest.reading_time) ? current : latest
            )
          : null
        
        return {
          ...sensor,
          latest_reading: latestReading
        }
      })
      
      // Add sensor data to hive
      return {
        ...hive,
        sensors: hiveSensorsWithReadings,
        sensor_count: hiveSensorsWithReadings.length,
        online_sensor_count: hiveSensorsWithReadings.filter(s => s.is_online).length,
        last_sensor_reading: hiveSensorsWithReadings.reduce((latest, sensor) => {
          if (!sensor.latest_reading) return latest
          if (!latest) return sensor.latest_reading.reading_time
          return new Date(sensor.latest_reading.reading_time) > new Date(latest) 
            ? sensor.latest_reading.reading_time 
            : latest
        }, null)
      }
    })
  })

  const sensorsWithLatestReadings = computed(() => {
    return sensors.value.map(sensor => {
      const sensorReadings = latestReadings.value.filter(r => r.sensor_id === sensor.id)
      const latestReading = sensorReadings.length > 0 
        ? sensorReadings.reduce((latest, current) => 
            new Date(current.reading_time) > new Date(latest.reading_time) ? current : latest
          )
        : null
      
      return {
        ...sensor,
        latest_reading: latestReading
      }
    })
  })

  // Summary computed properties
  const totalSensorCount = computed(() => sensors.value.length)
  const onlineSensorCount = computed(() => sensors.value.filter(s => s.is_online).length)
  const lowBatterySensorCount = computed(() => sensors.value.filter(s => s.battery_level < 20).length)
  
  const lastUpdateTime = computed(() => {
    const times = []
    
    // Collect all reading times
    latestReadings.value.forEach(reading => {
      if (reading.reading_time) {
        times.push(new Date(reading.reading_time))
      }
    })
    
    if (times.length === 0) return null
    return new Date(Math.max(...times))
  })

  // Watch for user changes and auto-load data
  watch(user, async (newUser, oldUser) => {
    console.log('useHiveData: User changed from', oldUser?.id, 'to', newUser?.id)
    
    if (newUser?.id !== oldUser?.id) {
      if (newUser) {
        console.log('useHiveData: Loading data for new user:', newUser.id)
        await loadAllData()
      } else {
        console.log('useHiveData: User logged out, clearing data')
        // Clear data when user logs out
        hives.value = []
        sensors.value = []
        latestReadings.value = []
        error.value = null
        lastUpdate.value = null
      }
    }
  }, { immediate: true })

  // Utility functions for working with specific data
  const getHiveById = (id) => {
    return hivesWithSensorData.value.find(h => h.id === id || h.uuid === id)
  }

  const getSensorsForHive = (hiveId) => {
    return sensorsWithLatestReadings.value.filter(s => s.hive_id === hiveId)
  }

  const getReadingsForHive = (hiveId) => {
    return latestReadings.value.filter(r => r.hive_id === hiveId)
  }

  // Helper to clear all data (useful for debugging)
  const clearAllData = () => {
    console.log('useHiveData: Manually clearing all data')
    hives.value = []
    sensors.value = []
    latestReadings.value = []
    error.value = null
    lastUpdate.value = null
  }

  // Return the composable interface
  return {
    // Raw data
    hives: readonly(hives),
    sensors: readonly(sensors),
    latestReadings: readonly(latestReadings),
    
    // Enhanced computed data
    hivesWithSensorData: readonly(hivesWithSensorData),
    sensorsWithLatestReadings: readonly(sensorsWithLatestReadings),
    
    // Loading states
    loading: readonly(loading),
    hivesLoading: readonly(hivesLoading),
    sensorsLoading: readonly(sensorsLoading),
    readingsLoading: readonly(readingsLoading),
    
    // Error and status
    error: readonly(error),
    lastUpdate: readonly(lastUpdate),
    
    // Summary data
    totalSensorCount: readonly(totalSensorCount),
    onlineSensorCount: readonly(onlineSensorCount),
    lowBatterySensorCount: readonly(lowBatterySensorCount),
    lastUpdateTime: readonly(lastUpdateTime),
    
    // Methods
    loadAllData,
    refreshData,
    fetchHives,
    fetchSensors,
    fetchLatestReadings,
    
    // Utility methods
    getHiveById,
    getSensorsForHive,
    getReadingsForHive,
    clearAllData,
    
    // Helper to clear error
    clearError: () => { error.value = null }
  }
}