import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (payload: {
    challengeId?: number;
    method: "email" | "phone";
    value: string;
  }) => Promise<void> | void;
  challengeId?: number;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  challengeId,
}: InviteUserModalProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Supports local and international formats (basic). You may replace with libphonenumber in the future.
  const phoneRegex =
    /^(?:\+?\d{1,3}[- ]?)?(?:\(?\d{2,4}\)?[- ]?)?\d{3,4}[- ]?\d{3,4}$/;

  const validate = () => {
    if (method === "email") {
      const v = email.trim();
      if (!v) return "Email is required.";
      if (!emailRegex.test(v)) return "Please enter a valid email address.";
      return null;
    } else {
      const v = phone.trim();
      if (!v) return "Phone number is required.";
      if (!phoneRegex.test(v))
        return "Please enter a valid phone number (you can include country code).";
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const value = method === "email" ? email.trim() : phone.trim();

    try {
      setIsLoading(true);
      if (onInvite) {
        await onInvite({ challengeId, method, value });
      }
      setSuccess(
        method === "email"
          ? `Invitation sent to ${value}.`
          : `Invitation SMS sent to ${value}.`,
      );
    } catch (err: any) {
      setError(err?.message || "Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invite User to Challenge</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Send an invitation via email or phone number to join the challenge
          {typeof challengeId === "number" ? ` #${challengeId}` : ""}.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex-1 ${
                  method === "email"
                    ? "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Invite via Email
              </Button>
              <Button
                type="button"
                onClick={() => setMethod("phone")}
                className={`flex-1 ${
                  method === "phone"
                    ? "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Invite via Phone
              </Button>
            </div>

            {method === "email" ? (
              <div>
                <Label
                  htmlFor="invite-email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <Label
                  htmlFor="invite-phone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number
                </Label>
                <Input
                  id="invite-phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can include country/area code. SMS invite will be sent.
                </p>
              </div>
            )}

            <div>
              <Label
                htmlFor="invite-note"
                className="block text-sm font-medium mb-1"
              >
                Message (optional)
              </Label>
              <Input
                id="invite-note"
                placeholder="Add a short note to the invite"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
