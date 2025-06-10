import { NextRequest, NextResponse } from "next/server";
import { GitHubService, parseGitHubUrl } from "@/lib/github";
import { generateEnhancedReadme } from "@/lib/enhanced-ai-generator";
import { ReadmeConfig } from "@/types/readme-config";
import { getUserByGitHubId, canUserGenerate, recordGeneration, type DatabaseUser } from "@/lib/user-management";

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, config } = await request.json();

    // Check user authentication and limits
    const userSession = request.cookies.get('user-session')?.value;
    let user: DatabaseUser | null = null;

    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        user = await getUserByGitHubId(sessionData.github_id);

        if (user) {
          // Check if user can use advanced features
          if (user.plan === 'free') {
            return NextResponse.json(
              { error: "Advanced features are only available for premium users. Please upgrade your plan." },
              { status: 403 }
            );
          }

          const { canGenerate, reason } = canUserGenerate(user);
          if (!canGenerate) {
            return NextResponse.json(
              { error: reason },
              { status: 403 }
            );
          }
        }
      } catch (error) {
        // Silent error handling
      }
    } else {
      return NextResponse.json(
        { error: "Authentication required for advanced features. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Use GitHub token if available for higher rate limits
    const githubToken = process.env.GITHUB_TOKEN;
    const github = new GitHubService(githubToken);

    // Get repository info
    const repoInfo = await github.getRepositoryInfo(owner, repo);
    
    // Get all files
    const files = await github.getAllFiles(owner, repo, repoInfo.defaultBranch);
    
    // Generate README content with enhanced AI features
    const startTime = Date.now();
    const readmeContent = await generateEnhancedReadme(repoInfo, files, config as ReadmeConfig);
    const generationTime = Date.now() - startTime;

    // Record generation in database if user is authenticated
    if (user) {
      await recordGeneration(
        user,
        repoUrl,
        'advanced',
        'completed',
        generationTime,
        readmeContent
      );
    }

    return NextResponse.json({
      success: true,
      repository: repoInfo,
      files: files.map(f => ({ name: f.name, path: f.path, type: f.type })),
      readme: readmeContent,
      config: config,
      user: user ? {
        plan: user.plan,
        usage_count: user.generations_used + 1, // Show updated count
        can_use_advanced: true
      } : null,
    });

  } catch (error: any) {
    console.error("Advanced analysis error:", error);
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: "GitHub API rate limit exceeded. Please try again later or add a GitHub token to increase limits.",
          type: "rate_limit"
        },
        { status: 429 }
      );
    }

    if (error.message?.includes('Not Found')) {
      return NextResponse.json(
        { error: "Repository not found. Please check the URL and ensure the repository is public." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
