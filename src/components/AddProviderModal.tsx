"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProvider } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { associateProviderWithUser } from "@/lib/api";

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderAdded: () => void;
}

export function AddProviderModal({
  isOpen,
  onClose,
  onProviderAdded,
}: AddProviderModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 创建新的Provider
      const newProvider = {
        name,
        license_number: licenseNumber,
        specialty: specialty || undefined, // 如果specialty为空则设为undefined
        verified: true, // 默认未验证
      };

      const createdProvider = await createProvider(newProvider);

      // 将新创建的Provider与当前用户关联
      if (user) {
        await associateProviderWithUser(user.id, createdProvider.id);
      }

      // 重置表单
      setName("");
      setLicenseNumber("");
      setSpecialty("");

      // 通知父组件更新Provider列表
      onProviderAdded();

      // 关闭模态框
      onClose();

      // 显示成功消息（在实际应用中可能需要使用toast或其他通知机制）
      alert("Provider added and associated successfully!");
    } catch (error: any) {
      console.error("Failed to add provider:", error);
      setError(error.message || "Failed to add provider. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Healthcare Provider</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Enter the details of the healthcare provider you want to add.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="license" className="block text-sm font-medium mb-1">
                License #
              </Label>
              <Input
                id="license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="specialty" className="block text-sm font-medium mb-1">
                Specialty
              </Label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Provider"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}