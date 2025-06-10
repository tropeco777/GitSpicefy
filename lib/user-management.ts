import { supabase } from './supabase';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface DatabaseUser {
  id: string;
  user_id: string;
  plan: string;
  generations_used: number;
  generations_limit: number;
  has_advanced_features: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    raw_user_meta_data: any;
  };
}

/**
 * Create or update user in database when they sign in with GitHub
 */
export async function createOrUpdateUser(githubUser: GitHubUser): Promise<DatabaseUser | null> {
  try {
    console.log('Creating/updating user:', githubUser);

    // Check if Supabase is available
    if (!supabase) {
      console.error('Supabase client not available');
      return null;
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('github_id', githubUser.id.toString())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user:', fetchError);
      return null;
    }

    const userData = {
      github_id: githubUser.id.toString(),
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      plan: existingUser?.plan || 'free',
      usage_count: existingUser?.usage_count || 0,
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('subscriptions')
        .update(userData)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      console.log('User updated:', data);
      return data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      console.log('User created:', data);
      return data;
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return null;
  }
}

/**
 * Get user by GitHub ID
 */
export async function getUserByGitHubId(githubId: string): Promise<DatabaseUser | null> {
  try {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (error) {
      console.error('Error fetching user by GitHub ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByGitHubId:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<DatabaseUser | null> {
  try {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

/**
 * Update user's usage count
 */
export async function incrementUserUsage(userId: string): Promise<boolean> {
  try {
    if (!supabase) {
      return false;
    }

    // First get the current usage count
    const { data: currentUser, error: fetchError } = await supabase
      .from('subscriptions')
      .select('generations_used')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current usage:', fetchError);
      return false;
    }

    // Increment the usage count
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        generations_used: (currentUser.generations_used || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing user usage:', error);
      return false;
    }

    console.log('User usage incremented:', data);
    return true;
  } catch (error) {
    console.error('Error in incrementUserUsage:', error);
    return false;
  }
}

/**
 * Record a generation in the history
 */
export async function recordGeneration(
  user: DatabaseUser,
  repositoryUrl: string,
  generationType: 'basic' | 'advanced',
  status: 'completed' | 'failed',
  generationTimeMs?: number,
  readmeContent?: string
): Promise<boolean> {
  try {
    if (!supabase) {
      return false;
    }

    const { data, error } = await supabase
      .from('generation_history')
      .insert({
        user_id: user.user_id,
        repository_url: repositoryUrl,
        generation_type: generationType,
        status,
        generation_time_ms: generationTimeMs,
        generated_content: readmeContent,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording generation:', error);
      return false;
    }

    console.log('Generation recorded:', data);

    // Increment user usage count if generation was successful
    if (status === 'completed') {
      await incrementUserUsage(user.id);
    }

    return true;
  } catch (error) {
    console.error('Error in recordGeneration:', error);
    return false;
  }
}

/**
 * Check if user can generate (based on plan limits)
 */
export function canUserGenerate(user: DatabaseUser): { canGenerate: boolean; reason?: string } {
  const limits = {
    free: 1,
    starter: 10,
    monthly: 50,
    lifetime: Infinity,
  };

  const userLimit = limits[user.plan as keyof typeof limits] || 0;
  const usageCount = user.generations_used || 0;

  if (usageCount >= userLimit) {
    return {
      canGenerate: false,
      reason: `You've reached your ${user.plan} plan limit of ${userLimit} generations. Please upgrade your plan.`,
    };
  }

  return { canGenerate: true };
}
