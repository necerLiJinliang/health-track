"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useInsertionEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAppointments } from "@/lib/api";
import { Appointment } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const fetchAppointments = useCallback(async () => {
    const appointmentsList = await getUserAppointments(user?.id || 0);
    setAppointments(appointmentsList);
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              HealthTrack Dashboard
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-100 shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-gray-500 text-sm">
                    No upcoming appointments.
                  </div>
                ) : (
                  appointments.map((appointment, idx) => (
                    <div
                      key={appointment.id || idx}
                      className={`border-l-4 ${
                        idx % 2 === 0 ? "border-blue-500" : "border-green-500"
                      } pl-4 py-1`}
                    >
                      <h3 className="font-medium">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600">
                        {appointment.type}
                      </p>
                      <p className="text-sm">
                        {new Date(appointment.dateTime).toLocaleString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  ))
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/appointments")}
                >
                  View All Appointments
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow">
            <CardHeader>
              <CardTitle className="text-green-600">
                Active Challenges
              </CardTitle>
              <CardDescription>Ongoing wellness goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <h3 className="font-medium">10K Steps Daily</h3>
                  <p className="text-sm text-gray-600">With Family Group</p>
                  <p className="text-sm">3 days remaining</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-1">
                  <h3 className="font-medium">Hydration Goal</h3>
                  <p className="text-sm text-gray-600">Personal Challenge</p>
                  <p className="text-sm">7 days remaining</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/challenges")}
                >
                  View All Challenges
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Health Summary</CardTitle>
              <CardDescription>Monthly progress report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Steps:</span>
                  <span className="font-medium">85% of goal</span>
                </div>
                <div className="flex justify-between">
                  <span>Sleep:</span>
                  <span className="font-medium">7.2 hrs avg</span>
                </div>
                <div className="flex justify-between">
                  <span>Heart Rate:</span>
                  <span className="font-medium">72 bpm avg</span>
                </div>
                <div className="flex justify-between">
                  <span>Calories:</span>
                  <span className="font-medium">92% of goal</span>
                </div>
                <Button variant="outline" className="w-full">
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest health activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <span className="text-blue-600 font-bold">A</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Appointment Scheduled</h3>
                    <p className="text-sm text-gray-600">
                      Dermatology checkup with Dr. Chen
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <span className="text-green-600 font-bold">C</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Challenge Progress</h3>
                    <p className="text-sm text-gray-600">
                      10K Steps Daily - 85% complete
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <span className="text-purple-600 font-bold">R</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Report Generated</h3>
                    <p className="text-sm text-gray-600">
                      Monthly Health Summary
                    </p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button
                className="h-24 flex flex-col justify-center items-center"
                onClick={() => router.push("/appointments/new")}
              >
                <span className="text-lg">📅</span>
                <span className="mt-2">Book Appointment</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center items-center"
                onClick={() => router.push("/challenges/new")}
              >
                <span className="text-lg">🏆</span>
                <span className="mt-2">Create Challenge</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center items-center"
              >
                <span className="text-lg">📊</span>
                <span className="mt-2">View Reports</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col justify-center items-center"
                onClick={() => router.push("/profile")}
              >
                <span className="text-lg">👤</span>
                <span className="mt-2">My Profile</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
