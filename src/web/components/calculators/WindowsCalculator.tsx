import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPricing } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';

interface Props {
  onAddToProject?: (items: CalculatorResult[]) => void;
}

type WindowType = 'singleHung' | 'doubleHung' | 'casement' | 'sliding';

interface WindowEntry {
  id: string;
  type: WindowType;
  width: string;
  height: string;
  quantity: number;
}

const windowTypeLabels: Record<WindowType, string> = {
  singleHung: 'Single Hung',
  doubleHung: 'Double Hung',
  casement: 'Casement',
  sliding: 'Sliding',
};

export function WindowsCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [windows, setWindows] = useState<WindowEntry[]>([
    { id: '1', type: 'doubleHung', width: '36', height: '48', quantity: 1 }
  ]);

  const addWindow = () => {
    setWindows([
      ...windows,
      { id: Date.now().toString(), type: 'doubleHung', width: '36', height: '48', quantity: 1 }
    ]);
  };

  const removeWindow = (id: string) => {
    if (windows.length > 1) {
      setWindows(windows.filter(w => w.id !== id));
    }
  };

  const updateWindow = (id: string, field: keyof WindowEntry, value: string | number | WindowType) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  // Size factor for pricing (larger windows cost more)
  const getSizeFactor = (width: number, height: number) => {
    const area = width * height;
    if (area <= 1200) return 0.8; // Small window
    if (area <= 2000) return 1.0; // Standard
    if (area <= 3000) return 1.3; // Large
    return 1.6; // Extra large
  };

  const calculations = windows.map(w => {
    const width = parseFloat(w.width) || 0;
    const height = parseFloat(w.height) || 0;
    const basePrice = pricing.windows[w.type].default;
    const sizeFactor = getSizeFactor(width, height);
    const pricePerWindow = basePrice * sizeFactor;
    const installHours = pricing.windows.installationHours * (sizeFactor > 1 ? 1.5 : 1);
    const laborPerWindow = installHours * pricing.windows.laborRate;
    
    return {
      ...w,
      pricePerWindow,
      installHours,
      laborPerWindow,
      totalMaterial: pricePerWindow * w.quantity,
      totalLabor: laborPerWindow * w.quantity,
      total: (pricePerWindow + laborPerWindow) * w.quantity,
    };
  });

  const totalWindows = calculations.reduce((sum, c) => sum + c.quantity, 0);
  const totalMaterialCost = calculations.reduce((sum, c) => sum + c.totalMaterial, 0);
  const totalLaborCost = calculations.reduce((sum, c) => sum + c.totalLabor, 0);
  const totalLaborHours = calculations.reduce((sum, c) => sum + (c.installHours * c.quantity), 0);
  const grandTotal = totalMaterialCost + totalLaborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = calculations.map(c => ({
      description: `${windowTypeLabels[c.type]} Window ${c.width}"×${c.height}" (qty: ${c.quantity})`,
      quantity: c.quantity,
      unit: 'windows',
      unitPrice: c.pricePerWindow,
      total: c.totalMaterial,
      laborHours: c.installHours * c.quantity,
      laborRate: pricing.windows.laborRate,
      laborCost: c.totalLabor,
    }));
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Windows Calculator</CardTitle>
        <Button 
          size="sm" 
          onClick={addWindow}
          className="bg-sky-500 hover:bg-sky-600 text-white gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Window
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Window Entries */}
        <div className="space-y-4">
          {windows.map((window, idx) => (
            <div key={window.id} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Window #{idx + 1}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeWindow(window.id)}
                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                  disabled={windows.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs text-slate-400">Type</Label>
                  <select
                    value={window.type}
                    onChange={(e) => updateWindow(window.id, 'type', e.target.value as WindowType)}
                    className="mt-1 w-full h-9 px-2 text-sm bg-slate-800 border border-slate-700 rounded-md text-white"
                  >
                    {Object.entries(windowTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Width (in)</Label>
                  <Input
                    type="number"
                    value={window.width}
                    onChange={(e) => updateWindow(window.id, 'width', e.target.value)}
                    className="mt-1 h-9 text-sm bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Height (in)</Label>
                  <Input
                    type="number"
                    value={window.height}
                    onChange={(e) => updateWindow(window.id, 'height', e.target.value)}
                    className="mt-1 h-9 text-sm bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Quantity</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateWindow(window.id, 'quantity', Math.max(1, window.quantity - 1))}
                      className="h-9 w-9 border-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-white">{window.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateWindow(window.id, 'quantity', window.quantity + 1)}
                      className="h-9 w-9 border-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <div>
                    <Label className="text-xs text-slate-400">Subtotal</Label>
                    <p className="mt-1 text-lg font-semibold text-sky-400">
                      ${calculations[idx].total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sky-400">Summary</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Total Windows</p>
              <p className="text-lg font-semibold text-white">{totalWindows}</p>
            </div>
            <div>
              <p className="text-slate-400">Materials</p>
              <p className="text-lg font-semibold text-white">${totalMaterialCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Labor ({totalLaborHours.toFixed(1)} hrs)</p>
              <p className="text-lg font-semibold text-white">${totalLaborCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Estimate</p>
              <p className="text-xl font-bold text-sky-400">${grandTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {onAddToProject && (
          <Button 
            onClick={handleAddToProject}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            Add to Project Estimate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
