import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PawPrint, Heart, Users, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <PawPrint className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Pet Companion
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with trusted shelters and find your new best friend. 
            Adopt, do not shop!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PET4U?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">
                Browse hundreds of pets looking for loving homes
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Shelters</h3>
              <p className="text-gray-600">
                Connect with verified shelters and organizations
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Process</h3>
              <p className="text-gray-600">
                Easy adoption requests and real-time communication
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
