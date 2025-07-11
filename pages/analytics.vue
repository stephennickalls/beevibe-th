<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p class="text-gray-400">View detailed sensor data and trends for your hives</p>
      </div>

      <!-- Controls Section -->
      <div class="bg-gray-900 rounded-2xl p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Hive Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Select Hive</label>
            <select 
              v-model="selectedHiveId" 
              @change="onHiveChange"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a hive...</option>
              <option v-for="hive in hives" :key="hive.id" :value="hive.id">
                {{ hive.name || `Hive ${hive.id}` }}
              </option>
            </select>
          </div>

          <!-- Time Range Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
            <select 
              v-model="selectedTimeRange" 
              @change="fetchSensorData"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-gray-900 rounded-2xl p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-400">Loading sensor data...</p>
      </div>

      <!-- No Hive Selected State -->
      <div v-else-if="!selectedHiveId" class="bg-gray-900 rounded-2xl p-12 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 7H7v6h6V7z"/>
          <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z"/>
        </svg>
        <h3 class="text-xl font-semibold mb-2">Select a Hive</h3>
        <p class="text-gray-400">Choose a hive from the dropdown above to view its sensor analytics</p>
      </div>

      <!-- No Data State -->
      <div v-else-if="!hasData" class="bg-gray-900 rounded-2xl p-12 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
        </svg>
        <h3 class="text-xl font-semibold mb-2">No Data Available</h3>
        <p class="text-gray-400">No sensor readings found for the selected time range</p>
      </div>

      <!-- Charts Section -->
      <div v-else class="space-y-6">
        <!-- Temperature Chart -->
        <div v-if="temperatureData.length > 0" class="bg-gray-900 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Temperature (°C)</h3>
            <div class="text-sm text-gray-400">
              Current: {{ latestValues.temperature }}°C
            </div>
          </div>
          <div class="h-80 relative">
            <svg 
              ref="temperatureChart" 
              class="w-full h-full"
              style="background: transparent;"
            ></svg>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Optimal range: 32-38°C
          </div>
        </div>

        <!-- Humidity Chart -->
        <div v-if="humidityData.length > 0" class="bg-gray-900 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Humidity (%)</h3>
            <div class="text-sm text-gray-400">
              Current: {{ latestValues.humidity }}%
            </div>
          </div>
          <div class="h-80 relative">
            <svg 
              ref="humidityChart" 
              class="w-full h-full"
              style="background: transparent;"
            ></svg>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Optimal range: 50-70%
          </div>
        </div>

        <!-- Weight Chart -->
        <div v-if="weightData.length > 0" class="bg-gray-900 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Weight (kg)</h3>
            <div class="text-sm text-gray-400">
              Current: {{ latestValues.weight }}kg
            </div>
          </div>
          <div class="h-80 relative">
            <svg 
              ref="weightChart" 
              class="w-full h-full"
              style="background: transparent;"
            ></svg>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Weight changes can indicate honey production and hive health
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <h3 class="text-xl font-semibold mb-4">Summary Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-if="temperatureStats" class="text-center">
              <h4 class="text-lg font-medium text-green-400 mb-2">Temperature</h4>
              <div class="space-y-1 text-sm">
                <div>Average: {{ temperatureStats.avg }}°C</div>
                <div>Min: {{ temperatureStats.min }}°C</div>
                <div>Max: {{ temperatureStats.max }}°C</div>
              </div>
            </div>
            <div v-if="humidityStats" class="text-center">
              <h4 class="text-lg font-medium text-blue-400 mb-2">Humidity</h4>
              <div class="space-y-1 text-sm">
                <div>Average: {{ humidityStats.avg }}%</div>
                <div>Min: {{ humidityStats.min }}%</div>
                <div>Max: {{ humidityStats.max }}%</div>
              </div>
            </div>
            <div v-if="weightStats" class="text-center">
              <h4 class="text-lg font-medium text-yellow-400 mb-2">Weight</h4>
              <div class="space-y-1 text-sm">
                <div>Average: {{ weightStats.avg }}kg</div>
                <div>Min: {{ weightStats.min }}kg</div>
                <div>Max: {{ weightStats.max }}kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as d3 from 'd3'

// Meta
definePageMeta({
  title: 'Analytics - BeeVibe Dashboard'
})

// Reactive data
const loading = ref(false)
const hives = ref([])
const selectedHiveId = ref('')
const selectedTimeRange = ref('24h')
const sensorReadings = ref([])
const activeAlerts = ref([])

// Chart refs
const temperatureChart = ref(null)
const humidityChart = ref(null)
const weightChart = ref(null)

// Computed properties
const temperatureData = computed(() => {
  return sensorReadings.value
    .filter(reading => reading.sensor_type === 'temperature')
    .map(reading => ({
      time: new Date(reading.reading_time),
      value: parseFloat(reading.value)
    }))
    .sort((a, b) => a.time - b.time)
})

const humidityData = computed(() => {
  return sensorReadings.value
    .filter(reading => reading.sensor_type === 'humidity')
    .map(reading => ({
      time: new Date(reading.reading_time),
      value: parseFloat(reading.value)
    }))
    .sort((a, b) => a.time - b.time)
})

const weightData = computed(() => {
  return sensorReadings.value
    .filter(reading => reading.sensor_type === 'weight')
    .map(reading => ({
      time: new Date(reading.reading_time),
      value: parseFloat(reading.value) / 1000 // Convert grams to kg
    }))
    .sort((a, b) => a.time - b.time)
})

const hasData = computed(() => {
  return temperatureData.value.length > 0 || 
         humidityData.value.length > 0 || 
         weightData.value.length > 0
})

const latestValues = computed(() => {
  const latest = {
    temperature: 'N/A',
    humidity: 'N/A',
    weight: 'N/A'
  }
  
  if (temperatureData.value.length > 0) {
    latest.temperature = temperatureData.value[temperatureData.value.length - 1].value.toFixed(1)
  }
  
  if (humidityData.value.length > 0) {
    latest.humidity = humidityData.value[humidityData.value.length - 1].value.toFixed(1)
  }
  
  if (weightData.value.length > 0) {
    latest.weight = weightData.value[weightData.value.length - 1].value.toFixed(1)
  }
  
  return latest
})

const temperatureStats = computed(() => {
  if (temperatureData.value.length === 0) return null
  const values = temperatureData.value.map(d => d.value)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    min: Math.min(...values).toFixed(1),
    max: Math.max(...values).toFixed(1)
  }
})

const humidityStats = computed(() => {
  if (humidityData.value.length === 0) return null
  const values = humidityData.value.map(d => d.value)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    min: Math.min(...values).toFixed(1),
    max: Math.max(...values).toFixed(1)
  }
})

const weightStats = computed(() => {
  if (weightData.value.length === 0) return null
  const values = weightData.value.map(d => d.value)
  return {
    avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
    min: Math.min(...values).toFixed(1),
    max: Math.max(...values).toFixed(1)
  }
})

// D3 Chart Functions
const createD3LineChart = (svgRef, data, color, yDomain, optimalRange = null, unit = '') => {
  if (!svgRef || !data || data.length === 0) return

  // Clear previous chart
  d3.select(svgRef).selectAll("*").remove()

  const margin = { top: 20, right: 30, bottom: 40, left: 60 }
  const width = svgRef.clientWidth - margin.left - margin.right
  const height = svgRef.clientHeight - margin.top - margin.bottom

  const svg = d3.select(svgRef)
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.time))
    .range([0, width])

  const yScale = d3.scaleLinear()
    .domain(yDomain || d3.extent(data, d => d.value))
    .range([height, 0])

  // Line generator
  const line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value))
    .curve(d3.curveCardinal)

  // Add subtle grid lines
  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat("")
    )
    .style("stroke-dasharray", "2,2")
    .style("opacity", 0.1)
    .style("stroke", "#6B7280")

  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat("")
    )
    .style("stroke-dasharray", "2,2")
    .style("opacity", 0.1)
    .style("stroke", "#6B7280")

  // Add optimal range if provided (but don't display background)
  // if (optimalRange) {
  //   g.append("rect")
  //     .attr("x", 0)
  //     .attr("y", yScale(optimalRange.max))
  //     .attr("width", width)
  //     .attr("height", yScale(optimalRange.min) - yScale(optimalRange.max))
  //     .attr("fill", "#F59E0B")
  //     .attr("opacity", 0.08)
  //     .attr("rx", 2)
  // }

  // Add gradient for line area
  const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", `gradient-${color.replace('#', '')}`)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0).attr("y1", height)
    .attr("x2", 0).attr("y2", 0)

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color)
    .attr("stop-opacity", 0)

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color)
    .attr("stop-opacity", 0.2)

  // Add area under the line
  const area = d3.area()
    .x(d => xScale(d.time))
    .y0(height)
    .y1(d => yScale(d.value))
    .curve(d3.curveCardinal)

  g.append("path")
    .datum(data)
    .attr("fill", `url(#gradient-${color.replace('#', '')})`)
    .attr("d", area)

  // Add the main line
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("d", line)
    .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))")

  // Add clean axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d => {
        if (selectedTimeRange.value === '24h') {
          return d3.timeFormat("%H:%M")(d)
        } else {
          return d3.timeFormat("%m/%d")(d)
        }
      })
      .ticks(6)
    )
    .style("color", "#9CA3AF")
    .style("font-size", "12px")

  g.append("g")
    .call(d3.axisLeft(yScale)
      .tickFormat(d => d + unit)
      .ticks(5)
    )
    .style("color", "#9CA3AF")
    .style("font-size", "12px")

  // Add interactive hover line
  const hoverLine = g.append("line")
    .attr("stroke", "#6B7280")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .style("opacity", 0)

  // Add invisible overlay for hover detection
  g.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseover", function() {
      hoverLine.style("opacity", 1)
      tooltip.style("visibility", "visible")
    })
    .on("mouseout", function() {
      hoverLine.style("opacity", 0)
      tooltip.style("visibility", "hidden")
    })
    .on("mousemove", function(event) {
      const [mouseX] = d3.pointer(event)
      const xValue = xScale.invert(mouseX)
      
      // Find closest data point
      const bisect = d3.bisector(d => d.time).left
      const index = bisect(data, xValue, 1)
      const d0 = data[index - 1]
      const d1 = data[index]
      const d = !d1 || (xValue - d0.time < d1.time - xValue) ? d0 : d1
      
      if (d) {
        hoverLine
          .attr("x1", xScale(d.time))
          .attr("x2", xScale(d.time))
          .attr("y1", 0)
          .attr("y2", height)
        
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px")
          .html(`
            <div style="font-weight: 500;">${d3.timeFormat("%b %d, %H:%M")(d.time)}</div>
            <div style="color: ${color};">${d.value.toFixed(1)}${unit}</div>
          `)
      }
    })

  // Create tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(31, 41, 55, 0.95)")
    .style("color", "#F9FAFB")
    .style("padding", "8px 12px")
    .style("border-radius", "8px")
    .style("border", "1px solid rgba(107, 114, 128, 0.3)")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("backdrop-filter", "blur(8px)")
    .style("box-shadow", "0 10px 25px rgba(0,0,0,0.3)")
}

const updateCharts = async () => {
  await nextTick()
  
  if (temperatureData.value.length > 0 && temperatureChart.value) {
    createD3LineChart(
      temperatureChart.value, 
      temperatureData.value, 
      '#10B981', // Green from your theme
      null, 
      { min: 32, max: 38 },
      '°C'
    )
  }
  
  if (humidityData.value.length > 0 && humidityChart.value) {
    createD3LineChart(
      humidityChart.value, 
      humidityData.value, 
      '#3B82F6', // Blue from your theme
      [0, 100], 
      { min: 50, max: 70 },
      '%'
    )
  }
  
  if (weightData.value.length > 0 && weightChart.value) {
    createD3LineChart(
      weightChart.value, 
      weightData.value, 
      '#F59E0B', // Yellow from your theme
      null, 
      null,
      'kg'
    )
  }
}

// Functions
const fetchHives = async () => {
  try {
    const { data, error } = await $fetch('/api/hives')
    
    if (!error && data) {
      hives.value = data.filter(hive => hive.is_active)
    }
  } catch (err) {
    console.error('Error fetching hives:', err)
  }
}

const fetchSensorData = async () => {
  if (!selectedHiveId.value) return
  
  loading.value = true
  
  try {
    console.log('Fetching sensor data for hive:', selectedHiveId.value, 'time range:', selectedTimeRange.value)
    
    const { data, error } = await $fetch('/api/readings/history', {
      query: {
        hive_id: selectedHiveId.value,
        time_range: selectedTimeRange.value
      }
    })
    
    console.log('API Response:', { data, error })
    
    if (!error && data) {
      console.log(`Received ${data.length} sensor readings`)
      if (data.length > 0) {
        console.log('Sample reading:', data[0])
        console.log('Date range in data:', {
          first: data[0]?.reading_time,
          last: data[data.length - 1]?.reading_time
        })
      }
      sensorReadings.value = data
    } else {
      console.error('API Error:', error)
      sensorReadings.value = []
    }
  } catch (err) {
    console.error('Error fetching sensor data:', err)
    sensorReadings.value = []
  } finally {
    loading.value = false
  }
}

const fetchAlerts = async () => {
  try {
    const { data, error } = await $fetch('/api/alerts')
    
    if (!error && data) {
      activeAlerts.value = data.filter(alert => !alert.resolved)
    }
  } catch (err) {
    console.error('Error fetching alerts:', err)
  }
}

const onHiveChange = () => {
  if (selectedHiveId.value) {
    fetchSensorData()
  } else {
    sensorReadings.value = []
  }
}

const toggleSensorType = (sensorType) => {
  // Removed - no longer needed
}

// Watch for data changes and update charts
watch([temperatureData, humidityData, weightData], updateCharts, { deep: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchHives(),
    fetchAlerts()
  ])
})
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* D3 tooltip styles */
:global(.d3-tooltip) {
  z-index: 1000;
}
</style>