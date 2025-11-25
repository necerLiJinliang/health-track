"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPhone } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getUserInfo } from "@/lib/api";
import type { User } from "@/types";

interface EditPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditPhoneModal({
  isOpen,
  onClose,
  onSave,
}: EditPhoneModalProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User>({} as User);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 获取当前用户信息
      if (user) {
        const fetchedUserInfo = await getUserInfo(user.id);
        setUserInfo(fetchedUserInfo);
      }

      setUserInfo({ ...userInfo, phone_number: phoneNumber });
      // 更新用户信息
      await updateUserPhone(user?.id, phoneNumber);
      // 重置表单
      setPhoneNumber("");

      // 通知父组件更新Provider列表
      onSave();

      // 关闭模态框
      onClose();

      // 显示成功消息（在实际应用中可能需要使用toast或其他通知机制）
      alert("Phone edited successfully!");
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error("Failed to edit phone number:", error);
        setError(
          error.message || "Failed to edit phone number. Please try again.",
        );
      } else {
        console.error("Failed to edit phone nubmer:", error);
        setError("Failed to edit phone number . Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Phone Number</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">Enter the new phone number.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1">
                New Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Editing..." : "Edit Phone Number"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
