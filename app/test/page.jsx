'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import { io, Socket } from 'socket.io-client'

export default function Component() {
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [isSimulating, setIsSimulating] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (selectedDevice && selectedDevice.id) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
        upgrade: false,
        query: { device_id: selectedDevice.id },
      })

      newSocket.on('connect', () => {
        toast('Connected to server', {
          description: `Monitoring device ${selectedDevice.id}`,
        })
      })

      newSocket.on('tamperAlert', (data) => {
        handleTamperAlert(data)
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [selectedDevice])

  const handleTamperAlert = (alert) => {
    // Your existing handleTamperAlert logic here
    toast('⚠️ TAMPER DETECTED', {
      description:
        'Device self-destruct sequence initiated. Final data stored.',
      variant: 'destructive',
    })
  }

  const simulateTamper = () => {
    if (socket && socket.connected) {
      socket.emit('simulateTamper', { device_id: selectedDevice.id })
    } else {
      toast('Simulation Error', {
        description: 'Not connected to the server',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Other components... */}

      {selectedDevice && isSimulating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2" /> Security Simulation
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
    </div>
  )
}
