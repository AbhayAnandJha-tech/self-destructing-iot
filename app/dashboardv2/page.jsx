'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { db } from '@/lib/firebase/config'
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import {
  ActivityIcon,
  AlertCircleIcon,
  DownloadIcon,
  RocketIcon,
  ShieldIcon,
  SunIcon,
  ThermometerIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import LocationGraph from '@/components/location-graph'

export default function Dashboard() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sensorData, setSensorData] = useState({
    motion: { x: 0, y: 0, z: 1 },
    light: 500,
    temperature: 25,
  })
  const [motionSensorDataLogs, setMotionSensorDataLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [isSimulating, setIsSimulating] = useState(true)

  async function createNewAlert(type, device_id) {
    const newAlertObject = {
      type: type ?? 'tamper',
      device_id: device_id,
      timestamp: Date.now(),
      // final_data_ref: f'device_data/{device_id}/final_dump.json',
    }
    const docRef = await addDoc(collection(db, 'alerts'), newAlertObject)
    return docRef.id
  }

  useEffect(() => {
    // Function to generate random values for sensor data
    const generateRandomSensorData = () => {
      const randomMotion = {
        x: (Math.random() * 2 - 1).toFixed(2), // Random value between -1 and 1
        y: (Math.random() * 2 - 1).toFixed(2),
        z: (Math.random() * 2 - 1).toFixed(2),
      }
      const randomLight = Math.floor(Math.random() * 1000) // Random light intensity between 0 and 1000
      const randomTemperature = (Math.random() * 30 + 10).toFixed(2) // Random temperature between 10°C and 40°C

      setSensorData({
        motion: randomMotion,
        light: randomLight,
        temperature: randomTemperature,
      })

      setMotionSensorDataLogs((prevLogs) => [
        ...prevLogs,
        randomMotion, // Append the current sensorData
      ])
    }

    // Set an interval to update sensor data every second (1000ms)
    const interval = setInterval(generateRandomSensorData, 1000)

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'devices'), (snapshot) => {
      const deviceList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log(deviceList)
      setDevices(deviceList)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      // Calculate the timestamp for 10 seconds ago
      const tenSecondsAgo = Date.now() - 30 * 1000

      const q = query(
        collection(db, 'alerts'),
        // where('device_id', '==', selectedDevice.id),
        where('timestamp', '>=', tenSecondsAgo) // Filter for alerts from the last 10 seconds
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const alertList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('alertList: ', alertList)
        setAlerts(alertList)
      })

      // initializeWebSocket(selectedDevice.id)

      return () => {
        unsubscribe()
        // if (socket) socket.close()
      }
    }
  }, [selectedDevice])

  const simulateTamper = () => {
    toast('Test Tamper', {
      description: 'N/A',
      variant: 'destructive',
    })

    createNewAlert('tamper', selectedDevice.id)
  }

  return (
    <div className="p-6 space-y-6">
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
          <div className="flex items-center justify-between mx-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full bg-green-500`} />
              <span>Connected</span>
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
                  <ActivityIcon className="mr-2" /> Motion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>X: {sensorData.motion.x}</div>
                  <div>Y: {sensorData.motion.y}</div>
                  <div>Z: {sensorData.motion.z}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SunIcon className="mr-2" /> Light Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sensorData.light} lux</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ThermometerIcon className="mr-2" /> Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sensorData.temperature}°C
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {motionSensorDataLogs ? (
              <LocationGraph graphData={motionSensorDataLogs} />
            ) : (
              <LocationGraph />
            )}

            <LocationGraph graphData={{}} />
            <LocationGraph graphData={{}} />
          </div>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircleIcon className="mr-2" /> Alert History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map(
                  (alert) =>
                    alert &&
                    alert.device_id == selectedDevice.id && (
                      <Alert key={alert.id} variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertTitle className="font-semibold">
                          Alert! -{' '}
                          {alert.type.charAt(0).toUpperCase() +
                            alert.type.slice(1)}{' '}
                          Detected
                        </AlertTitle>
                        <AlertDescription>
                          {new Date(alert.timestamp).toLocaleString()}
                        </AlertDescription>
                      </Alert>
                    )
                )}
                {alerts.length === 0 && (
                  <div className="text-center text-gray-500">
                    No alerts recorded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isSimulating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldIcon className="mr-2" /> Security Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={simulateTamper}
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
