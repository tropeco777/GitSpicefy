"use client";
import { useState } from "react";
import { Star, Crown, Zap, Clock, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const testimonials = [
  { avatar: "👨‍💻", name: "Alex Chen" },
  { avatar: "👩‍💻", name: "Sarah Kim" },
  { avatar: "👨‍💻", name: "Mike Johnson" },
  { avatar: "👩‍💻", name: "Emma Davis" },
];

const plans = [
  {
    name: "Free Trial",
    subtitle: "Try the Basics",
    price: "$0",
    description: "Limited to 1 generation",
    features: [
      "1 README Generation",
      "Basic AI agent",
      "Public repos only"
    ],
    buttonText: "Start for Free",
    buttonStyle: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    popular: false
  },
  {
    name: "Starter Pack",
    subtitle: "Perfect for Quick Wins",
    price: "$3.99",
    description: "One-time payment",
    features: [
      "10 README Generations",
      "Public & private repos",
      "Customize with Add-Ons",
      "Easy Markdown Export"
    ],
    buttonText: "Get Starter Pack",
    buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    popular: false
  },
  {
    name: "Monthly",
    subtitle: "All Features, Monthly Renewal",
    price: "$14.99",
    period: "/month",
    description: "Or Cancel anytime",
    features: [
      "Up to 50 READMEs/Month",
      "Most Advanced AI Agent",
      "Full Project Analysis",
      "Public & Private Repos",
      "Customize with Add-Ons"
    ],
    buttonText: "Start Monthly",
    buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    popular: false
  },
  {
    name: "Lifetime Access",
    subtitle: "Ultimate Access – Forever Yours!",
    price: "$54.99",
    badge: "BEST VALUE",
    description: "Upgrade one forever – never worry about subscriptions again!",
    features: [
      "Up to 50 READMEs/Month Forever",
      "Most Advanced AI Agent",
      "Full Project Analysis",
      "Public & Private Repos",
      "Create Project Logos",
      "Make Unlimited Edits Anytime"
    ],
    buttonText: "Get Lifetime",
    buttonStyle: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white",
    popular: true
  }
];

export default function PremiumSection() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("Jun 15");

  const handlePlanSelect = (planName: string) => {
    router.push('/pricing');
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Community Section */}
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 px-4">
            Join the Thriving Community of Developers Using GitSpicefy
          </h2>
          <p className="text-gray-300 mb-8 px-4">Trusted by developers globally.</p>

          {/* Testimonials */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 px-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {testimonials.map((user, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-medium border-2 border-white"
                  >
                    {user.avatar}
                  </div>
                ))}
              </div>
              <div className="ml-2 sm:ml-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-300">Join the Wave</p>
              </div>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-gray-300">Elevate your projects</p>
            </div>
          </div>
        </div>

        {/* Limited Time Offer Banner */}
        <div className="bg-blue-600/90 backdrop-blur-sm text-white text-center py-3 rounded-t-2xl mb-0 border border-blue-500/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">LIMITED TIME OFFER</span>
            </div>
            <span className="sm:ml-4">Valid until {timeLeft}</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl rounded-t-none p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm'
                    : 'border-white/20 bg-white/10 backdrop-blur-sm'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="font-bold text-white mb-1 text-sm sm:text-base">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">{plan.subtitle}</p>

                  <div className="mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-300 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-2 mb-4 sm:mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-xs sm:text-sm">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start for Free →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
