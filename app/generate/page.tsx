"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/SessionProvider";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import GenerationProgress from "@/components/GenerationProgress";
import MarkdownPreview from "@/components/MarkdownPreview";
import MarkdownEditor from "@/components/MarkdownEditor";
import AlignmentControls from "@/components/AlignmentControls";
import ExportControls from "@/components/ExportControls";
import { FileText, Home, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Home", link: "/", icon: <Home /> },
  { name: "Advanced", link: "/advanced-generator", icon: <FileText /> },
  { name: "GitHub", link: "https://github.com/anomusly", icon: <ExternalLink /> },
];

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get("repo");
  const { user, loading } = useAuth();
  const { canGenerate, incrementGenerations, subscription } = useSubscription();
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [currentFile, setCurrentFile] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("left");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFiles, setAnalyzedFiles] = useState<string[]>([]);
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
    if (loading) return;

    if (!user) {
      router.push("/auth/signin");
      return;
    }

    // Check if user can generate ONLY on initial load, not on every render
    if (!hasStartedGeneration && !canGenerate()) {
      router.push("/pricing");
      return;
    }

    // Only start generation once and if we haven't already started
    if (repoUrl && !hasStartedGeneration && !generationComplete && !isGenerating) {
      setHasStartedGeneration(true);
      startGeneration();
    }
  }, [repoUrl, user, loading, router]); // Removed problematic dependencies

  const startGeneration = async () => {
    if (!repoUrl) return;

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setAnalyzedFiles([]);

    try {
      // Call our API to analyze the repository
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl }),
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

      // Increment generation count on successful generation (only once)
      if (!generationComplete) {
        await incrementGenerations();
      }
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };



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
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
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
              Documentation Generator
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
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <AlignmentControls 
                  alignment={alignment}
                  onAlignmentChange={setAlignment}
                />
                
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
                  <div className="w-full">
                    <MarkdownPreview
                      markdown={generatedMarkdown}
                      alignment={alignment}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  );
}
