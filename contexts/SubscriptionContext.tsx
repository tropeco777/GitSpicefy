"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/SessionProvider';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/lib/supabase';

export type PlanType = 'free' | 'starter' | 'monthly' | 'lifetime';

interface SubscriptionData {
  plan: PlanType;
  generationsUsed: number;
  generationsLimit: number;
  hasAdvancedFeatures: boolean;
  expiresAt?: Date;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  loading: boolean;
  updateSubscription: (plan: PlanType) => Promise<void>;
  incrementGenerations: () => Promise<void>;
  canUseAdvancedFeatures: () => boolean;
  canGenerate: () => boolean;
  getRemainingGenerations: () => number;
  refreshSubscription: () => Promise<void>;
}

const defaultSubscription: SubscriptionData = {
  plan: 'free',
  generationsUsed: 0,
  generationsLimit: 1,
  hasAdvancedFeatures: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>(defaultSubscription);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load subscription from Supabase when user changes
  useEffect(() => {
    if (user === undefined) return; // Wait for auth to load

    if (!user) {
      // User is not logged in, use default subscription
      setSubscription(defaultSubscription);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);

      // Try to get existing subscription
      const { data: existingSubscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading subscription:', error);
        setSubscription(defaultSubscription);
        return;
      }

      if (existingSubscription) {
        // Convert database format to local format
        const loadedSubscription: SubscriptionData = {
          plan: existingSubscription.plan as PlanType,
          generationsUsed: existingSubscription.generations_used,
          generationsLimit: existingSubscription.generations_limit,
          hasAdvancedFeatures: existingSubscription.has_advanced_features,
          expiresAt: existingSubscription.expires_at ? new Date(existingSubscription.expires_at) : undefined,
        };
        setSubscription(loadedSubscription);
      } else {
        // No subscription found, create default one
        await createDefaultSubscription();
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription(defaultSubscription);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSubscription = async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: 'free',
          generations_used: 0,
          generations_limit: 1,
          has_advanced_features: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default subscription:', error);
        return;
      }

      setSubscription(defaultSubscription);
    } catch (error) {
      console.error('Failed to create default subscription:', error);
    }
  };

  const updateSubscription = async (plan: PlanType) => {
    if (!user || !supabase) return;

    let newSubscriptionData: Partial<Subscription>;

    switch (plan) {
      case 'free':
        newSubscriptionData = {
          plan: 'free',
          generations_used: 0,
          generations_limit: 1,
          has_advanced_features: false,
          expires_at: undefined,
        };
        break;
      case 'starter':
        newSubscriptionData = {
          plan: 'starter',
          generations_used: 0,
          generations_limit: 10,
          has_advanced_features: true,
          expires_at: undefined,
        };
        break;
      case 'monthly':
        newSubscriptionData = {
          plan: 'monthly',
          generations_used: 0,
          generations_limit: 50,
          has_advanced_features: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        };
        break;
      case 'lifetime':
        newSubscriptionData = {
          plan: 'lifetime',
          generations_used: 0,
          generations_limit: 50,
          has_advanced_features: true,
          expires_at: undefined,
        };
        break;
      default:
        return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          ...newSubscriptionData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        return;
      }

      // Update local state
      const updatedSubscription: SubscriptionData = {
        plan: data.plan as PlanType,
        generationsUsed: data.generations_used,
        generationsLimit: data.generations_limit,
        hasAdvancedFeatures: data.has_advanced_features,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      };

      setSubscription(updatedSubscription);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const incrementGenerations = async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          generations_used: subscription.generationsUsed + 1,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error incrementing generations:', error);
        return;
      }

      // Update local state
      setSubscription(prev => ({
        ...prev,
        generationsUsed: data.generations_used,
      }));
    } catch (error) {
      console.error('Failed to increment generations:', error);
    }
  };

  const canUseAdvancedFeatures = () => {
    // Check if subscription has expired for monthly plans
    if (subscription.plan === 'monthly' && subscription.expiresAt) {
      if (new Date() > subscription.expiresAt) {
        return false;
      }
    }
    
    return subscription.hasAdvancedFeatures;
  };

  const canGenerate = () => {
    // Check if subscription has expired for monthly plans
    if (subscription.plan === 'monthly' && subscription.expiresAt) {
      if (new Date() > subscription.expiresAt) {
        return false;
      }
    }

    return subscription.generationsUsed < subscription.generationsLimit;
  };

  const getRemainingGenerations = () => {
    // Check if subscription has expired for monthly plans
    if (subscription.plan === 'monthly' && subscription.expiresAt) {
      if (new Date() > subscription.expiresAt) {
        return 0;
      }
    }

    return Math.max(0, subscription.generationsLimit - subscription.generationsUsed);
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription();
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        updateSubscription,
        incrementGenerations,
        canUseAdvancedFeatures,
        canGenerate,
        getRemainingGenerations,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
