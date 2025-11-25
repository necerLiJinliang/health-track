import { getUserEmails } from "@/lib/api";
import React from "react";
import type { Email } from "@/types";
export const fetchUserEmails = async (
  userId: number,
  setFunction: React.Dispatch<React.SetStateAction<Email[]>>,
) => {
  try {
    const emails = await getUserEmails(userId);
    console.log("fetchUserEmails:", emails);
    setFunction(emails);
  } catch (error: unknown) {
    console.error("Failed to fetch user emails:", error);
    setFunction([]); // 发生错误时清空
  }
};
