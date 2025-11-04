import { User } from "@/types";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8000";

// 登录API
export const login = async (
  healthId: string,
  password: string,
): Promise<{ access_token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: healthId, password }), // 使用healthId作为email字段
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const tokenData = await response.json();

  // 保存认证令牌到cookies中
  Cookies.set("authToken", tokenData.access_token, { expires: 1 }); // 7天过期

  return tokenData;
};

// 获取当前用户信息
export const getCurrentUser = async (token?: string): Promise<User> => {
  // 如果没有提供token参数，则从cookies中获取
  const authToken = token || Cookies.get("authToken");

  if (!authToken) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    credentials: "include", // 确保cookies被包含在请求中
  });

  if (!response.ok) {
    // 如果获取用户信息失败，清除本地的认证信息
    Cookies.remove("authToken");
    Cookies.remove("user");
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};

// 登出API
export const logout = async (): Promise<void> => {
  const token = Cookies.get("authToken");

  if (!token) {
    // 即使没有token也清理客户端状态
    Cookies.remove("user");
    Cookies.remove("authToken");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // 确保cookies被包含在请求中
    });

    // 移除客户端的认证信息
    Cookies.remove("user");
    Cookies.remove("authToken");

    if (!response.ok) {
      console.warn("Logout API returned non-ok status:", response.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
    // 即使API调用失败也清理客户端状态
    Cookies.remove("user");
    Cookies.remove("authToken");
  }
};
