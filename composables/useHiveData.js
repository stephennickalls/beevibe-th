// composables/useHiveData.js - Production version
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

  // Helper function to get auth token
  const getAuthToken = async () => {
    if (!user.value) return null
    
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // Individual fetch functions
  const fetchHives = async () => {
    if (!user.value) return { success: false, error: 'No user' }
    
    hivesLoading.value = true
    
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }
      
      const response = await $fetch('/api/hives', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        hives.value = response.data
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load hives'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      hivesLoading.value = false
    }
  }

  const fetchSensors = async (hiveId = null) => {
    if (!user.value) return { success: false, error: 'No user' }
    
    sensorsLoading.value = true
    
    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('Authentication token not available')
      }
      
      const url = hiveId ? `/api/sensors?hive_id=${hiveId}` : '/api/sensors'
      const response = await $fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        if (hiveId) {
          sensors.value = sensors.value.filter(s => s.hive_id !== hiveId).concat(response.data)
        } else {
          sensors.value = response.data
        }
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load sensors'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      sensorsLoading.value = false
    }
  }

  const fetchLatestReadings = async (hiveIds = null) => {
    if (!user.value) return { success: false, error: 'No user' }
    
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
      
      const response = await $fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      if (response.data) {
        latestReadings.value = response.data
      }
      
      return { success: true, data: response.data }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load readings'
      return { success: false, error: errorMessage }
    } finally {
      readingsLoading.value = false
    }
  }

  // Combined data loading
  const loadAllData = async (options = {}) => {
    if (!user.value) {
      return { success: false, error: 'No user' }
    }
    
    loading.value = true
    error.value = null
    
    try {
      // Load hives first (required for everything else)
      const hivesResult = await fetchHives()
      if (!hivesResult.success) {
        throw new Error(hivesResult.error)
      }
      
      // Only proceed if we have hives or if explicitly requested
      if (hives.value.length === 0 && !options.loadEvenIfEmpty) {
        lastUpdate.value = new Date()
        return { success: true, message: 'No hives to load data for' }
      }
      
      // Load sensors and readings in sequence
      const sensorsResult = await fetchSensors()
      const readingsResult = await fetchLatestReadings()
      
      // Force reactivity update by triggering computed properties
      const hivesCount = hivesWithSensorData.value.length
      const sensorsCount = sensorsWithLatestReadings.value.length
      
      lastUpdate.value = new Date()
      
      return { success: true }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Refresh function (same as loadAllData but always runs)
  const refreshData = async () => {
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
      
      // Get latest readings for this hive (for hive-level metrics)
      const hiveReadings = latestReadings.value.filter(r => r.hive_id === hive.id)
      
      // Group readings by sensor type for easy access
      const readings = {}
      hiveReadings.forEach(reading => {
        readings[reading.sensor_type] = {
          value: reading.value,
          time: reading.reading_time,
          unit: reading.unit,
          signal_strength: reading.signal_strength
        }
      })
      
      // Calculate sensor statistics
      const onlineSensorCount = hiveSensorsWithReadings.filter(s => s.is_online).length
      const lowBatterySensorCount = hiveSensorsWithReadings.filter(s => s.battery_level < 20).length
      
      // Find most recent reading time
      const readingTimes = Object.values(readings)
        .map(r => r.time)
        .filter(Boolean)
        .map(t => new Date(t))
      
      const lastSensorReading = readingTimes.length > 0 
        ? new Date(Math.max(...readingTimes))
        : null
      
      return {
        ...hive,
        // Use sensors with readings attached
        sensors: hiveSensorsWithReadings,
        sensor_count: hiveSensorsWithReadings.length,
        online_sensor_count: onlineSensorCount,
        low_battery_sensor_count: lowBatterySensorCount,
        
        // Latest readings by type
        temperature: readings.temperature?.value || null,
        temperature_time: readings.temperature?.time || null,
        humidity: readings.humidity?.value || null,
        humidity_time: readings.humidity?.time || null,
        weight: readings.weight?.value || null,
        weight_time: readings.weight?.time || null,
        
        // Combined metadata
        last_sensor_reading: lastSensorReading,
        readings_count: hiveReadings.length
      }
    })
  })

  const sensorsWithLatestReadings = computed(() => {
    return sensors.value.map(sensor => {
      // Find latest reading for this sensor
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
    if (newUser?.id !== oldUser?.id) {
      if (newUser) {
        await loadAllData()
      } else {
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
    
    // Helper to clear error
    clearError: () => { error.value = null }
  }
}