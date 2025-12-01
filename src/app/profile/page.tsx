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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getAssociatedProvider,
  deleteEmailFromUser,
  associateProviderWithUser,
  dissociateProviderFromUser,
  getFamilyGroups,
  addFamilyMember,
  getUserInfo,
} from "@/lib/api";
import { fetchUserEmails } from "./tools";
import { useLoadingManager } from "@/lib/loadingManager";
import { getErrorMessage } from "@/lib/apiErrorHandler";
import { useAuth } from "@/contexts/AuthContext";
import { AddProviderModal } from "@/components/AddProviderModal";
import { EditPhoneModal } from "@/components/EditPhoneModal";
import { AddEmailModal } from "@/components/AddEmailModal";
import { ProviderAvailabilityManager } from "@/components/ProviderAvailabilityManager";
import type { User, Email } from "@/types";

type Provider = {
  id: string;
  name: string;
  license_number: string;
  specialty: string;
  verified: boolean;
};

type Contact = {
  id: string;
  type: "email" | "phone";
  value: string;
  isVerified: boolean;
};

type FamilyMember = {
  id: number;
  name: string;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [userInfo, setUserInfo] = useState<User>({} as User);
  const [userEmails, setUserEmails] = useState<Email[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loadingStates, { isLoading, startLoading, stopLoading }] =
    useLoadingManager();
  const [error, setError] = useState<string | null>(null);
  const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
  const [isEditPhoneModalOpen, setIsEditPhoneModalOpen] = useState(false);
  const [isAddEmailModalOpen, setIsAddEmailModalOpen] = useState(false);

  // 重定向到登录页面如果未认证

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);
  const fetchUserInfo = async () => {
    try {
      startLoading("fetchProviders");
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      const userInfo = await getUserInfo(userId);
      setUserInfo(userInfo);
    } catch (err: any) {
      console.error("Failed to fetch user info:", err);
      setError(getErrorMessage(err) || "Failed to load user info");
    } finally {
      stopLoading("fetchProviders");
    }
  };
  // 获取医疗服务提供者列表
  const fetchProviders = async () => {
    try {
      startLoading("fetchProviders");
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      const data = await getAssociatedProvider(userId);
      // 转换数据格式以匹配前端组件
      const formattedProviders = data.map((provider: any) => ({
        id: provider.id.toString(),
        name: provider.name,
        license_number: provider.license_number,
        specialty: provider.specialty,
        verified: provider.verified,
      }));
      setProviders(formattedProviders);
    } catch (err: any) {
      console.error("Failed to fetch providers:", err);
      setError(getErrorMessage(err) || "Failed to load providers");
    } finally {
      stopLoading("fetchProviders");
    }
  };
  //获取用户邮箱

  useEffect(() => {
    fetchUserInfo();
    fetchProviders();
    fetchUserEmails(user?.id || 0, setUserEmails);
    console.log("User Emails:", userEmails);
  }, []);

  // 获取家庭群组成员
  useEffect(() => {
    const fetchFamilyGroup = async () => {
      try {
        startLoading("fetchFamilyGroup");
        // 获取所有家庭群组
        const data = await getFamilyGroups();
        // 假设使用第一个家庭群组，实际应用中应从用户数据中获取
        const familyGroup = data[0] || null;
        if (familyGroup) {
          // 转换数据格式以匹配前端组件
          // 这里需要根据实际API返回的数据结构进行调整
          const formattedMembers = [
            { id: 1, name: "John Doe (You)", role: "Group Owner" },
            { id: 2, name: "Jane Doe", role: "Spouse" },
            { id: 3, name: "Jimmy Doe", role: "Child" },
          ];
          setFamilyMembers(formattedMembers);
        }
      } catch (err: any) {
        console.error("Failed to fetch family group:", err);
        setError(getErrorMessage(err) || "Failed to load family group");
      } finally {
        stopLoading("fetchFamilyGroup");
      }
    };

    if (activeTab === "family" && isAuthenticated) {
      fetchFamilyGroup();
    }
  }, [activeTab, isAuthenticated]);

  // 关联医疗服务提供者与用户
  const handleAssociateProvider = async (providerId: string) => {
    try {
      startLoading(`associateProvider-${providerId}`);
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      await associateProviderWithUser(userId, parseInt(providerId));
      // 重新获取提供者列表以更新UI
      // 这里可以优化为只更新特定提供者的状态
      console.log(`Provider ${providerId} associated with user ${userId}`);
    } catch (err: any) {
      console.error("Failed to associate provider:", err);
      setError(getErrorMessage(err) || "Failed to associate provider");
    } finally {
      stopLoading(`associateProvider-${providerId}`);
    }
  };

  // 取消关联医疗服务提供者与用户
  const handleDissociateProvider = async (providerId: string) => {
    try {
      startLoading(`dissociateProvider-${providerId}`);
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      await dissociateProviderFromUser(userId, parseInt(providerId));
      // 重新获取提供者列表以更新UI
      await fetchProviders();
      console.log(`Provider ${providerId} dissociated from user ${userId}`);
      // 显示成功消息
      setError(null);
    } catch (err: any) {
      console.error("Failed to dissociate provider:", err);
      setError(getErrorMessage(err) || "Failed to dissociate provider");
    } finally {
      stopLoading(`dissociateProvider-${providerId}`);
    }
  };

  // 邀请家庭成员
  const handleInviteMember = async () => {
    if (!newMemberEmail) {
      setError("Please enter an email address");
      return;
    }

    try {
      startLoading("inviteMember");
      setError(null);
      // 使用认证上下文中的用户ID
      const userId = user?.id || 0;
      // 假设家庭群组ID为1，实际应用中应从用户数据中获取
      const familyGroupId = 1;
      // 注意：在实际应用中，应该通过邮箱查找用户ID
      // 这里为了演示目的，我们使用硬编码的ID
      const invitedUserId = 2;
      await addFamilyMember(familyGroupId, { userId: invitedUserId });

      // 更新家庭成员列表
      const newMember: FamilyMember = {
        id: Date.now(),
        name: newMemberEmail,
        role: "Member",
      };
      setFamilyMembers([...familyMembers, newMember]);

      // 重置输入
      setNewMemberEmail("");
    } catch (err: any) {
      console.error("Failed to invite member:", err);
      setError(getErrorMessage(err) || "Failed to invite member");
    } finally {
      stopLoading("inviteMember");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AddProviderModal
            isOpen={isAddProviderModalOpen}
            onClose={() => setIsAddProviderModalOpen(false)}
            onProviderAdded={fetchProviders}
          />
          <EditPhoneModal
            isOpen={isEditPhoneModalOpen}
            onClose={() => setIsEditPhoneModalOpen(false)}
            onSave={fetchUserInfo}
          />
          <AddEmailModal
            isOpen={isAddEmailModalOpen}
            onClose={() => setIsAddEmailModalOpen(false)}
            onSave={() => fetchUserEmails(user?.id || 0, setUserEmails)}
          />
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "profile" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  Personal Information
                </Button>
                <Button
                  variant={activeTab === "providers" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "providers" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}`}
                  onClick={() => setActiveTab("providers")}
                >
                  Healthcare Providers
                </Button>
                <Button
                  variant={activeTab === "contacts" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "contacts" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}`}
                  onClick={() => setActiveTab("contacts")}
                >
                  Contact Information
                </Button>
                <Button
                  variant={activeTab === "family" ? "default" : "ghost"}
                  className={`w-full justify-start ${activeTab === "family" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}`}
                  onClick={() => setActiveTab("family")}
                >
                  Family Group
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and health information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <Input id="name" defaultValue={userInfo.name} />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="healthId"
                          className="text-sm font-medium"
                        >
                          Health ID
                        </label>
                        <Input
                          id="healthId"
                          defaultValue={userInfo.health_id || ""}
                          disabled
                        />
                      </div>
                    </div>

                    {/*<div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue="Fitness enthusiast and health advocate"
                      />
                    </div>*/}

                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeTab === "providers" && (
              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Providers</CardTitle>
                  <CardDescription>
                    Manage your healthcare providers and set your primary care
                    physician
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading("fetchProviders") && <p>Loading providers...</p>}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      Error: {error}
                    </div>
                  )}
                  <div className="space-y-4">
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-gray-600">
                              {provider.specialty} • {provider.license_number}
                            </p>
                            <div className="flex items-center mt-1">
                              {provider.verified ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending Verification
                                </span>
                              )}
                              {/* Note: In a real application, you would track which provider is primary in the user data */}
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Primary Care Physician
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        Manage Availability
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDissociateProvider(provider.id)
                        }
                        disabled={isLoading(
                          `dissociateProvider-${provider.id}`,
                        )}
                      >
                        {isLoading(`dissociateProvider-${provider.id}`)
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          You haven't associated any healthcare providers yet.
                        </p>
                        <p className="text-gray-500 mt-2">
                          Click "Add New Provider" to get started.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button onClick={() => setIsAddProviderModalOpen(true)}>
                        Add New Provider
                      </Button>
                    </div>
                    
                    {selectedProvider && (
                      <div className="mt-6">
                        <ProviderAvailabilityManager 
                          provider={selectedProvider} 
                          onAvailabilityUpdate={() => {
                            // 可以在这里添加任何需要在更新可用性时执行的逻辑
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "contacts" && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Manage your contact details for appointment reminders and
                    notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Phone number</h3>
                        <p className="text-gray-600">{userInfo.phone_number}</p>
                        {userInfo.phone_verified ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                            Unverified
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditPhoneModalOpen(true);
                          }}
                        >
                          Modify
                        </Button>
                      </div>
                    </div>
                    {userEmails.map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-gray-600">{email.email_address}</p>
                          {email.verified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Unverified
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!email.verified && (
                            <Button variant="outline" size="sm">
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deleteEmailFromUser(
                                user?.id || 0,
                                email.email_address,
                              ).then(() => {
                                fetchUserEmails(user?.id || 0, setUserEmails);
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setIsAddEmailModalOpen(true);
                        }}
                      >
                        Add New Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "family" && (
              <Card>
                <CardHeader>
                  <CardTitle>Family Group</CardTitle>
                  <CardDescription>
                    Manage your family group and permissions for shared health
                    management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium">Family Group Members</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Manage who can access your health information
                      </p>

                      <div className="space-y-3">
                        {familyMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-600">
                                {member.role}
                              </p>
                            </div>
                            {member.role === "Group Owner" ? (
                              <Button variant="outline" size="sm" disabled>
                                Owner
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                Manage Access
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium">Invite Family Member</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter email address to invite a family member
                      </p>

                      {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mb-3">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email address"
                          className="flex-1"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                        <Button
                          onClick={handleInviteMember}
                          disabled={isLoading("inviteMember")}
                        >
                          {isLoading("inviteMember") ? "Inviting..." : "Invite"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
