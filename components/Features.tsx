"use client";
import { Sparkles, Zap, Shield, Code, FileText, Crown } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI-Powered Generation",
    description: "Advanced AI analyzes your repository structure and generates comprehensive documentation automatically."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast",
    description: "Generate professional README files in seconds, not hours. Save time and focus on coding."
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Smart Code Analysis",
    description: "Understands your project structure, dependencies, and functionality to create accurate documentation."
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Professional Templates",
    description: "Beautiful, industry-standard README templates that make your projects stand out."
  },
  {
    icon: <Crown className="w-6 h-6" />,
    title: "Advanced Customization",
    description: "Premium features include custom styling, logo generation, and advanced formatting options."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure & Private",
    description: "Your code stays private. We analyze without storing your repository data permanently."
  }
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Why Choose GitSpicefy?
          </h2>
          <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto">
            Transform your repositories into professional documentation with cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
