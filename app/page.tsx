"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Initial data
const initialDevices = [
  { id: "device1", name: "Alpha Device", status: "active", securityLevel: 85 },
  { id: "device2", name: "Beta Device", status: "active", securityLevel: 92 },
  {
    id: "device3",
    name: "Gamma Device",
    status: "destroyed",
    securityLevel: 0,
  },
  { id: "device4", name: "Delta Device", status: "active", securityLevel: 78 },
];

const initialAlerts = [
  {
    id: 1,
    device: "Alpha Device",
    type: "Tamper Attempt",
    time: "2 minutes ago",
  },
  { id: 2, device: "Gamma Device", type: "Self-Destruct", time: "1 hour ago" },
  { id: 3, device: "Beta Device", type: "Low Battery", time: "3 hours ago" },
];

const alertTypes = [
  "Tamper Attempt",
  "Unauthorized Access",
  "Low Battery",
  "Connection Lost",
  "Malware Detected",
];

export default function Dashboard() {
  const [devices, setDevices] = useState(initialDevices);
  const [recentAlerts, setRecentAlerts] = useState(initialAlerts);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Function to generate small random fluctuations
  const fluctuate = (value: number, range = 2) => {
    const change = (Math.random() - 0.5) * range;
    return Math.min(Math.max(value + change, 0), 100);
  };

  // Update device data and generate random alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((currentDevices) =>
        currentDevices.map((device) => ({
          ...device,
          securityLevel:
            device.status === "active"
              ? Math.round(fluctuate(device.securityLevel))
              : device.securityLevel,
        }))
      );

      // Random alert generation
      if (Math.random() < 0.1) {
        // 10% chance of new alert every second
        const randomDevice =
          devices[Math.floor(Math.random() * devices.length)];
        const randomAlertType =
          alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          id: Date.now(),
          device: randomDevice.name,
          type: randomAlertType,
          time: "Just now",
        };
        setRecentAlerts((prevAlerts) => [newAlert, ...prevAlerts.slice(0, 4)]);
      }

      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [devices]);

  // Calculate average security level
  const averageSecurityLevel = Math.round(
    devices.reduce((acc, device) => acc + device.securityLevel, 0) /
      devices.length
  );

  // Handle drag end
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(devices);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDevices(items);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Self-Destructing Device Control Center
          </h1>
          <p className="text-xl text-blue-300">Secure. Monitor. Protect.</p>
          <p className="text-lg text-blue-400 mt-2">
            {currentTime.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="devices" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              >
                {devices.map((device, index) => (
                  <Draggable
                    key={device.id}
                    draggableId={device.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              {device.name}
                            </CardTitle>
                            <Badge
                              variant={
                                device.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {device.status}
                            </Badge>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold mb-2">
                              {device.securityLevel}%
                            </div>
                            <Progress
                              value={device.securityLevel}
                              className="h-2"
                            />
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-sm text-gray-400">
                                Security Level
                              </span>
                              <Link
                                href={`/dashboard?deviceId=${device.id}`}
                                passHref
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  Monitor{" "}
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Devices</span>
                  <Badge variant="outline" className="bg-blue-900">
                    {devices.filter((d) => d.status === "active").length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Security Level</span>
                  <Badge variant="outline" className="bg-green-900">
                    {averageSecurityLevel}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Alerts (Last 24h)</span>
                  <Badge variant="outline" className="bg-red-900">
                    {recentAlerts.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                Recent Alerts{" "}
                <AlertTriangle className="ml-2 h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{alert.device}</p>
                      <p className="text-sm text-gray-400">{alert.type}</p>
                    </div>
                    <Badge variant="outline" className="bg-red-900">
                      {alert.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard" passHref>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Access Full Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
