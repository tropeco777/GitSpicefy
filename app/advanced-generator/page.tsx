"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/SessionProvider";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import GenerationProgress from "@/components/GenerationProgress";
import MarkdownPreview from "@/components/MarkdownPreview";
import MarkdownEditor from "@/components/MarkdownEditor";
import ExportControls from "@/components/ExportControls";
import CustomizationSidebar from "@/components/CustomizationSidebar";
import { ReadmeConfig, defaultReadmeConfig } from "@/types/readme-config";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { FileText, Home, ArrowLeft, Sparkles, Crown, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Home", link: "/", icon: <Home /> },
  { name: "Free", link: "/generate", icon: <FileText /> },
  { name: "GitHub", link: "https://github.com/anomusly", icon: <ExternalLink /> },
];

function AdvancedGeneratorPageContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const { user } = useAuth();
  const router = useRouter();
  const { canUseAdvancedFeatures, subscription } = useSubscription();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [currentFile, setCurrentFile] = useState("");
  const [analyzedFiles, setAnalyzedFiles] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<ReadmeConfig>(defaultReadmeConfig);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // Prevent generation restart on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't restart generation when tab becomes visible again
      if (document.visibilityState === 'visible' && hasStartedGeneration) {
        // Do nothing - keep current state
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasStartedGeneration]);

  useEffect(() => {
    if (!user && !repoUrl) {
      router.push("/");
    }
  }, [user, repoUrl, router]);

  useEffect(() => {
    // Only start generation once and if we haven't already started
    if (repoUrl && !hasStartedGeneration && !isGenerating && !generationComplete && !error) {
      setHasStartedGeneration(true);
      startGeneration();
    }
  }, [repoUrl]); // Removed problematic dependencies to prevent loops

  const startGeneration = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationComplete(false);
    setAnalyzedFiles([]);
    setProgress(0);
    setError(null);

    try {
      // Call our API to analyze the repository with the config
      const response = await fetch("/api/analyze-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          repoUrl,
          config
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Failed to analyze repository (${response.status})`);
      }

      const data = await response.json();

      // Simulate progress for each file
      const files = data.files || [];
      for (let i = 0; i < files.length; i++) {
        setCurrentFile(files[i].path);
        setAnalyzedFiles(prev => [...prev, files[i].path]);
        setProgress(((i + 1) / files.length) * 100);

        // Add a small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setGeneratedMarkdown(data.readme);
      setGenerationComplete(true);
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (newConfig: ReadmeConfig) => {
    setConfig(newConfig);
  };

  // Check for premium access
  if (!canUseAdvancedFeatures()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Premium Feature
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The Advanced Generator is available for premium subscribers only.
              Upgrade your plan to access advanced AI features, unlimited generations,
              and premium customization options.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Lock className="w-4 h-4" />
                <span>Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/pricing')}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!repoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Repository URL Provided</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Customization Sidebar - Fixed/Sticky on large screens, collapsible on mobile */}
      <div className="lg:w-80 lg:flex-shrink-0">
        <div className="lg:fixed lg:top-0 lg:left-0 lg:w-80 lg:h-screen lg:overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 z-10">
          <CustomizationSidebar
            config={config}
            onConfigChange={handleConfigChange}
            onGenerate={startGeneration}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto lg:ml-80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <Navbar navItems={navItems} />

          <div className="pt-24 sm:pt-32 pb-10">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Advanced Documentation Generator
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">
                Repository: {decodeURIComponent(repoUrl)}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
                <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
                  Analysis Failed
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>

                {error.includes('rate limit') && (
                  <div className="bg-blue-50/90 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                      💡 Tip: Increase Rate Limits
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      To avoid rate limiting, you can add a GitHub personal access token to your environment variables.
                      This increases the rate limit from 60 to 5,000 requests per hour.
                    </p>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Create GitHub Token →
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    setError(null);
                    startGeneration();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Generation Progress */}
            {isGenerating && (
              <GenerationProgress
                currentFile={currentFile}
                progress={progress}
              />
            )}

            {/* Results */}
            {generationComplete && (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Generated README</h2>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {isEditing ? "Preview" : "Edit"}
                    </button>
                    
                    <ExportControls markdown={generatedMarkdown} />
                  </div>
                </div>

                {/* Editor/Preview */}
                <div className="grid grid-cols-1 gap-6">
                  {isEditing ? (
                    <MarkdownEditor 
                      value={generatedMarkdown}
                      onChange={setGeneratedMarkdown}
                    />
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <MarkdownPreview 
                        markdown={generatedMarkdown}
                        alignment={config.headerAlignment}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdvancedGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AdvancedGeneratorPageContent />
    </Suspense>
  );
}
