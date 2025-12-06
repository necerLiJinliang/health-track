"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createChallenge,
  getFamilyGroups,
  addChallengeParticipant,
  createInvitation,
} from "@/lib/api";
import { useLoadingManager } from "@/lib/loadingManager";
import { getErrorMessage } from "@/lib/apiErrorHandler";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function NewChallengePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState("");
  const [emailParticipants, setEmailParticipants] = useState("");
  const [phoneParticipants, setPhoneParticipants] = useState("");
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<string>("");
  const [selectedGroupParticipants, setSelectedGroupParticipants] = useState<
    number[]
  >([]);
  const [groupParticipants, setGroupParticipants] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, { startLoading, stopLoading, isLoading }] =
    useLoadingManager();

  // 获取用户的家庭组
  useEffect(() => {
    const fetchFamilyGroups = async () => {
      if (!user?.id) return;

      try {
        startLoading("fetchFamilyGroups");
        const groups = await getFamilyGroups(user.id);
        setFamilyGroups(groups);
      } catch (err) {
        console.error("Failed to fetch family groups:", err);
      } finally {
        stopLoading("fetchFamilyGroups");
      }
    };

    fetchFamilyGroups();
  }, [user?.id, startLoading, stopLoading]);

  // 处理家庭组选择变化
  const handleFamilyGroupChange = (value: string) => {
    setSelectedFamilyGroup(value);

    // 获取所选家庭组的成员
    const selectedGroup = familyGroups.find(
      (group) => group.id === parseInt(value),
    );
    if (selectedGroup) {
      setGroupParticipants(selectedGroup.members);
      setSelectedGroupParticipants([]); // 重置选中的成员
    } else {
      setGroupParticipants([]);
      setSelectedGroupParticipants([]);
    }
  };

  // 处理成员选择变化
  const handleMemberSelect = (userId: number) => {
    setSelectedGroupParticipants((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查用户是否已登录
    if (!user) {
      setError("You must be logged in to create a challenge");
      return;
    }

    // 基本验证
    if (!title || !startDate || !endDate || !goal) {
      setError("Please fill in all required fields");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      startLoading("createChallenge");
      setError(null);

      // 构造挑战数据
      const challengeData = {
        challenge_id: `CH-${Date.now()}`, // 临时ID，实际应由后端生成
        goal: goal,
        start_date: startDate,
        end_date: endDate,
      };

      // 调用API创建挑战，使用认证上下文中的用户ID
      console.log(
        "Creating challenge with data:",
        challengeData,
        "by user:",
        user.id,
      );
      const newChallenge = await createChallenge(challengeData, user.id);

      console.log("Challenge created:", newChallenge);

      // 邀请家庭组成员参与挑战
      if (selectedGroupParticipants.length > 0) {
        for (const userId of selectedGroupParticipants) {
          try {
            await addChallengeParticipant(newChallenge.id, userId);
          } catch (err) {
            console.error(`Failed to add participant ${userId}:`, err);
            // 继续邀请其他参与者，不中断流程
          }
        }
      }

      // 发送邮箱邀请
      const emails = emailParticipants
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email !== "");

      for (const email of emails) {
        try {
          await createInvitation(
            {
              recipient_email: email,
              invitation_type: "challenge",
              challenge_id: newChallenge.id,
            },
            user.id,
          );
        } catch (err) {
          console.error(`Failed to send invitation to ${email}:`, err);
          // 继续发送其他邀请，不中断流程
        }
      }

      // 发送电话邀请
      const phones = phoneParticipants
        .split(",")
        .map((phone) => phone.trim())
        .filter((phone) => phone !== "");

      for (const phone of phones) {
        try {
          await createInvitation(
            {
              recipient_phone: phone,
              invitation_type: "challenge",
              challenge_id: newChallenge.id,
            },
            user.id,
          );
        } catch (err) {
          console.error(`Failed to send invitation to ${phone}:`, err);
          // 继续发送其他邀请，不中断流程
        }
      }

      router.push("/challenges");
    } catch (err: any) {
      console.error("Failed to create challenge:", err);
      setError(getErrorMessage(err));
    } finally {
      stopLoading("createChallenge");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Challenge
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create Challenge</CardTitle>
              <CardDescription>
                Set up a new wellness challenge for you and your family
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 10K Steps Daily"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your challenge..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal *</Label>
                <Input
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Walk 10,000 steps daily"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Invite by Email</Label>
                <Input
                  value={emailParticipants}
                  onChange={(e) => setEmailParticipants(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label>Invite by Phone</Label>
                <Input
                  value={phoneParticipants}
                  onChange={(e) => setPhoneParticipants(e.target.value)}
                  placeholder="Enter phone numbers separated by commas"
                />
              </div>

              {/*<div className="space-y-2">
                <Label>Invite from Family Group</Label>
                <Select onValueChange={handleFamilyGroupChange} value={selectedFamilyGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a family group" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>*/}

              {groupParticipants.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Participants from Family Group</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded">
                    {groupParticipants.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedGroupParticipants.includes(
                            member.id,
                          )}
                          onCheckedChange={() => handleMemberSelect(member.id)}
                        />
                        <Label
                          htmlFor={`member-${member.id}`}
                          className="text-sm"
                        >
                          {member.name || `User ${member.id}`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              {/*<Button type="submit" disabled={isLoading("createChallenge")}>
                {isLoading("createChallenge")
                  ? "Creating..."
                  : "Create Challenge"}
              </Button>*/}
              <Button type="submit">Create Challenge</Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
