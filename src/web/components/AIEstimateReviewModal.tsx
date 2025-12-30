import { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectCategory, CalculatorResult, CategoryType } from '@/lib/types';

interface AIEstimateItem extends CalculatorResult {
  selected: boolean;
  editing: boolean;
}

interface AICategory {
  type: CategoryType;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  items: AIEstimateItem[];
  selected: boolean;
}

interface AIEstimateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProjectCategory[];
  propertyAnalysis?: {
    estimatedAge: number;
    estimatedSqFt: number;
    estimatedRoofArea: number;
    estimatedPerimeter: number;
    propertyType: string;
    notes: string;
  };
  onAccept: (categories: ProjectCategory[]) => void;
  onRegenerate: () => void;
}

const confidenceConfig = {
  high: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'High Confidence' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle, label: 'Medium Confidence' },
  low: { color: 'text-red-400', bg: 'bg-red-500/10', icon: HelpCircle, label: 'Low Confidence' },
};

export function AIEstimateReviewModal({
  isOpen,
  onClose,
  categories,
  propertyAnalysis,
  onAccept,
  onRegenerate,
}: AIEstimateReviewModalProps) {
  const [reviewCategories, setReviewCategories] = useState<AICategory[]>([]);

  useEffect(() => {
    // Convert incoming categories to review format with selection state
    const converted: AICategory[] = categories.map(cat => ({
      type: cat.type,
      confidence: cat.confidence || 'medium',
      reasoning: cat.reasoning || '',
      selected: true,
      items: cat.items.map(item => ({
        ...item,
        selected: true,
        editing: false,
      })),
    }));
    setReviewCategories(converted);
  }, [categories]);

  const toggleCategory = (catIndex: number) => {
    setReviewCategories(prev => prev.map((cat, idx) => 
      idx === catIndex 
        ? { ...cat, selected: !cat.selected, items: cat.items.map(item => ({ ...item, selected: !cat.selected })) }
        : cat
    ));
  };

  const toggleItem = (catIndex: number, itemIndex: number) => {
    setReviewCategories(prev => prev.map((cat, cIdx) => 
      cIdx === catIndex 
        ? {
            ...cat,
            items: cat.items.map((item, iIdx) => 
              iIdx === itemIndex ? { ...item, selected: !item.selected } : item
            ),
            selected: cat.items.filter((_, iIdx) => iIdx === itemIndex ? !cat.items[itemIndex].selected : cat.items[iIdx].selected).some(i => i.selected)
          }
        : cat
    ));
  };

  const toggleEditItem = (catIndex: number, itemIndex: number) => {
    setReviewCategories(prev => prev.map((cat, cIdx) => 
      cIdx === catIndex 
        ? {
            ...cat,
            items: cat.items.map((item, iIdx) => 
              iIdx === itemIndex ? { ...item, editing: !item.editing } : item
            )
          }
        : cat
    ));
  };

  const updateItem = (catIndex: number, itemIndex: number, field: keyof AIEstimateItem, value: number | string) => {
    setReviewCategories(prev => prev.map((cat, cIdx) => 
      cIdx === catIndex 
        ? {
            ...cat,
            items: cat.items.map((item, iIdx) => {
              if (iIdx !== itemIndex) return item;
              const updated = { ...item, [field]: value };
              // Recalculate totals if quantity or price changed
              if (field === 'quantity' || field === 'unitPrice' || field === 'laborHours' || field === 'laborRate') {
                const materialCost = updated.quantity * updated.unitPrice;
                const laborCost = updated.laborHours * updated.laborRate;
                updated.total = materialCost + laborCost;
                updated.laborCost = laborCost;
              }
              return updated;
            })
          }
        : cat
    ));
  };

  const handleAcceptSelected = () => {
    const selectedCategories: ProjectCategory[] = reviewCategories
      .filter(cat => cat.items.some(item => item.selected))
      .map(cat => ({
        type: cat.type,
        confidence: cat.confidence,
        reasoning: cat.reasoning,
        items: cat.items
          .filter(item => item.selected)
          .map(({ selected, editing, ...item }) => item),
        subtotal: cat.items
          .filter(item => item.selected)
          .reduce((sum, item) => sum + item.total, 0),
      }));
    
    onAccept(selectedCategories);
    onClose();
  };

  const handleAcceptAll = () => {
    // Select all items first
    setReviewCategories(prev => prev.map(cat => ({
      ...cat,
      selected: true,
      items: cat.items.map(item => ({ ...item, selected: true }))
    })));
    
    setTimeout(() => {
      const allCategories: ProjectCategory[] = reviewCategories.map(cat => ({
        type: cat.type,
        confidence: cat.confidence,
        reasoning: cat.reasoning,
        items: cat.items.map(({ selected, editing, ...item }) => item),
        subtotal: cat.items.reduce((sum, item) => sum + item.total, 0),
      }));
      
      onAccept(allCategories);
      onClose();
    }, 100);
  };

  const totalSelected = reviewCategories.reduce((sum, cat) => 
    sum + cat.items.filter(i => i.selected).reduce((s, i) => s + i.total, 0), 0
  );

  const totalAll = reviewCategories.reduce((sum, cat) => 
    sum + cat.items.reduce((s, i) => s + i.total, 0), 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">AI Estimate Review</DialogTitle>
              <p className="text-sm text-slate-400 mt-1">
                Review and customize the AI-generated estimate before accepting
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Property Analysis Summary */}
        {propertyAnalysis && (
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mx-1 mt-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Property Analysis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Est. Age:</span>
                <span className="text-white ml-2">{propertyAnalysis.estimatedAge} years</span>
              </div>
              <div>
                <span className="text-slate-500">Est. Sq Ft:</span>
                <span className="text-white ml-2">{propertyAnalysis.estimatedSqFt.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500">Roof Area:</span>
                <span className="text-white ml-2">{propertyAnalysis.estimatedRoofArea.toLocaleString()} sq ft</span>
              </div>
              <div>
                <span className="text-slate-500">Type:</span>
                <span className="text-white ml-2 capitalize">{propertyAnalysis.propertyType.replace('_', ' ')}</span>
              </div>
            </div>
            {propertyAnalysis.notes && (
              <p className="text-sm text-slate-400 mt-2 italic">"{propertyAnalysis.notes}"</p>
            )}
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mx-1 mt-2 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            These are AI-generated suggestions. Please verify all items and costs with an on-site inspection.
          </p>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 px-1">
          {reviewCategories.map((category, catIndex) => {
            const config = confidenceConfig[category.confidence];
            const Icon = config.icon;
            
            return (
              <div key={category.type} className="border border-slate-700 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    category.selected ? 'bg-slate-800' : 'bg-slate-800/50'
                  }`}
                  onClick={() => toggleCategory(catIndex)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      category.selected 
                        ? 'bg-violet-500 border-violet-500' 
                        : 'border-slate-500'
                    }`}>
                      {category.selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-white font-medium capitalize">{category.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${config.bg} ${config.color}`}>
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    ${category.items.filter(i => i.selected).reduce((s, i) => s + i.total, 0).toLocaleString()}
                  </span>
                </div>

                {/* Category Reasoning */}
                {category.reasoning && (
                  <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50 text-sm text-slate-400">
                    {category.reasoning}
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-slate-700/50">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className={`p-3 transition-colors ${
                        item.selected ? 'bg-slate-800/30' : 'bg-slate-900/50 opacity-60'
                      }`}
                    >
                      {item.editing ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(catIndex, itemIndex, 'description', e.target.value)}
                              className="flex-1 bg-slate-900 border-slate-600 text-white text-sm"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleEditItem(catIndex, itemIndex)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <Label className="text-xs text-slate-500">Quantity</Label>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(catIndex, itemIndex, 'quantity', parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Unit Price</Label>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(catIndex, itemIndex, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Labor Hours</Label>
                              <Input
                                type="number"
                                value={item.laborHours}
                                onChange={(e) => updateItem(catIndex, itemIndex, 'laborHours', parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500">Labor Rate</Label>
                              <Input
                                type="number"
                                value={item.laborRate}
                                onChange={(e) => updateItem(catIndex, itemIndex, 'laborRate', parseFloat(e.target.value) || 0)}
                                className="bg-slate-900 border-slate-600 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(catIndex, itemIndex);
                            }}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                              item.selected 
                                ? 'bg-violet-500 border-violet-500' 
                                : 'border-slate-500'
                            }`}
                          >
                            {item.selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{item.description}</div>
                            <div className="text-xs text-slate-400">
                              {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)} + {item.laborHours}hrs @ ${item.laborRate}/hr
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEditItem(catIndex, itemIndex);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-white font-medium whitespace-nowrap">
                            ${item.total.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-400">
              <span>Selected Total: </span>
              <span className="text-lg font-bold text-violet-400">${totalSelected.toLocaleString()}</span>
              <span className="text-slate-500 ml-2">(All: ${totalAll.toLocaleString()})</span>
            </div>
          </div>
          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={onRegenerate}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptSelected}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                <Check className="w-4 h-4" />
                Accept Selected
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
