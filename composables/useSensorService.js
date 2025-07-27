// composables/useSensorService.js - Centralized sensor operations
export const useSensorService = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Helper function to get auth token
  const getAuthToken = async () => {
    if (!user.value) return null
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  // Update sensor - can be called from anywhere
  const updateSensor = async (sensorId, updateData) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/sensors/${sensorId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: updateData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    return response.data
  }

  // Delete sensor - can be called from anywhere
  const deleteSensor = async (sensorId) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/sensors/${sensorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    return response
  }

  // Create sensor - can be called from anywhere
  const createSensor = async (sensorData) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch('/api/sensors', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: sensorData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    return response.data
  }

  // Assign sensor to hive
  const assignSensorToHive = async (sensorId, hiveId) => {
    return await updateSensor(sensorId, { hive_id: hiveId })
  }

  // Unlink sensor from hive
  const unlinkSensorFromHive = async (sensorId) => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/sensors/${sensorId}/unlink`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    return response.data
  }

  return {
    updateSensor,
    deleteSensor,
    createSensor,
    assignSensorToHive,
    unlinkSensorFromHive
  }
}