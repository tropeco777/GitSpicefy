"use client";
import { useState } from 'react';
import { Navbar } from "@/components/ui/Navbar";
import PricingPlans from "@/components/PricingPlans";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useRouter } from 'next/navigation';
// Using console.log instead of toast for now
import {
  ExternalLink,
  FileText,
  Sparkles,
  Home,
} from "lucide-react";

const navItems = [
  { name: "Home", link: "/", icon: <Home /> },
  { name: "GitHub", link: "https://github.com/anomusly", icon: <ExternalLink /> },
];

export default function PricingPage() {
  const { updateSubscription } = useSubscription();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    setIsProcessing(true);

    try {
      if (planId === 'free') {
        await updateSubscription('free');
        console.log("Free Plan Activated - You can now generate 1 README file.");
        router.push('/');
      } else {
        // For demo purposes, we'll simulate payment processing
        // In a real app, you'd integrate with Stripe, PayPal, etc.
        await simulatePayment(planId);

        await updateSubscription(planId as any);

        console.log(`Payment Successful! ${getPlanName(planId)} plan activated successfully.`);

        router.push('/');
      }
    } catch (error) {
      console.error("Payment Failed - There was an error processing your payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = (planId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate payment processing delay
      setTimeout(() => {
        // For demo, we'll always succeed
        // In real implementation, this would be actual payment processing
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          resolve();
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  };

  const getPlanName = (planId: string): string => {
    const names: Record<string, string> = {
      'starter': 'Starter Pack',
      'monthly': 'Monthly',
      'lifetime': 'Lifetime Access'
    };
    return names[planId] || planId;
  };

  return (
    <main className="flex flex-col px-5 sm:px-10 relative min-h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <Navbar navItems={navItems} />
        
        <div className="pt-32 pb-20">
          {/* <div className="text-center mb-16 px-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">
              Unlock the full potential of AI-powered README generation with our flexible pricing options.
              Start free and upgrade when you're ready for more features.
            </p>
          </div> */}

          <PricingPlans onSelectPlan={handleSelectPlan} />

          {isProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we process your payment securely.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
