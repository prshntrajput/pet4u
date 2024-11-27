import React from 'react';
import { Search, Heart, Home, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'AI Analysis',
    description: 'Our AI analyzes your lifestyle, preferences, and living situation.',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description: 'Get personalized pet recommendations based on compatibility scores.',
  },
  {
    icon: Heart,
    title: 'Meet & Connect',
    description: 'Schedule a meeting with your potential new family member.',
  },
  {
    icon: Home,
    title: 'Welcome Home',
    description: 'Complete the adoption process and give your new friend a loving home.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How Pet4U Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform makes finding your perfect pet companion easier than ever.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 left-full w-full h-0.5 bg-gradient-to-r from-pink-200 to-transparent"></div>
              )}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="bg-pink-50 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}