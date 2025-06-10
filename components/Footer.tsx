"use client";
import { ExternalLink, Mail, Heart, Home, FileText, Crown } from "lucide-react";
import Logo from "./ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleEmailClick = () => {
    window.location.href = "mailto:hsnshafique090@gmail.com?subject=GitSpicefy Inquiry";
  };

  const navLinks = [
    { name: "Home", href: "#home", icon: <Home className="w-4 h-4" /> },
    { name: "Generate", href: "#generate", icon: <FileText className="w-4 h-4" /> },
    { name: "Pricing", href: "/pricing", icon: <Crown className="w-4 h-4" /> },
    { name: "GitHub", href: "https://github.com", icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Mobile: Simplified Layout */}
        <div className="md:hidden">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Logo size="sm" showText={true} />
            </div>
            <p className="text-gray-300 text-sm">
              AI-powered README generation for developers
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={handleEmailClick}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </button>
          </div>

          <div className="text-center border-t border-white/10 pt-6">
            <p className="text-gray-400 text-sm mb-2">
              © {currentYear} GitSpicefy. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>by Hassan Shafique</span>
            </div>
          </div>
        </div>

        {/* Desktop: Full Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Logo size="sm" showText={true} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                Transform your GitHub repositories into professional documentation with AI-powered generation.
                Create beautiful READMEs in seconds, not hours.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.icon}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <button
                onClick={handleEmailClick}
                className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Support
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} GitSpicefy. All rights reserved.
            </p>

            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>by Hassan Shafique</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
