"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/SessionProvider";
import { Navbar } from "@/components/ui/Navbar";
import ShinyButton from "@/components/ui/ShinyButton";
import { ExternalLink, Sparkles, Home, Crown } from "lucide-react";
const navItems = [
  { name: "Home", link: "#home", icon: <Home /> },
  { name: "Pricing", link: "/pricing", icon: <Crown /> },
  { name: "GitHub", link: "https://github.com/anomusly", icon: <ExternalLink /> },
];
export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, signInWithGitHub } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative z-10 max-w-md w-full">
        <Navbar navItems={navItems} />
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-primary w-6 sm:w-8 h-6 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl font-bold">GitSpicefy</h1>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold mb-2">Welcome!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Sign in with GitHub to access your repositories and generate amazing documentation.
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <ExternalLink className="w-16 h-16 mx-auto mb-4 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">GitHub Authentication Required</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We need access to your GitHub account to analyze your repositories and generate documentation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50/90 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  What we can access:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Read your public and private repositories</li>
                  <li>• Analyze file contents and structure</li>
                  <li>• Generate comprehensive documentation</li>
                </ul>
              </div>

              <div className="bg-green-50/90 dark:bg-green-900/30 backdrop-blur-sm border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  We will never:
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Modify your repositories</li>
                  <li>• Store your code permanently</li>
                  <li>• Share your data with third parties</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <ShinyButton
                onClick={handleSignIn}
                disabled={isLoading}
                icon={<ExternalLink />}
                iconPosition="left"
                className="w-full justify-center"
              >
                {isLoading ? "Signing in..." : "Continue with GitHub"}
              </ShinyButton>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

