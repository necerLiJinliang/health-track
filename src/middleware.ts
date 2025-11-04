import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 定义受保护的路由
const protectedRoutes = ['/dashboard', '/profile', '/appointments', '/challenges']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // 检查是否是认证路由
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // 从cookies中获取认证信息
  const token = request.cookies.get('authToken')?.value
  
  // 如果访问受保护路由但没有token，重定向到登录页
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // 如果已经认证的用户访问注册页面，不再重定向到仪表板
  // 允许已登录用户访问注册页面，例如创建新账户
  // if (pathname === '/register' && token) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/dashboard'
  //   return NextResponse.redirect(url)
  // }
  
  // 添加认证头到请求中
  const headers = new Headers(request.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  // 继续处理请求
  const response = NextResponse.next({
    request: {
      headers
    }
  })
  
  // 如果有token，确保它在cookies中
  if (token) {
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
  }
  
  return response
}

// 配置匹配器
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下路径:
     * 1. /api (API路由)
     * 2. /_next/static (静态文件)
     * 3. /_next/image (图片优化文件)
     * 4. /favicon.ico (favicon文件)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}