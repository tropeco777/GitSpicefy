import { NextRequest, NextResponse } from "next/server";
import { GitHubService, parseGitHubUrl } from "@/lib/github";
import { generateReadme } from "@/lib/ai-generator";
import { getUserByGitHubId, canUserGenerate, recordGeneration, type DatabaseUser } from "@/lib/user-management";

export async function POST(request: NextRequest) {
  let repoUrl: string = '';
  try {
    const body = await request.json();
    repoUrl = body.repoUrl;

    // Check user authentication and limits
    const userSession = request.cookies.get('user-session')?.value;
    let user: DatabaseUser | null = null;

    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        user = await getUserByGitHubId(sessionData.github_id);

        if (user) {
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

    // Generate README content
    const startTime = Date.now();
    const readmeContent = await generateReadme(repoInfo, files);
    const generationTime = Date.now() - startTime;

    // Record generation in database if user is authenticated
    if (user) {
      await recordGeneration(
        user,
        repoUrl,
        'basic',
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
      user: user ? {
        plan: user.plan,
        usage_count: user.generations_used + 1, // Show updated count
        can_use_advanced: user.plan !== 'free'
      } : null,
    });

  } catch (error) {
    console.error("Analysis error:", error);

    // Record failed generation if user is authenticated
    const userSession = request.cookies.get('user-session')?.value;
    if (userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        const user = await getUserByGitHubId(sessionData.github_id);
        if (user) {
          await recordGeneration(user, repoUrl || 'unknown', 'basic', 'failed');
        }
      } catch (recordError) {
        // Silent error handling
      }
    }

    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}
