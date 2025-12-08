"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  getChallenges,
} from "@/lib/api";
import { useLoadingManager } from "@/lib/loadingManager";
import { getErrorMessage } from "@/lib/apiErrorHandler";

interface Invitation {
  id: number;
  sender_id: number;
  recipient_email: string | null;
  recipient_phone: string | null;
  invitation_type: string;
  challenge_id: number | null;
  family_group_id: number | null;
  sent_at: string;
  accepted_at: string | null;
  expired_at: string | null;
  is_accepted: boolean;
  is_expired: boolean;
  is_rejected: boolean;
  rejected_at: string | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, { startLoading, stopLoading, isLoading }] =
    useLoadingManager();
  const [challengeDetails, setChallengeDetails] = useState<
    Record<number, { goal: string; start_date: string; end_date: string }>
  >({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const fetchInvitations = async () => {
    if (!user?.id) return;

    try {
      startLoading("fetchInvitations");
      setError(null);
      const data = await getInvitations(user.id);
      setInvitations(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to fetch invitations");
    } finally {
      stopLoading("fetchInvitations");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchInvitations();
      (async () => {
        try {
          startLoading("fetchChallengesForMessages");
          const challenges = await getChallenges();
          const map: Record<
            number,
            { goal: string; start_date: string; end_date: string }
          > = {};
          for (const ch of challenges) {
            if (typeof ch.id === "number") {
              map[ch.id] = {
                goal: ch.goal,
                start_date: ch.start_date,
                end_date: ch.end_date,
              };
            }
          }
          setChallengeDetails(map);
        } catch (err: unknown) {
          // Non-blocking: we keep messages working even if challenge details fail
          console.error("Failed to fetch challenge details for messages:", err);
        } finally {
          stopLoading("fetchChallengesForMessages");
        }
      })();
    }
  }, [isAuthenticated, user?.id]);

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      startLoading(`acceptInvitation-${invitationId}`);
      setError(null);
      await acceptInvitation(invitationId);
      await fetchInvitations();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to accept invitation");
    } finally {
      stopLoading(`acceptInvitation-${invitationId}`);
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    try {
      startLoading(`rejectInvitation-${invitationId}`);
      setError(null);
      await rejectInvitation(invitationId);
      await fetchInvitations();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to reject invitation");
    } finally {
      stopLoading(`rejectInvitation-${invitationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Invitations</h2>
            <p className="text-sm text-gray-600">
              Manage your family group and challenge invitations
            </p>
          </div>
          <Button
            onClick={fetchInvitations}
            disabled={isLoading("fetchInvitations")}
          >
            {isLoading("fetchInvitations") ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading("fetchInvitations") ? (
          <div className="text-center py-8">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending invitations
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invitations.map((invitation) => {
              const isPending =
                !invitation.is_accepted &&
                !invitation.is_rejected &&
                !invitation.is_expired;
              const statusLabel = invitation.is_accepted
                ? "Accepted"
                : invitation.is_rejected
                  ? "Rejected"
                  : invitation.is_expired
                    ? "Expired"
                    : "Pending";
              const statusClass = invitation.is_accepted
                ? "bg-green-100 text-green-800"
                : invitation.is_rejected
                  ? "bg-red-100 text-red-800"
                  : invitation.is_expired
                    ? "bg-gray-200 text-gray-700"
                    : "bg-yellow-100 text-yellow-800";
              const methodLabel = invitation.recipient_email
                ? `Email: ${invitation.recipient_email}`
                : invitation.recipient_phone
                  ? `Phone: ${invitation.recipient_phone}`
                  : "Unknown method";

              return (
                <Card key={invitation.id} className="border-blue-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">
                      {invitation.invitation_type === "family_group"
                        ? "Family Group Invitation"
                        : "Challenge Invitation"}
                    </CardTitle>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Sender:</strong> User #{invitation.sender_id}
                      </div>
                      <div className="text-sm">
                        <strong>Method:</strong> {methodLabel}
                      </div>
                      <div className="text-sm">
                        <strong>Type:</strong>{" "}
                        {invitation.invitation_type === "family_group"
                          ? "Family Group"
                          : "Challenge"}
                      </div>
                      {invitation.challenge_id && (
                        <>
                          <div className="text-sm">
                            <strong>Challenge ID:</strong>{" "}
                            {invitation.challenge_id}
                          </div>
                          {challengeDetails[invitation.challenge_id] && (
                            <div className="text-sm space-y-1">
                              <div>
                                <strong>Goal:</strong>{" "}
                                {challengeDetails[invitation.challenge_id].goal}
                              </div>
                              <div>
                                <strong>Start:</strong>{" "}
                                {
                                  challengeDetails[invitation.challenge_id]
                                    .start_date
                                }
                              </div>
                              <div>
                                <strong>End:</strong>{" "}
                                {
                                  challengeDetails[invitation.challenge_id]
                                    .end_date
                                }
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="text-sm">
                        <strong>Sent:</strong>{" "}
                        {new Date(invitation.sent_at).toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <strong>Expires:</strong>{" "}
                        {invitation.expired_at
                          ? new Date(invitation.expired_at).toLocaleString()
                          : "N/A"}
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          onClick={() => handleAcceptInvitation(invitation.id)}
                          disabled={
                            !isPending ||
                            isLoading(`acceptInvitation-${invitation.id}`) ||
                            isLoading(`rejectInvitation-${invitation.id}`)
                          }
                        >
                          {isLoading(`acceptInvitation-${invitation.id}`)
                            ? "Accepting..."
                            : "Accept"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectInvitation(invitation.id)}
                          disabled={
                            !isPending ||
                            isLoading(`acceptInvitation-${invitation.id}`) ||
                            isLoading(`rejectInvitation-${invitation.id}`)
                          }
                        >
                          {isLoading(`rejectInvitation-${invitation.id}`)
                            ? "Rejecting..."
                            : "Reject"}
                        </Button>
                      </div>

                      {!isPending && (
                        <div className="text-xs text-gray-600">
                          This invitation is {statusLabel.toLowerCase()}.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
