// src/utils/dataHandlers.js
export const DataUtils = {
  // Compress sensor data for storage
  compressSensorData(data) {
    return data.map((reading) => ({
      t: reading.timestamp,
      m: {
        x: parseFloat(reading.motion.x.toFixed(3)),
        y: parseFloat(reading.motion.y.toFixed(3)),
        z: parseFloat(reading.motion.z.toFixed(3)),
      },
      l: Math.round(reading.light),
      tp: parseFloat(reading.temperature.toFixed(1)),
    }))
  },

  // Decompress sensor data for display
  decompressSensorData(compressedData) {
    return compressedData.map((reading) => ({
      timestamp: reading.t,
      motion: {
        x: reading.m.x,
        y: reading.m.y,
        z: reading.m.z,
      },
      light: reading.l,
      temperature: reading.tp,
    }))
  },

  // Format data for charts
  formatChartData(sensorData) {
    return sensorData.map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString(),
      temperature: reading.temperature,
      light: reading.light,
      motionMagnitude: Math.sqrt(
        Math.pow(reading.motion.x, 2) +
          Math.pow(reading.motion.y, 2) +
          Math.pow(reading.motion.z, 2)
      ).toFixed(3),
    }))
  },

  // Calculate data statistics
  calculateStats(sensorData) {
    const stats = {
      temperature: {
        min: Infinity,
        max: -Infinity,
        avg: 0,
      },
      light: {
        min: Infinity,
        max: -Infinity,
        avg: 0,
      },
      motion: {
        maxMagnitude: 0,
      },
    }

    sensorData.forEach((reading) => {
      // Temperature
      stats.temperature.min = Math.min(
        stats.temperature.min,
        reading.temperature
      )
      stats.temperature.max = Math.max(
        stats.temperature.max,
        reading.temperature
      )
      stats.temperature.avg += reading.temperature

      // Light
      stats.light.min = Math.min(stats.light.min, reading.light)
      stats.light.max = Math.max(stats.light.max, reading.light)
      stats.light.avg += reading.light

      // Motion
      const magnitude = Math.sqrt(
        Math.pow(reading.motion.x, 2) +
          Math.pow(reading.motion.y, 2) +
          Math.pow(reading.motion.z, 2)
      )
      stats.motion.maxMagnitude = Math.max(stats.motion.maxMagnitude, magnitude)
    })

    const count = sensorData.length
    stats.temperature.avg /= count
    stats.light.avg /= count

    return stats
  },

  // Generate final report
  generateFinalReport(deviceId, sensorData, alertInfo) {
    const stats = this.calculateStats(sensorData)
    return {
      deviceId,
      timestamp: new Date().toISOString(),
      alertInfo,
      stats,
      rawData: this.compressSensorData(sensorData),
      metadata: {
        dataPoints: sensorData.length,
        timespan: {
          start: sensorData[0].timestamp,
          end: sensorData[sensorData.length - 1].timestamp,
        },
      },
    }
  },
}

export default DataUtils
