import React from 'react';
import { Search, Heart, Home } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find a Pet',
    description: 'Browse through our wide selection of pets available for adoption.',
  },
  {
    icon: Heart,
    title: 'Express Interest',
    description: 'Let us know which pet you are interested in and connect with the pet owner.',
  },
  {
    icon: Home,
    title: 'Meet Your Match',
    description: 'Schedule a meeting to get to know your potential new furry friend.',
  },
  {
    icon: Home,
    title: 'Adopt and Welcome Home',
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
            Discover how easy it is to adopt a pet and bring joy to your life.
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
