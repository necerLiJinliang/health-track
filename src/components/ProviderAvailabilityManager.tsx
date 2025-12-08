"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProviderAvailability,
  getProviderAvailabilities,
  deleteProviderAvailability,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Provider, ProviderAvailability } from "@/types";

interface ProviderAvailabilityManagerProps {
  provider: Provider;
  onAvailabilityUpdate: () => void;
}

export function ProviderAvailabilityManager({
  provider,
  onAvailabilityUpdate,
}: ProviderAvailabilityManagerProps) {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [availabilities, setAvailabilities] = useState<ProviderAvailability[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Periodically purge expired availability slots by end_time
  useEffect(() => {
    const interval = setInterval(() => {
      setAvailabilities((prev) =>
        prev.filter((slot) => new Date(slot.end_time) > new Date()),
      );
    }, 60000); // run every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // 加载Provider的可用时间段
  useEffect(() => {
    loadAvailabilities();
  }, [provider.id]);

  const loadAvailabilities = async () => {
    try {
      setIsLoading(true);
      const data = await getProviderAvailabilities(provider.id);
      // Filter out expired slots where end_time is in the past
      setAvailabilities(
        data.filter(
          (slot: ProviderAvailability) => new Date(slot.end_time) > new Date(),
        ),
      );
    } catch (error: any) {
      console.error("Failed to load availabilities:", error);
      setError(error.message || "Failed to load availabilities");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 组合日期和时间
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // 验证时间格式
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }

      // 验证结束时间必须晚于开始时间
      if (endDateTime <= startDateTime) {
        throw new Error("End time must be later than start time");
      }

      // 创建新的可用时间段
      const newAvailability = {
        provider_id: provider.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_booked: false,
      };

      await createProviderAvailability(newAvailability);

      // 重置表单
      setDate("");
      setStartTime("");
      setEndTime("");

      // 重新加载可用时间段列表
      await loadAvailabilities();

      // 通知父组件更新
      onAvailabilityUpdate();

      // 显示成功消息
      alert("Availability slot added successfully!");
    } catch (error: any) {
      console.error("Failed to add availability:", error);
      setError(
        error.message || "Failed to add availability slot. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (availabilityId: number) => {
    if (
      !window.confirm("Are you sure you want to delete this availability slot?")
    ) {
      return;
    }

    setIsDeleting(availabilityId);
    setError(null);

    try {
      await deleteProviderAvailability(availabilityId);

      // 重新加载可用时间段列表
      await loadAvailabilities();

      // 通知父组件更新
      onAvailabilityUpdate();

      // 显示成功消息
      alert("Availability slot deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete availability:", error);
      setError(
        error.message ||
          "Failed to delete availability slot. Please try again.",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  // 格式化日期时间显示
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Availability Management</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* 添加新的可用时间段表单 */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Add New Availability Slot</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="date" className="block text-sm font-medium mb-1">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="start-time"
                className="block text-sm font-medium mb-1"
              >
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label
                htmlFor="end-time"
                className="block text-sm font-medium mb-1"
              >
                End Time
              </Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Availability"}
            </Button>
          </div>
        </form>
      </div>

      {/* 现有的可用时间段列表 */}
      <div>
        <h4 className="font-medium mb-3">Existing Availability Slots</h4>

        {isLoading ? (
          <p>Loading availability slots...</p>
        ) : availabilities.length === 0 ? (
          <p className="text-gray-500">
            No availability slots have been added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {availabilities
              .filter(
                (availability) => new Date(availability.end_time) > new Date(),
              )
              .map((availability) => (
                <div
                  key={availability.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    availability.is_booked ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {formatDateTime(availability.start_time)} -{" "}
                      {formatDateTime(availability.end_time)}
                    </p>
                    {availability.is_booked && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Booked
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(availability.id)}
                    disabled={
                      isDeleting === availability.id || availability.is_booked
                    }
                  >
                    {isDeleting === availability.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
