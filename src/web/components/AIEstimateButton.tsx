import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCategory, CalculatorResult, PropertyData, CategoryType } from '@/lib/types';
import { getSettings } from '@/lib/storage';
import { AIEstimateReviewModal } from './AIEstimateReviewModal';

export interface AIEstimateResult {
  propertyAnalysis: {
    estimatedAge: number;
    estimatedSqFt: number;
    estimatedRoofArea: number;
    estimatedPerimeter: number;
    propertyType: string;
    estimatedRegion?: string;
    climateFactors?: string;
    notes: string;
  };
  categories: Array<{
    type: CategoryType;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    items: Array<{
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      laborHours: number;
      laborRate: number;
    }>;
  }>;
}

interface AIEstimateButtonProps {
  address: string;
  propertyData?: PropertyData;
  onEstimateGenerated: (categories: ProjectCategory[], propertyAnalysis?: AIEstimateResult['propertyAnalysis']) => void;
}

const PROGRESS_MESSAGES = [
  { text: 'Analyzing property location...', duration: 1500 },
  { text: 'Determining property age...', duration: 2000 },
  { text: 'Evaluating climate factors...', duration: 2000 },
  { text: 'Calculating material needs...', duration: 2500 },
  { text: 'Estimating labor hours...', duration: 2000 },
  { text: 'Generating estimate...', duration: 3000 },
];

export function AIEstimateButton({ address, propertyData, onEstimateGenerated }: AIEstimateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingCategories, setPendingCategories] = useState<ProjectCategory[]>([]);
  const [pendingAnalysis, setPendingAnalysis] = useState<AIEstimateResult['propertyAnalysis'] | undefined>();

  const generateEstimate = async () => {
    if (!address.trim()) {
      setError('Please enter a property address first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgressIndex(0);

    // Progress animation
    let currentIndex = 0;
    const progressInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % PROGRESS_MESSAGES.length;
      setProgressIndex(currentIndex);
    }, 2000);

    try {
      // Get AI settings from localStorage if available
      const settings = getSettings();
      const aiSettings = settings?.aiSettings;

      const response = await fetch('/api/estimate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          propertyData,
          settings: aiSettings 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate estimate');
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Parse the JSON response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const result: AIEstimateResult = JSON.parse(jsonMatch[0]);

      // Convert AI result to ProjectCategory format
      const categories: ProjectCategory[] = result.categories.map(cat => ({
        type: cat.type,
        confidence: cat.confidence,
        reasoning: cat.reasoning,
        items: cat.items.map(item => {
          const materialCost = item.quantity * item.unitPrice;
          const laborCost = item.laborHours * item.laborRate;
          return {
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: materialCost + laborCost,
            laborHours: item.laborHours,
            laborRate: item.laborRate,
            laborCost: laborCost,
          } as CalculatorResult;
        }),
        subtotal: cat.items.reduce((sum, item) => {
          const materialCost = item.quantity * item.unitPrice;
          const laborCost = item.laborHours * item.laborRate;
          return sum + materialCost + laborCost;
        }, 0),
      }));

      clearInterval(progressInterval);
      
      // Store results and show review modal
      setPendingCategories(categories);
      setPendingAnalysis(result.propertyAnalysis);
      setShowReviewModal(true);
      
    } catch (err) {
      console.error('AI estimate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleAcceptEstimate = (categories: ProjectCategory[]) => {
    onEstimateGenerated(categories, pendingAnalysis);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleRegenerate = () => {
    setShowReviewModal(false);
    generateEstimate();
  };

  if (success) {
    return (
      <Button
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all"
        disabled
      >
        <CheckCircle className="w-4 h-4" />
        Estimate Generated!
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <Button
          onClick={generateEstimate}
          disabled={isGenerating || !address.trim()}
          className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="animate-pulse">{PROGRESS_MESSAGES[progressIndex].text}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Estimate
            </>
          )}
        </Button>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Review Modal */}
      <AIEstimateReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        categories={pendingCategories}
        propertyAnalysis={pendingAnalysis}
        onAccept={handleAcceptEstimate}
        onRegenerate={handleRegenerate}
      />
    </>
  );
}
