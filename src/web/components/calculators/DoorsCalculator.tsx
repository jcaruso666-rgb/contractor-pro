import { useState } from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPricing } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';

interface Props {
  onAddToProject?: (items: CalculatorResult[]) => void;
}

interface DoorEntry {
  id: string;
  type: 'exterior' | 'interior';
  style: string;
  quantity: number;
  includeHardware: boolean;
}

const doorStyles = {
  exterior: [
    { value: 'standard', label: 'Standard Entry', priceFactor: 1 },
    { value: 'steel', label: 'Steel Security', priceFactor: 1.2 },
    { value: 'fiberglass', label: 'Fiberglass', priceFactor: 1.4 },
    { value: 'french', label: 'French Doors', priceFactor: 2.5 },
    { value: 'sliding', label: 'Sliding Patio', priceFactor: 2.2 },
  ],
  interior: [
    { value: 'hollow', label: 'Hollow Core', priceFactor: 0.6 },
    { value: 'solid', label: 'Solid Core', priceFactor: 1 },
    { value: 'paneled', label: '6-Panel', priceFactor: 1.1 },
    { value: 'french', label: 'Interior French', priceFactor: 1.8 },
    { value: 'barn', label: 'Barn Door', priceFactor: 2 },
  ],
};

export function DoorsCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [doors, setDoors] = useState<DoorEntry[]>([
    { id: '1', type: 'exterior', style: 'standard', quantity: 1, includeHardware: true }
  ]);

  const addDoor = () => {
    setDoors([
      ...doors,
      { id: Date.now().toString(), type: 'interior', style: 'solid', quantity: 1, includeHardware: true }
    ]);
  };

  const removeDoor = (id: string) => {
    if (doors.length > 1) {
      setDoors(doors.filter(d => d.id !== id));
    }
  };

  const updateDoor = (id: string, field: keyof DoorEntry, value: string | number | boolean) => {
    setDoors(doors.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculations = doors.map(door => {
    const basePrice = pricing.doors[door.type].default;
    const styleInfo = doorStyles[door.type].find(s => s.value === door.style);
    const priceFactor = styleInfo?.priceFactor || 1;
    const doorPrice = basePrice * priceFactor;
    
    const hardwareCost = door.includeHardware ? pricing.doors.hardware * door.quantity : 0;
    
    // Labor varies by door type
    const laborHours = (door.type === 'exterior' ? pricing.doors.installationHours : 1.5) * door.quantity;
    const laborCost = laborHours * pricing.doors.laborRate;
    
    return {
      ...door,
      styleLabel: styleInfo?.label || door.style,
      doorPrice,
      doorTotal: doorPrice * door.quantity,
      hardwareCost,
      laborHours,
      laborCost,
      total: (doorPrice * door.quantity) + hardwareCost + laborCost,
    };
  });

  const totalDoors = calculations.reduce((sum, c) => sum + c.quantity, 0);
  const totalMaterialCost = calculations.reduce((sum, c) => sum + c.doorTotal + c.hardwareCost, 0);
  const totalLaborHours = calculations.reduce((sum, c) => sum + c.laborHours, 0);
  const totalLaborCost = calculations.reduce((sum, c) => sum + c.laborCost, 0);
  const grandTotal = totalMaterialCost + totalLaborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = calculations.map(c => ({
      description: `${c.type.charAt(0).toUpperCase() + c.type.slice(1)} Door - ${c.styleLabel} (qty: ${c.quantity})`,
      quantity: c.quantity,
      unit: 'doors',
      unitPrice: c.doorPrice + (c.includeHardware ? pricing.doors.hardware : 0),
      total: c.doorTotal + c.hardwareCost,
      laborHours: c.laborHours,
      laborRate: pricing.doors.laborRate,
      laborCost: c.laborCost,
    }));
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Doors Calculator</CardTitle>
        <Button 
          size="sm" 
          onClick={addDoor}
          className="bg-sky-500 hover:bg-sky-600 text-white gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Door
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Door Entries */}
        <div className="space-y-4">
          {doors.map((door, idx) => (
            <div key={door.id} className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">Door #{idx + 1}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeDoor(door.id)}
                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                  disabled={doors.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-slate-400">Type</Label>
                  <select
                    value={door.type}
                    onChange={(e) => {
                      updateDoor(door.id, 'type', e.target.value as 'exterior' | 'interior');
                      updateDoor(door.id, 'style', doorStyles[e.target.value as 'exterior' | 'interior'][0].value);
                    }}
                    className="mt-1 w-full h-9 px-2 text-sm bg-slate-800 border border-slate-700 rounded-md text-white"
                  >
                    <option value="exterior">Exterior</option>
                    <option value="interior">Interior</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Style</Label>
                  <select
                    value={door.style}
                    onChange={(e) => updateDoor(door.id, 'style', e.target.value)}
                    className="mt-1 w-full h-9 px-2 text-sm bg-slate-800 border border-slate-700 rounded-md text-white"
                  >
                    {doorStyles[door.type].map(style => (
                      <option key={style.value} value={style.value}>{style.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400">Quantity</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateDoor(door.id, 'quantity', Math.max(1, door.quantity - 1))}
                      className="h-9 w-9 border-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-white">{door.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateDoor(door.id, 'quantity', door.quantity + 1)}
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

              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={door.includeHardware}
                  onChange={(e) => updateDoor(door.id, 'includeHardware', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500"
                />
                <span className="text-sm text-slate-400">Include hardware (+${pricing.doors.hardware}/door)</span>
              </label>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-sky-400">Summary</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Total Doors</p>
              <p className="text-lg font-semibold text-white">{totalDoors}</p>
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
