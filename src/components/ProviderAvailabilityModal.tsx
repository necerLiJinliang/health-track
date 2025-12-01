"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Provider, ProviderAvailability } from "@/types";
import { ProviderAvailabilityManager } from "./ProviderAvailabilityManager";

interface ProviderAvailabilityModalProps {
  provider: Provider;
  onAvailabilityUpdate: () => void;
  children: React.ReactNode;
}

export function ProviderAvailabilityModal({
  provider,
  onAvailabilityUpdate,
  children,
}: ProviderAvailabilityModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // 如果关闭模态框，触发更新回调
    if (!open) {
      onAvailabilityUpdate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Availability for {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ProviderAvailabilityManager 
            provider={provider} 
            onAvailabilityUpdate={() => {
              // 更新完成后保持模态框打开，用户可以继续操作
              onAvailabilityUpdate();
            }} 
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}