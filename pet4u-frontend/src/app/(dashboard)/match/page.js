'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { petAPI } from '@/lib/api/pets';
import apiWrapper from '@/lib/api/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Sparkles, Home, Activity, Users, Heart, Star,
  PawPrint, ArrowRight, ArrowLeft, Loader2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Quiz steps definition
const STEPS = [
  {
    id: 'living',
    title: 'Where do you live?',
    subtitle: 'This helps us suggest the right size and energy level.',
    icon: Home,
    field: 'livingSpace',
    options: [
      { value: 'apartment', label: 'Apartment / Flat', emoji: '🏢', desc: 'No yard, limited space' },
      { value: 'house_small_yard', label: 'House with small yard', emoji: '🏡', desc: 'Some outdoor space' },
      { value: 'house_large_yard', label: 'House with large yard', emoji: '🏠', desc: 'Plenty of space to roam' }
    ]
  },
  {
    id: 'activity',
    title: 'How active is your lifestyle?',
    subtitle: 'We want your new pet to keep up with you — or match your chill vibe.',
    icon: Activity,
    field: 'activityLevel',
    options: [
      { value: 'low', label: 'Low key', emoji: '🛋️', desc: 'I prefer relaxing at home' },
      { value: 'moderate', label: 'Moderate', emoji: '🚶', desc: 'I enjoy occasional walks and outings' },
      { value: 'high', label: 'Very active', emoji: '🏃', desc: 'Daily runs, hikes, always outdoors' }
    ]
  },
  {
    id: 'family',
    title: 'Tell us about your household',
    subtitle: "We'll make sure your match is safe and happy for everyone.",
    icon: Users,
    field: 'family',
    multi: true,
    options: [
      { value: 'hasChildren', label: 'Young children at home', emoji: '👶' },
      { value: 'hasOtherPets', label: 'Other pets at home', emoji: '🐾' },
      { value: 'hasOtherDogs', label: 'Dogs specifically', emoji: '🐕' },
      { value: 'hasOtherCats', label: 'Cats specifically', emoji: '🐈' }
    ]
  },
  {
    id: 'experience',
    title: 'How much pet experience do you have?',
    subtitle: 'Honest answers lead to better matches!',
    icon: Star,
    field: 'experienceLevel',
    options: [
      { value: 'first_time', label: 'First-time owner', emoji: '🌱', desc: "This is my first pet" },
      { value: 'some_experience', label: 'Some experience', emoji: '🌿', desc: "I've had a pet before" },
      { value: 'experienced', label: 'Experienced', emoji: '🌳', desc: "I've had multiple pets" }
    ]
  },
  {
    id: 'preference',
    title: 'Any preferences?',
    subtitle: "Optional — leave as 'Any' if you're open to all options.",
    icon: Heart,
    field: 'preference',
    multi: true,
    selects: [
      {
        label: 'Species',
        field: 'preferredSpecies',
        options: [
          { value: 'any', label: 'Any' },
          { value: 'dog', label: 'Dog 🐕' },
          { value: 'cat', label: 'Cat 🐈' },
          { value: 'bird', label: 'Bird 🐦' },
          { value: 'rabbit', label: 'Rabbit 🐇' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        label: 'Size',
        field: 'preferredSize',
        options: [
          { value: 'any', label: 'Any' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      {
        label: 'Age',
        field: 'preferredAge',
        options: [
          { value: 'any', label: 'Any' },
          { value: 'young', label: 'Young (under 1 yr)' },
          { value: 'adult', label: 'Adult' },
          { value: 'senior', label: 'Senior (7+ yrs)' }
        ]
      }
    ]
  },
  {
    id: 'location',
    title: 'Where are you located?',
    subtitle: "We'll prioritise pets near you.",
    icon: PawPrint,
    field: 'location',
    locationInput: true
  }
];

function MatchScoreBar({ score }) {
  const pct = Math.min(100, Math.round(score));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 45 ? 'bg-yellow-500' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-muted-foreground w-8">{pct}%</span>
    </div>
  );
}

function PetMatchCard({ pet }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative h-44 overflow-hidden bg-muted">
        {pet.primaryImage ? (
          <img src={pet.primaryImage} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PawPrint className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/60 text-white border-0 text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-yellow-400" />
            {Math.round(pet.matchScore)}% match
          </Badge>
        </div>
        {pet.isUrgent && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs">Urgent</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-base">{pet.name}</h3>
          <span className="text-xs text-muted-foreground capitalize">{pet.gender}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {pet.breed || pet.species} • {pet.size || 'unknown size'} • {
            pet.age ? `${pet.age} ${pet.ageUnit}` : 'Age unknown'
          }
        </p>
        <MatchScoreBar score={pet.matchScore} />
        <div className="flex gap-1 flex-wrap">
          {pet.goodWithKids && <Badge variant="outline" className="text-xs">Good with kids</Badge>}
          {pet.goodWithPets && <Badge variant="outline" className="text-xs">Good with pets</Badge>}
          {pet.houseTrained && <Badge variant="outline" className="text-xs">House trained</Badge>}
          {pet.isVaccinated && <Badge variant="outline" className="text-xs">Vaccinated</Badge>}
        </div>
        <Link href={`/pets/${pet.id}`}>
          <Button className="w-full mt-1" size="sm">
            Meet {pet.name} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function MatchPage() {
  const { user } = useSelector(state => state.auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    livingSpace: '',
    activityLevel: '',
    hasChildren: false,
    hasOtherPets: false,
    hasOtherDogs: false,
    hasOtherCats: false,
    experienceLevel: '',
    preferredSpecies: 'any',
    preferredSize: 'any',
    preferredAge: 'any',
    city: user?.city || '',
    state: user?.state || ''
  });
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const setAnswer = (field, value) => setAnswers(a => ({ ...a, [field]: value }));
  const toggleMulti = (field) => setAnswers(a => ({ ...a, [field]: !a[field] }));

  const canAdvance = () => {
    const s = STEPS[currentStep];
    if (s.field === 'living') return !!answers.livingSpace;
    if (s.field === 'activity') return !!answers.activityLevel;
    if (s.field === 'experience') return !!answers.experienceLevel;
    return true; // family, preference, location are optional
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      runMatch();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const runMatch = async () => {
    setLoading(true);
    try {
      const payload = {
        livingSpace: answers.livingSpace,
        activityLevel: answers.activityLevel,
        hasChildren: answers.hasChildren,
        hasOtherPets: answers.hasOtherPets,
        hasOtherDogs: answers.hasOtherDogs,
        hasOtherCats: answers.hasOtherCats,
        experienceLevel: answers.experienceLevel,
        preferredSpecies: answers.preferredSpecies !== 'any' ? answers.preferredSpecies : undefined,
        preferredSize: answers.preferredSize !== 'any' ? answers.preferredSize : undefined,
        preferredAge: answers.preferredAge !== 'any' ? answers.preferredAge : undefined,
        city: answers.city || undefined,
        state: answers.state || undefined
      };

      const res = await apiWrapper.post('/pets/match/quiz', payload);
      if (res.success) {
        setMatches(res.data.data.matches || []);
        setQuizDone(true);
      } else {
        toast.error(res.error || 'Matching failed. Please try again.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizDone(false);
    setMatches(null);
    setCurrentStep(0);
    setAnswers({
      livingSpace: '', activityLevel: '', hasChildren: false, hasOtherPets: false,
      hasOtherDogs: false, hasOtherCats: false, experienceLevel: '',
      preferredSpecies: 'any', preferredSize: 'any', preferredAge: 'any',
      city: user?.city || '', state: user?.state || ''
    });
  };

  // ---- Results screen ----
  if (quizDone) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Your Perfect Matches</h1>
          <p className="text-muted-foreground">
            We found <strong>{matches.length}</strong> pet{matches.length !== 1 ? 's' : ''} that suit your lifestyle.
          </p>
          <Button variant="outline" size="sm" onClick={resetQuiz}>
            Retake Quiz
          </Button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <PawPrint className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No matches found nearby</h3>
            <p className="text-muted-foreground text-sm">Try broadening your preferences or changing the location.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetQuiz}>Retake Quiz</Button>
              <Link href="/pets"><Button variant="outline">Browse All Pets</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {matches.map(pet => <PetMatchCard key={pet.id} pet={pet} />)}
          </div>
        )}
      </div>
    );
  }

  // ---- Quiz screen ----
  const StepIcon = step.icon;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Find Your Perfect Pet</h1>
        <p className="text-muted-foreground text-sm">Answer a few questions and we'll match you with the ideal companion.</p>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">{step.title}</h2>
              <p className="text-muted-foreground text-sm">{step.subtitle}</p>
            </div>
          </div>

          {/* Single-choice options */}
          {step.options && !step.multi && (
            <div className="space-y-2">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAnswer(step.field, opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    answers[step.field] === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    {opt.desc && <p className="text-xs text-muted-foreground">{opt.desc}</p>}
                  </div>
                  {answers[step.field] === opt.value && (
                    <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Multi-toggle options (family step) */}
          {step.multi && step.options && (
            <div className="grid grid-cols-2 gap-2">
              {step.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleMulti(opt.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    answers[opt.value]
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mb-1">{opt.emoji}</span>
                  <span className="text-xs font-medium text-center">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Select dropdowns (preference step) */}
          {step.selects && (
            <div className="space-y-3">
              {step.selects.map(sel => (
                <div key={sel.field} className="space-y-1">
                  <label className="text-sm font-medium">{sel.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {sel.options.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(sel.field, opt.value)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          answers[sel.field] === opt.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Location input */}
          {step.locationInput && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="e.g. Mumbai"
                  value={answers.city}
                  onChange={e => setAnswer('city', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="e.g. Maharashtra"
                  value={answers.state}
                  onChange={e => setAnswer('state', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canAdvance() || loading}
          className="flex-1"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding matches...</>
          ) : currentStep === STEPS.length - 1 ? (
            <><Sparkles className="h-4 w-4 mr-2" /> Find My Matches</>
          ) : (
            <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
