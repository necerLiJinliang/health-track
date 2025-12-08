# HealthTrack Personal Wellness Platform - Frontend

This is the frontend application for the HealthTrack Personal Wellness Platform, built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components. The backend is FastAPI.

## Project Overview

HealthTrack is a personal health and wellness management platform that allows users to:
- Track healthcare appointments
- Create and participate in wellness challenges
- Manage healthcare providers
- Generate health reports
- Manage family health records

## Features Implemented

- User authentication (login/register)
- Dashboard with health overview
- Appointment management (view, create)
- Wellness challenge management (view, create)
- User profile management
- Responsive design for all device sizes

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context API (built-in with Next.js)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 目录结构

```
.
├── README.md
├── backend
│   ├── README.md
│   ├── __init__.py
│   ├── crud.py
│   ├── database.db
│   ├── database.py
│   ├── healthtrack.db
│   ├── init_db.py
│   ├── main.py
│   ├── models.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── routers
│   ├── sample_data.py
│   ├── schemas.py
│   ├── test_api.py
│   └── uv.lock
├── public
├── src
│   ├── app
│   ├── components
│   ├── contexts
│   ├── lib
```


## 路由与页面

- `/` - 首页
- `/login` - 登录
- `/register` - 注册
- `/dashboard` - 仪表盘
- `/appointments` - 预约列表
- `/appointments/new` - 新建预约
- `/challenges` - 挑战列表
- `/challenges/new` - 新建挑战
- `/profile` - 个人档案
- `/familyGroup` - 家庭成员管理
- `/messages` - 消息中心

## 开发与启动
推荐Python版本3.9+

1. 克隆仓库：

```bash
git clone xxx
```

2. 进入项目目录：

```bash
cd health-track
```

3. 配置后端
- 进入 backend 目录：

```bash
cd backend
```

- 创建并激活虚拟环境：

使用uv：

```bash
uv venv 
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
# - 安装依赖：
uv pip install -r requirements.txt
```

使用conda：

```bash
conda create -n healthtrack_env python=3.9 -y
conda activate healthtrack_env
pip install -r requirements.txt
```
- 初始化数据库并添加示例数据：

```bash
python init_db.py
```

4. 配置前端

- 返回项目根目录：

```bash
cd ..
```

- 安装依赖：

```bash
npm install
```

5. 启动开发服务器：

```bash
# 启动后端服务器
cd backend
# 在 backend 目录下运行：
uv uvicorn main:app --reload
```

在根目录中创建一个文件 `.env.local`，添加以下内容以配置后端API地址：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
# 启动前端服务器
# 在项目根目录下运行：
npm run dev
```


## Available Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/appointments` - View all appointments
- `/appointments/new` - Create new appointment
- `/challenges` - View all challenges
- `/challenges/new` - Create new challenge
- `/profile` - User profile management

## Components

Custom components are located in `src/components/`:
- Navigation bar
- UI components (Button, Card, Input, etc.)

## Styling

This project uses Tailwind CSS for styling with shadcn/ui components. All styles are defined in `src/app/globals.css`.

## Next Steps

To complete the application, you would need to:

1. Connect to a backend API for data persistence
2. Implement actual authentication logic
3. Add form validation
4. Implement real-time updates for challenges
5. Add more detailed health reporting features
6. Implement family group management
7. Add healthcare provider verification workflow

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
