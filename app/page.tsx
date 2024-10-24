"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock data for the front page
const devices = [
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

const recentAlerts = [
  {
    id: 1,
    device: "Alpha Device",
    type: "Tamper Attempt",
    time: "2 minutes ago",
  },
  { id: 2, device: "Gamma Device", type: "Self-Destruct", time: "1 hour ago" },
  { id: 3, device: "Beta Device", type: "Low Battery", time: "3 hours ago" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Self-Destructing Device Control Center
          </h1>
          <p className="text-xl text-blue-300">Secure. Monitor. Protect.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {devices.map((device) => (
            <Card
              key={device.id}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {device.name}
                </CardTitle>
                <Badge
                  variant={
                    device.status === "active" ? "default" : "destructive"
                  }
                >
                  {device.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {device.securityLevel}%
                </div>
                <Progress value={device.securityLevel} className="h-2" />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Security Level</span>
                  {/* Pass device id as query parameter */}
                  <Link href={`/dashboard?deviceId=${device.id}`} passHref>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Monitor <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                    3
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Security Level</span>
                  <Badge variant="outline" className="bg-green-900">
                    85%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Alerts (Last 24h)</span>
                  <Badge variant="outline" className="bg-red-900">
                    5
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                Recent Alerts
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
