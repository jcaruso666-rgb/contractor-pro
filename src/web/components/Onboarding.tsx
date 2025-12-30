import { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  Calculator,
  FileText,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'contractor_pro_onboarding_complete';

const steps = [
  {
    title: 'Welcome to ContractorPro!',
    description: 'Your all-in-one solution for creating professional contractor estimates. Let\'s take a quick tour of the key features.',
    icon: LayoutDashboard,
  },
  {
    title: 'Start with an Address',
    description: 'Enter any property address on the dashboard to automatically fetch property dimensions. This saves you time measuring and helps create accurate estimates.',
    icon: MapPin,
  },
  {
    title: 'Calculate with Precision',
    description: 'Use our 8 specialized calculators for roofing, windows, gutters, siding, doors, painting, concrete, and fencing. Each calculator factors in materials, waste, and labor costs.',
    icon: Calculator,
  },
  {
    title: 'Generate Professional Reports',
    description: 'Export your estimates as polished PDF documents with your company branding, payment terms, and signature lines. Perfect for client presentations.',
    icon: FileText,
  },
  {
    title: 'You\'re Ready!',
    description: 'All your data is saved locally. Use Settings to customize pricing for your market, manage clients, and backup your data. Happy estimating!',
    icon: CheckCircle2,
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShow(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === step ? 'bg-sky-500' : idx < step ? 'bg-sky-500/50' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-sky-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            {currentStep.title}
          </h2>
          
          <p className="text-slate-400 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-400 hover:text-white"
          >
            Skip Tour
          </Button>
          
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {isLast ? (
              <Button
                onClick={handleComplete}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                Get Started
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reset onboarding (for testing)
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
