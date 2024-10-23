'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertCircle,
  Activity,
  Sun,
  Thermometer,
  Shield,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { db, storage } from '@/lib/firebase/config'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'

const Dashboard = () => {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sensorData, setSensorData] = useState({
    motion: { x: 0, y: 0, z: 1 },
    light: 500,
    temperature: 25,
  })
  const [historicalData, setHistoricalData] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isSimulating, setIsSimulating] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'devices'), (snapshot) => {
      const deviceList = []
      snapshot.forEach((doc) => {
        deviceList.push({ id: doc.id, ...doc.data() })
      })
      setDevices(deviceList)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      const q = query(
        collection(db, 'alerts'),
        where('device_id', '==', selectedDevice.id)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const alertList = []
        snapshot.forEach((doc) => {
          alertList.push({ id: doc.id, ...doc.data() })
        })
        setAlerts(alertList)
      })

      initializeWebSocket(selectedDevice.id)

      return () => {
        unsubscribe()
        if (socket) socket.close()
      }
    }
  }, [selectedDevice])

  const initializeWebSocket = (deviceId) => {
    const ws = new WebSocket(`ws://localhost:5000?device_id=${deviceId}`)
    setSocket(ws)

    ws.onopen = () => {
      setIsConnected(true)
      toast('Connected to device', {
        description: `Monitoring device ${deviceId}`,
      })
    }

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data)

      if (type === 'sensorUpdate' && isSimulating) {
        setSensorData(data)
        setHistoricalData((prev) => [
          ...prev,
          { timestamp: new Date(), ...data },
        ])
      } else if (type === 'tamperAlert') {
        handleTamperAlert(data)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket Error: ', error)
      toast('Connection Error', {
        description: 'Failed to connect to device',
        variant: 'destructive',
      })
    }

    ws.onclose = () => {
      setIsConnected(false)
      toast('Disconnected', {
        description: 'Connection to device lost',
        variant: 'destructive',
      })
    }
  }

  const handleTamperAlert = async (alert) => {
    setAlerts((prev) => [alert, ...prev])

    toast('⚠️ TAMPER DETECTED', {
      description:
        'Device self-destruct sequence initiated. Final data stored.',
      variant: 'destructive',
    })

    try {
      const url = await getDownloadURL(ref(storage, alert.final_data_ref))
      const response = await fetch(url)
      const finalData = await response.json()
      console.log('Retrieved final data:', finalData)

      setDevices((prev) =>
        prev.map((device) =>
          device.id === alert.device_id
            ? { ...device, status: 'destroyed' }
            : device
        )
      )
    } catch (error) {
      console.error('Error retrieving final data:', error)
    }
  }

  const downloadFinalData = async (alert) => {
    try {
      const url = await getDownloadURL(ref(storage, alert.final_data_ref))
      const response = await fetch(url)
      const data = await response.blob()

      const downloadUrl = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `device-${alert.device_id}-final-data.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast('Download Error', {
        description: 'Failed to download final data',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Rest of the JSX remains the same */}
      {/* Device Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Device Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {devices.map((device) => (
              <Button
                key={device.id}
                variant={
                  selectedDevice?.id === device.id ? 'default' : 'outline'
                }
                className={`w-full ${
                  device.status === 'destroyed' ? 'opacity-50' : ''
                }`}
                onClick={() => setSelectedDevice(device)}
                disabled={device.status === 'destroyed'}
              >
                {device.id.substring(0, 8)}
                <div
                  className={`ml-2 w-2 h-2 rounded-full ${
                    device.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDevice && (
        <>
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Simulation Mode</span>
              <Switch
                checked={isSimulating}
                onCheckedChange={setIsSimulating}
              />
            </div>
          </div>

          {/* Sensor Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2" /> Motion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>X: {sensorData.motion.x.toFixed(2)}</div>
                  <div>Y: {sensorData.motion.y.toFixed(2)}</div>
                  <div>Z: {sensorData.motion.z.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="mr-2" /> Light Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sensorData.light.toFixed(1)} lux
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Thermometer className="mr-2" /> Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sensorData.temperature.toFixed(1)}°C
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Data Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sensor History</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                width={800}
                height={400}
                data={historicalData.slice(-50)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                <Line type="monotone" dataKey="light" stroke="#82ca9d" />
              </LineChart>
            </CardContent>
          </Card>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2" /> Alert History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-red-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="text-red-500 mr-2" />
                      <div>
                        <div className="font-semibold">
                          {alert.type.charAt(0).toUpperCase() +
                            alert.type.slice(1)}{' '}
                          Detected
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFinalData(alert)}
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Data
                    </Button>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center text-gray-500">
                    No alerts recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Simulation Controls */}
          {isSimulating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2" /> Security Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => {
                    fetch('http://localhost:5000/api/simulation/trigger', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        device_id: selectedDevice.id,
                        type: 'tamper',
                      }),
                    })
                  }}
                  className="w-full"
                >
                  Simulate Tamper Detection
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
