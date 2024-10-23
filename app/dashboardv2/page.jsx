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
  AlertCircleIcon,
  DownloadIcon,
  RocketIcon,
  ShieldIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

export default function Dashboard() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sensorData, setSensorData] = useState({
    motion: { x: 0, y: 0, z: 1 },
    light: 500,
    temperature: 25,
  })
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
                        <AlertTitle>
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
