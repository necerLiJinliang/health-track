"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-bold text-blue-600"
            >
              HealthTrack
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className={`${
                    pathname === "/dashboard"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push("/appointments")}
                  className={`${
                    pathname === "/appointments" ||
                    pathname.startsWith("/appointments/")
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => router.push("/challenges")}
                  className={`${
                    pathname === "/challenges" ||
                    pathname.startsWith("/challenges/")
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Challenges
                </button>
                <button
                  onClick={() => router.push("/familyGroup")}
                  className={`${
                    pathname === "/familyGroup" ||
                    pathname.startsWith("/familyGroup/")
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Family Group
                </button>
                <button
                  onClick={() => router.push("/profile")}
                  className={`${
                    pathname === "/profile"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Profile
                </button>
              </>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 hidden md:inline">
                  Hello, {user?.name || "User"}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to sign out? You will need to log
                        back in to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : pathname !== "/login" && pathname !== "/register" ? (
              <>
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => router.push("/register")}>
                  Sign Up
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => router.push("/")}>
                Home
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
