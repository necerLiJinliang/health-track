"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFamilyGroups,
  createFamilyGroup,
  addFamilyMember,
  getFamilyMembers,
} from "@/lib/api";
import { FamilyGroup, FamilyMember } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface GroupMembersState {
  [groupId: number]: {
    loading: boolean;
    members: FamilyMember[];
    error: string | null;
  };
}

export default function FamilyGroupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
    () => new Set(),
  );
  const [groupMembers, setGroupMembers] = useState<GroupMembersState>({});

  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);

  const [inviteEmailByGroup, setInviteEmailByGroup] = useState<
    Record<number, string>
  >({});
  const [inviteRoleByGroup, setInviteRoleByGroup] = useState<
    Record<number, string>
  >({});
  const [inviteErrorByGroup, setInviteErrorByGroup] = useState<
    Record<number, string | null>
  >({});
  const [invitingGroupIds, setInvitingGroupIds] = useState<Set<number>>(
    () => new Set(),
  );

  const [memberActionLoading, setMemberActionLoading] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const fetchGroups = useCallback(async () => {
    if (!user?.id) return;
    setLoadingGroups(true);
    setGroupsError(null);
    try {
      const groups = await getFamilyGroups(user.id);
      setFamilyGroups(groups);
    } catch (e: any) {
      setGroupsError(e.message || "Failed to load family groups.");
    } finally {
      setLoadingGroups(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const toggleExpandGroup = (groupId: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
        if (!groupMembers[groupId]) {
          fetchGroupMembers(groupId);
        }
      }
      return next;
    });
  };

  const updateGroupMembersState = (
    groupId: number,
    patch: Partial<GroupMembersState[number]>,
  ) => {
    setGroupMembers((prev) => ({
      ...prev,
      [groupId]: {
        loading: prev[groupId]?.loading ?? false,
        members: prev[groupId]?.members ?? [],
        error: prev[groupId]?.error ?? null,
        ...patch,
      },
    }));
  };

  const fetchGroupMembers = async (groupId: number) => {
    updateGroupMembersState(groupId, { loading: true, error: null });
    try {
      const members = await getFamilyMembers(groupId);
      updateGroupMembersState(groupId, { loading: false, members });
    } catch (e: any) {
      updateGroupMembersState(groupId, {
        loading: false,
        error: e.message || "Failed to load members",
      });
    }
  };

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setCreateGroupError("Group name is required");
      return;
    }
    setCreatingGroup(true);
    setCreateGroupError(null);
    try {
      const created = await createFamilyGroup({ name: newGroupName.trim() });
      setFamilyGroups((prev) => [created, ...prev]);
      setNewGroupName("");
      setShowCreateGroupForm(false);
    } catch (e: any) {
      setCreateGroupError(e.message || "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const resolveUserByEmail = async (email: string): Promise<number> => {
    const token = localStorage.getItem("auth_token");
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!resp.ok) throw new Error("User not found for given email");
    const data = await resp.json();
    return data.id;
  };

  const handleInviteMember = async (groupId: number, e: FormEvent) => {
    e.preventDefault();
    const email = inviteEmailByGroup[groupId]?.trim();
    const role = inviteRoleByGroup[groupId] || "member";
    if (!email) {
      setInviteErrorByGroup((prev) => ({
        ...prev,
        [groupId]: "Email is required",
      }));
      return;
    }
    setInvitingGroupIds((prev) => new Set(prev).add(groupId));
    setInviteErrorByGroup((prev) => ({ ...prev, [groupId]: null }));
    try {
      const invitedUserId = await resolveUserByEmail(email);
      await addFamilyMember(groupId, { user_id: invitedUserId, role });
      await fetchGroupMembers(groupId);
      setInviteEmailByGroup((prev) => ({ ...prev, [groupId]: "" }));
      setInviteRoleByGroup((prev) => ({ ...prev, [groupId]: "member" }));
    } catch (e: any) {
      setInviteErrorByGroup((prev) => ({
        ...prev,
        [groupId]: e.message || "Failed to invite member",
      }));
    } finally {
      setInvitingGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
    }
  };

  const removeFamilyMember = async (
    groupId: number,
    memberId: number,
    userId: number,
  ) => {
    setMemberActionLoading((prev) => ({ ...prev, [memberId]: true }));
    try {
      const token = localStorage.getItem("auth_token");
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/family_groups/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        },
      );
      if (!resp.ok) throw new Error("Failed to remove member");
      await fetchGroupMembers(groupId);
    } catch (e: any) {
      updateGroupMembersState(groupId, {
        error: e.message || "Failed to remove member",
      });
    } finally {
      setMemberActionLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const changeMemberRole = async (
    groupId: number,
    member: FamilyMember,
    newRole: string,
  ) => {
    setMemberActionLoading((prev) => ({ ...prev, [member.id]: true }));
    try {
      const token = localStorage.getItem("auth_token");
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/family_groups/${groupId}/members/${member.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );
      if (!resp.ok) throw new Error("Failed to update role");
      await fetchGroupMembers(groupId);
    } catch (e: any) {
      updateGroupMembersState(groupId, {
        error: e.message || "Failed to update role",
      });
    } finally {
      setMemberActionLoading((prev) => ({ ...prev, [member.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Family Groups Management
          </h1>
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
            <h2 className="text-xl font-semibold">Your Family Groups</h2>
            <p className="text-sm text-gray-600">
              Create and manage family groups, invite members, assign roles.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateGroupForm((v) => !v)}
            variant={showCreateGroupForm ? "secondary" : "default"}
          >
            {showCreateGroupForm ? "Hide Form" : "New Group"}
          </Button>
        </div>

        {showCreateGroupForm && (
          <form
            onSubmit={handleCreateGroup}
            className="mb-8 bg-white p-6 border rounded shadow-sm space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Li Family"
              />
            </div>
            {createGroupError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded">
                {createGroupError}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateGroupForm(false);
                  setNewGroupName("");
                  setCreateGroupError(null);
                }}
                disabled={creatingGroup}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingGroup}>
                {creatingGroup ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        )}

        {groupsError && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
            {groupsError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingGroups && familyGroups.length === 0
            ? Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-28 bg-gray-100 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : familyGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const memberState = groupMembers[group.id];
                const inviteEmail = inviteEmailByGroup[group.id] || "";
                const inviteRole = inviteRoleByGroup[group.id] || "member";
                const inviting = invitingGroupIds.has(group.id);
                const inviteError = inviteErrorByGroup[group.id];

                return (
                  <Card
                    key={group.id}
                    className={cn(
                      "border-blue-100 shadow transition-all",
                      isExpanded ? "ring-2 ring-blue-300" : "",
                    )}
                  >
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleExpandGroup(group.id)}
                    >
                      <CardTitle className="flex justify-between items-start">
                        <span className="text-blue-700">{group.name}</span>
                        <span className="text-xs font-medium text-blue-500">
                          {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        {group.members?.length || 0} members
                      </CardDescription>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-4">
                        <form
                          onSubmit={(e) => handleInviteMember(group.id, e)}
                          className="border rounded p-3 space-y-3 bg-slate-50"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              Invite Member
                            </span>
                            <Button size="sm" type="submit" disabled={inviting}>
                              {inviting ? "Inviting..." : "Send Invite"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`email-${group.id}`}>Email</Label>
                              <Input
                                id={`email-${group.id}`}
                                type="email"
                                value={inviteEmail}
                                onChange={(e) =>
                                  setInviteEmailByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: e.target.value,
                                  }))
                                }
                                placeholder="name@example.com"
                                disabled={inviting}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`role-${group.id}`}>Role</Label>
                              <select
                                id={`role-${group.id}`}
                                className="w-full border rounded px-2 py-2 text-sm"
                                value={inviteRole}
                                disabled={inviting}
                                onChange={(e) =>
                                  setInviteRoleByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="member">Member</option>
                                <option value="caregiver">Caregiver</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label>Actions</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setInviteEmailByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: "",
                                  }));
                                  setInviteRoleByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: "member",
                                  }));
                                  setInviteErrorByGroup((prev) => ({
                                    ...prev,
                                    [group.id]: null,
                                  }));
                                }}
                                disabled={inviting}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                          {inviteError && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded">
                              {inviteError}
                            </div>
                          )}
                        </form>

                        <Separator className="my-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Members
                          </span>
                          <span className="text-xs text-gray-500">
                            {
                              (memberState?.members || group.members || [])
                                .length
                            }{" "}
                            total
                          </span>
                        </div>

                        {memberState?.error && (
                          <div className="text-xs text-red-600 border border-red-100 bg-red-50 p-2 rounded">
                            {memberState.error}
                          </div>
                        )}
                        {memberState?.loading &&
                          !memberState.members?.length && (
                            <div className="text-sm text-gray-500">
                              Loading members...
                            </div>
                          )}

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {(memberState?.members || group.members || []).map(
                            (member) => {
                              const pendingAction =
                                memberActionLoading[member.id];
                              return (
                                <div
                                  key={member.id}
                                  className="border rounded p-2 flex justify-between items-center bg-white"
                                >
                                  <div>
                                    <div className="text-sm font-medium">
                                      User #{member.user_id}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Role: {member.role} • Joined{" "}
                                      {new Date(
                                        member.joined_at,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                    <select
                                      disabled={pendingAction}
                                      className="text-xs border rounded px-1 py-0.5"
                                      value={member.role}
                                      onChange={(e) =>
                                        changeMemberRole(
                                          group.id,
                                          member,
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="member">Member</option>
                                      <option value="caregiver">
                                        Caregiver
                                      </option>
                                      <option value="admin">Admin</option>
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={pendingAction}
                                      onClick={() =>
                                        removeFamilyMember(
                                          group.id,
                                          member.id,
                                          member.user_id,
                                        )
                                      }
                                    >
                                      {pendingAction ? "..." : "✕"}
                                    </Button>
                                  </div>
                                </div>
                              );
                            },
                          )}
                          {!memberState?.loading &&
                            (memberState?.members || group.members || [])
                              .length === 0 && (
                              <div className="text-xs text-gray-500">
                                No members yet. Invite someone!
                              </div>
                            )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
        </div>

        {familyGroups.length === 0 && !loadingGroups && !groupsError && (
          <div className="mt-8 p-6 bg-white border rounded shadow-sm text-center">
            <p className="text-gray-600 text-sm mb-4">
              You have no family groups yet.
            </p>
            <Button onClick={() => setShowCreateGroupForm(true)}>
              Create First Group
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
