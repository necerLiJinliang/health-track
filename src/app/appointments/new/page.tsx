"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createAppointment,
  getAvailableProviderSlots
} from "@/lib/api";
import { useLoadingManager } from "@/lib/loadingManager";
import { getErrorMessage } from "@/lib/apiErrorHandler";
import { ProviderAvailability } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    providerLicense: "",
    providerEmail: "",
    date: "",
    time: "",
    type: "in-person",
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState<ProviderAvailability[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, { startLoading, stopLoading, isLoading }] = useLoadingManager()

  // 处理从URL传入的时间段ID参数
  useEffect(() => {
    const slotId = searchParams.get('slotId');
    if (slotId) {
      // 如果有slotId参数，可以在这里处理预选时间段的逻辑
      // 例如：设置selectedSlot状态或获取时间段详情
      console.log("Pre-selected slot ID:", slotId);
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const fetchAvailableSlots = async (providerId: number) => {
    try {
      startLoading("fetchSlots");
      const slots = await getAvailableProviderSlots(providerId);
      setAvailableSlots(slots);
      setShowAvailableSlots(true);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch available slots:", err);
      setError(getErrorMessage(err) || "Failed to fetch available slots");
    } finally {
      stopLoading("fetchSlots");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查用户是否已登录
    if (!user) {
      setError("You must be logged in to create an appointment");
      return;
    }

    // 验证表单数据
    if (!formData.providerLicense) {
      setError("Please enter provider license number");
      return;
    }

    // 如果选择了可用时间段，则使用该时间段的数据
    let providerId = parseInt(formData.providerLicense);
    let appointmentDateTime: string;

    if (selectedSlot !== null) {
      // 使用选中的可用时间段
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) {
        setError("Selected slot is invalid");
        return;
      }
      providerId = slot.provider_id;
      appointmentDateTime = slot.start_time;
    } else {
      // 使用手动输入的时间
      if (!formData.date || !formData.time) {
        setError("Please fill in date and time or select from available slots");
        return;
      }
      appointmentDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    }

    try {
      startLoading("createAppointment");
      setError(null);

      // 构造预约数据
      const appointmentData = {
        appointment_id: `APT-${Date.now()}`, // 生成唯一的预约ID
        provider_id: providerId,
        date_time: appointmentDateTime,
        consultation_type: formData.type,
        notes: formData.notes || null,
      };

      // 使用认证上下文中的用户ID
      const userId = user.id;

      // 调用API创建预约
      await createAppointment(appointmentData, userId);

      // 重定向到预约列表页面
      router.push("/appointments");
    } catch (err: unknown) {
      console.error("Failed to create appointment:", err);
      setError(getErrorMessage(err));
    } finally {
      stopLoading("createAppointment");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Book New Appointment
            </h1>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Appointment</CardTitle>
            <CardDescription>
              Fill in the details below to book a new appointment with your
              healthcare provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                Error: {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Provider Information</h3>

                <div className="space-y-2">
                  <label
                    htmlFor="providerLicense"
                    className="text-sm font-medium"
                  >
                    Provider License Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="providerLicense"
                      placeholder="Enter provider license number"
                      value={formData.providerLicense}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const providerId = parseInt(formData.providerLicense);
                        if (!isNaN(providerId)) {
                          fetchAvailableSlots(providerId);
                        } else {
                          setError("Please enter a valid provider license number");
                        }
                      }}
                      disabled={isLoading("fetchSlots") || !formData.providerLicense}
                    >
                      {isLoading("fetchSlots") ? "Loading..." : "Show Available Slots"}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="providerEmail"
                    className="text-sm font-medium"
                  >
                    Provider Verified Email
                  </label>
                  <Input
                    id="providerEmail"
                    type="email"
                    placeholder="provider@example.com"
                    value={formData.providerEmail}
                    onChange={handleChange}
                  />
                </div>

                {/* 可用时间段选择 */}
                {showAvailableSlots && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Available Time Slots</h4>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`p-3 border rounded-md cursor-pointer ${selectedSlot === slot.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-blue-300"
                              }`}
                            onClick={() => setSelectedSlot(slot.id)}
                          >
                            <div className="font-medium">
                              {new Date(slot.start_time).toLocaleDateString()} - {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No available slots found for this provider.</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setShowAvailableSlots(false);
                        setSelectedSlot(null);
                      }}
                    >
                      Hide Available Slots
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appointment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">
                      Date
                    </label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium">
                      Time
                    </label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Consultation Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="virtual">Virtual/Online</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Describe symptoms or reason for visit..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading("createAppointment")}>
                  {isLoading("createAppointment")
                    ? "Booking..."
                    : "Book Appointment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
