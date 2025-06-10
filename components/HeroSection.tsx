"use client";
import { useState, useEffect } from "react";
import { ChevronRight, ExternalLink, Sparkles, Crown } from "lucide-react";
import { useAuth } from "./SessionProvider";
import { useSubscription } from "@/contexts/SubscriptionContext";
import ShinyButton from "./ui/ShinyButton";
import { TextGenerateEffect } from "./ui/TextGenerate";
import GitHubUrlInput from "./GitHubUrlInput";
import Logo from "./ui/Logo";
import { useRouter } from "next/navigation";
import { isValidGitHubUrl } from "@/lib/utils/validation";

const HeroSection = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { canGenerate, canUseAdvancedFeatures, getRemainingGenerations, subscription, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();

  // Reset isGenerating when component mounts or user changes
  useEffect(() => {
    setIsGenerating(false);
  }, [user]);

  const handleGenerate = (advanced = false) => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    if (!canGenerate()) {
      router.push("/pricing");
      return;
    }

    if (advanced && !canUseAdvancedFeatures()) {
      router.push("/pricing");
      return;
    }

    // Validate URL before proceeding
    if (githubUrl.trim() && isValidGitHubUrl(githubUrl.trim())) {
      setIsGenerating(true);
      // Navigate to generation page with the GitHub URL
      const encodedUrl = encodeURIComponent(githubUrl.trim());
      const path = advanced ? '/advanced-generator' : '/generate';
      router.push(`${path}?repo=${encodedUrl}`);

      // Reset isGenerating after a short delay to prevent UI issues
      setTimeout(() => setIsGenerating(false), 1000);
    }
  };

  return (
    <div
      className="pb-20 pt-36 sm:p-0 sm:min-h-screen flex flex-col items-center justify-center relative"
      id="home"
    >
        <div className="flex flex-col justify-center items-center relative z-10 text-center">
          <div className="flex items-center gap-3 mb-6">
            <Logo size="lg" showText={true} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary w-6 h-6" />
            <p className="uppercase font-bold text-sm tracking-widest">
              AI-Powered Documentation
            </p>
          </div>
          
          <TextGenerateEffect
            words="Transform GitHub Repositories into Professional Documentation"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center max-w-5xl leading-tight tracking-wide px-4"
          />
          
          <p className="pt-5 pb-4 text-sm sm:text-base md:text-lg text-dark-200 dark:text-stone-200/70 max-w-2xl px-4 text-center">
            GitSpicefy analyzes your GitHub repository and generates comprehensive,
            professional README documentation using AI. Simply paste your repo URL
            and watch the magic happen.
          </p>

          {user && (
            <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mx-4 max-w-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-white/80 text-center sm:text-left">
                  <span className="font-medium">Plan: </span>
                  <span className="capitalize">{subscription.plan}</span>
                  {subscription.plan !== 'free' && (
                    <Crown className="w-4 h-4 inline ml-1 text-yellow-400" />
                  )}
                </div>
                <div className="text-sm text-white/80 text-center sm:text-left">
                  <span className="font-medium">Generations: </span>
                  <span className={getRemainingGenerations() > 0 ? "text-green-400" : "text-red-400"}>
                    {getRemainingGenerations()} remaining
                  </span>
                </div>
                {(subscription.plan === 'free' || getRemainingGenerations() === 0) && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full hover:from-purple-600 hover:to-blue-600 transition-all whitespace-nowrap"
                  >
                    {getRemainingGenerations() === 0 ? 'Upgrade Now' : 'Upgrade'}
                  </button>
                )}
              </div>
              {getRemainingGenerations() === 0 && (
                <div className="mt-3 text-xs text-red-300 text-center">
                  You&apos;ve used all your generations. Upgrade to continue creating amazing READMEs!
                </div>
              )}
            </div>
          )}

          <div className="w-full max-w-2xl mb-8">
            <GitHubUrlInput
              value={githubUrl}
              onChange={setGithubUrl}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ShinyButton
                icon={<ChevronRight />}
                onClick={() => handleGenerate(false)}
                disabled={!githubUrl.trim() || !isValidGitHubUrl(githubUrl.trim()) || isGenerating || subscriptionLoading || (!!user && !canGenerate())}
                className="w-full sm:w-auto"
              >
                {isGenerating
                  ? "Generating..."
                  : !user
                    ? "Sign in to Generate"
                    : user && !canGenerate()
                      ? "Upgrade to Generate"
                      : "Quick Generate"
                }
              </ShinyButton>

              <button
                onClick={() => handleGenerate(true)}
                disabled={!githubUrl.trim() || !isValidGitHubUrl(githubUrl.trim()) || isGenerating || subscriptionLoading || !user || (user && !canUseAdvancedFeatures())}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                {!canUseAdvancedFeatures() && user ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">{!canUseAdvancedFeatures() && user ? "Premium Feature" : "Advanced AI Generator"}</span>
                <span className="sm:hidden">{!canUseAdvancedFeatures() && user ? "Premium" : "Advanced"}</span>
              </button>
            </div>

            <a
              href="https://github.com/anomusly/GitSpicefy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group"
            >
              <ExternalLink className="text-primary" />
              <span className="group-hover:text-white/70 transition-colors duration-200 font-semibold">
                View on GitHub
              </span>
            </a>
          </div>
        </div>
      </div>
  );
};

export default HeroSection;
