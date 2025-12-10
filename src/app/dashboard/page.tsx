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
import { getUserAppointments, getChallenges, getUserInfo } from "@/lib/api";
import { Appointment } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

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

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const challengesData = await getChallenges(user?.id || 0);
        const creator_id: number[] = [];
        challengesData.forEach((challenge: any) => {
          if (!creator_id.includes(challenge.creator_id)) {
            creator_id.push(challenge.creator_id);
          }
        });
        const creator_names: string[] = [];
        for (let i = 0; i < creator_id.length; i++) {
          const userData = await getUserInfo(creator_id[i]);
          creator_names.push(userData.name || "Unknown");
        }

        // 转换数据格式以匹配前端需求
        const formattedChallenges = challengesData.map(
          (challenge: any, idx: number) => ({
            ...challenge,
            id: challenge.id,
            title: challenge.title || "Untitled Challenge",
            creator: "You", // 这里应该从后端获取创建者信息
            creator_id: challenge.creator_id,
            creator_name: creator_names[idx],
            goal: challenge.goal || "No goal specified",
            startDate: new Date(challenge.start_date).toLocaleDateString(),
            endDate: new Date(challenge.end_date).toLocaleDateString(),
            participants: challenge.participants?.length || 1,
            progress: challenge.progress, // 临时随机进度，实际应该从后端获取
            status: "active", // 临时状态，实际应该根据日期计算
          }),
        );
        setChallenges(formattedChallenges || []);
      } catch (e) {
        // silently ignore for dashboard
        console.error("Failed to fetch challenges", e);
      }
    };
    if (isAuthenticated) {
      fetchChallenges();
    }
  }, [isAuthenticated]);

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
                {(() => {
                  const now = new Date();
                  const sevenDaysLater = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 7,
                  );

                  const normalizeDate = (a: any) => {
                    const raw = a?.date_time ?? a?.dateTime;
                    return raw ? new Date(raw) : null;
                  };

                  const upcoming = appointments
                    .filter((a: any) => !a?.cancelled)
                    .map((a: any) => ({ ...a, _dt: normalizeDate(a) }))
                    .filter(
                      (a: any) =>
                        a._dt && a._dt >= now && a._dt <= sevenDaysLater,
                    )
                    .sort((a: any, b: any) => a._dt.getTime() - b._dt.getTime())
                    .slice(0, 5);

                  if (upcoming.length === 0) {
                    return (
                      <div className="text-gray-500 text-sm">
                        No upcoming appointments.
                      </div>
                    );
                  }

                  return upcoming.map((appointment: any, idx: number) => {
                    const dt: Date = appointment._dt;
                    const providerName =
                      appointment?.provider_name ||
                      appointment?.provider?.name ||
                      "Provider";
                    const type =
                      appointment?.consultation_type ||
                      appointment?.type ||
                      "Consultation";

                    return (
                      <div
                        key={idx}
                        className={`border-l-4 ${
                          idx % 2 === 0 ? "border-blue-500" : "border-green-500"
                        } pl-4 py-1`}
                      >
                        <h3 className="font-medium">{providerName}</h3>
                        <p className="text-sm text-gray-600">{type}</p>
                        <p className="text-sm">
                          {dt.toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    );
                  });
                })()}
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
                {(() => {
                  const now = new Date();
                  const active = (challenges || [])
                    // .filter((c: any) => {
                    //   const start = new Date(c.start_date);
                    //   const end = new Date(c.end_date);
                    //   return start <= now && end >= now;
                    // })
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.end_date).getTime() -
                        new Date(b.end_date).getTime(),
                    )
                    .slice(0, 5);

                  if (active.length === 0) {
                    return (
                      <div className="text-gray-500 text-sm">
                        No active challenges.
                      </div>
                    );
                  }

                  return active.map((c: any, idx: number) => {
                    const end = new Date(c.end_date);
                    const msRemaining = end.getTime() - now.getTime();
                    const daysRemaining = Math.max(
                      0,
                      Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
                    );
                    const borderColors = [
                      "border-green-500",
                      "border-purple-500",
                      "border-blue-500",
                    ];
                    const color = borderColors[idx % borderColors.length];

                    return (
                      <div
                        className={`border-l-4 ${color} pl-4 py-1`}
                        key={c.id}
                      >
                        <h3 className="font-medium">
                          {c.title} {c.goal}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {`Start: ${new Date(c.start_date).toLocaleDateString()} • End: ${new Date(
                            c.end_date,
                          ).toLocaleDateString()}`}
                        </p>
                        <p className="text-sm">
                          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                          remaining
                        </p>
                      </div>
                    );
                  });
                })()}
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

        <Card className="border-gray-200 shadow mb-8">
          <CardHeader>
            <CardTitle className="text-gray-800">Summary</CardTitle>
            <CardDescription>
              Overview of appointments, metrics, and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Date range: last 30 days
              const now = new Date();
              const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

              // Appointments count within date range for current user
              const apptInRangeCount = (appointments || []).filter((a: any) => {
                const dtRaw = a?.date_time ?? a?.dateTime;
                if (!dtRaw) return false;
                const dt = new Date(dtRaw);
                return !a?.cancelled && dt >= from && dt <= now;
              }).length;

              // Monthly health metric stats placeholders (no metrics data available here)
              const metricStats = {
                weight: { avg: "N/A", min: "N/A", max: "N/A" },
                bloodPressure: { avg: "N/A", min: "N/A", max: "N/A" },
              };

              // Most participated challenge (by participants count)
              const mostParticipatedChallenge = (challenges || []).reduce(
                (best: any, c: any) => {
                  const count = Array.isArray(c?.participants)
                    ? c.participants.length
                    : typeof c?.participants === "number"
                      ? c.participants
                      : 0;
                  if (!best || count > best.count) {
                    return { id: c?.id, goal: c?.goal, title: c?.title, count };
                  }
                  return best;
                },
                null as null | { id: number; goal: string; count: number },
              );

              // Most active user placeholder (no cross-user activity data available in this view)
              const mostActiveUser = { name: "N/A", detail: "Not available" };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Appointments (Last 30 days)
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total appointments:{" "}
                      <span className="font-medium">{apptInRangeCount}</span>
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Monthly Health Metrics
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Weight:</span> avg{" "}
                        {metricStats.weight.avg}, min {metricStats.weight.min},
                        max {metricStats.weight.max}
                      </div>
                      <div>
                        <span className="font-medium">Blood Pressure:</span> avg{" "}
                        {metricStats.bloodPressure.avg}, min{" "}
                        {metricStats.bloodPressure.min}, max{" "}
                        {metricStats.bloodPressure.max}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Most Participated Challenge
                    </h4>
                    {mostParticipatedChallenge ? (
                      <div className="text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Title:</span>{" "}
                          {mostParticipatedChallenge.title || "Untitled"}
                        </div>
                        <div>
                          <span className="font-medium">Goal:</span>{" "}
                          {mostParticipatedChallenge.goal || "Untitled"}
                        </div>
                        <div>
                          <span className="font-medium">Participants:</span>{" "}
                          {mostParticipatedChallenge.count}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No challenge data available.
                      </p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Most Active User</h4>
                    <div className="text-sm text-gray-600">
                      <div>
                        <span className="font-medium">User:</span>{" "}
                        {mostActiveUser.name}
                      </div>
                      <div>
                        <span className="font-medium">Detail:</span>{" "}
                        {mostActiveUser.detail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>

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
