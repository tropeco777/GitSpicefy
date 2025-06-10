"use client";
import { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  period?: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'premium';
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    description: 'Try the Basics',
    price: '$0',
    badge: 'TRAIL',
    badgeColor: 'bg-gray-500',
    features: [
      '1 README Generation',
      'Basic AI agent',
      'Public repos only'
    ],
    buttonText: 'Start for Free',
    buttonVariant: 'secondary'
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Perfect for Quick Wins',
    price: '$3.99',
    period: 'One-time payment',
    badge: 'SAVINGS',
    badgeColor: 'bg-green-500',
    features: [
      '10 README Generations',
      'Public & private repos',
      'Customize with Add-Ons',
      'Easy Markdown Export'
    ],
    buttonText: 'Get Starter Pack',
    buttonVariant: 'primary'
  },
  {
    id: 'monthly',
    name: 'Monthly',
    description: 'All Features, Monthly Renewal',
    price: '$14.99',
    period: '/month',
    badge: 'MOST USED',
    badgeColor: 'bg-yellow-500',
    features: [
      'Up to 50 READMEs/Month',
      'Most Advanced AI Agent',
      'Full Project Analysis',
      'Public & Private Repos',
      'Customize with Add-Ons',
      'Easy Markdown Export'
    ],
    buttonText: 'Start Monthly',
    buttonVariant: 'primary'
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    description: 'Ultimate Access – Forever Yours!',
    price: '$54.99',
    badge: 'BEST VALUE',
    badgeColor: 'bg-red-500',
    popular: true,
    features: [
      'Up to 50 READMEs/Month Forever',
      'Most Advanced AI Agent',
      'Full Project Analysis',
      'Public & Private Repos',
      'Customize with Add-Ons',
      'Project logo generation',
      'Create Project Logos',
      'Make Unlimited Edits Anytime',
      'All Future Features Included'
    ],
    buttonText: 'Get Lifetime Access',
    buttonVariant: 'premium'
  }
];

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
}

export default function PricingPlans({ onSelectPlan }: PricingPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    onSelectPlan(planId);
  };

  const getButtonClasses = (variant: string, popular?: boolean) => {
    const base = "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105";
    
    switch (variant) {
      case 'primary':
        return `${base} bg-blue-600 hover:bg-blue-700 text-white shadow-lg`;
      case 'secondary':
        return `${base} bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300`;
      case 'premium':
        return `${base} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl`;
      default:
        return base;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Unlock the full potential of AI-powered README generation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
              plan.popular
                ? 'border-gradient-to-r from-purple-500 to-blue-500 transform scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            {plan.badge && (
              <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1`}>
                <Star className="w-4 h-4" />
                {plan.badge}
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={getButtonClasses(plan.buttonVariant, plan.popular)}
              >
                <span className="flex items-center justify-center gap-2">
                  {plan.buttonText}
                  {plan.popular && <Crown className="w-5 h-5" />}
                </span>
              </button>

              {plan.id === 'free' && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  No credit card required
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Pay once, use forever — never worry about subscriptions again!
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Instant Access
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-4 h-4" />
            30-day Money Back
          </span>
          <span className="flex items-center gap-1">
            <Crown className="w-4 h-4" />
            Premium Support
          </span>
        </div>
      </div>
    </div>
  );
}



