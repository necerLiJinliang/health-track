'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/lib/authApi';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查cookies中的认证信息
    const storedUser = Cookies.get('user');
    const token = Cookies.get('authToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phoneNumber: string, password: string): Promise<void> => {
    try {
      // 调用实际的登录API
      const tokenData = await loginApi(phoneNumber, password);
      
      // 获取用户信息
      // 注意：loginApi已经设置了authToken cookies，这里不需要重复设置
      
      const currentUser = await getCurrentUser(tokenData.access_token);
      
      // 保存用户信息
      setUser(currentUser);
      setIsAuthenticated(true);
      Cookies.set('user', JSON.stringify(currentUser), { expires: 7 }); // 7天过期
    } catch (error) {
      console.error('Login error:', error);
      // 登录失败时清除可能存在的认证信息
      Cookies.remove('authToken');
      Cookies.remove('user');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 调用后端登出API
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // 清理本地状态
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove('user');
      Cookies.remove('authToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}