"use client";
import { HelpCircle } from "lucide-react";

export default function ContactUs() {
  const handleContactClick = () => {
    window.location.href = "mailto:hsnshafique090@gmail.com?subject=GitSpicefy Support - Need Help&body=Hi there,%0D%0A%0D%0AI need help with GitSpicefy.%0D%0A%0D%0APlease describe your issue:%0D%0A";
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-blue-50/90 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <span className="text-blue-900 dark:text-blue-100 text-sm sm:text-base">
              Can&apos;t find what you&apos;re looking for?{" "}
              <button
                onClick={handleContactClick}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline underline-offset-2 transition-colors duration-200"
              >
                Contact us
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
