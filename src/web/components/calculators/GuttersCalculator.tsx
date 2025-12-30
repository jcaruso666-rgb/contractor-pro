import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPricing } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';

interface Props {
  onAddToProject?: (items: CalculatorResult[]) => void;
  initialPerimeter?: number;
}

type GutterMaterial = 'aluminum' | 'copper' | 'vinyl';

export function GuttersCalculator({ onAddToProject, initialPerimeter = 0 }: Props) {
  const pricing = getPricing();
  
  const [linearFeet, setLinearFeet] = useState(initialPerimeter.toString());
  const [material, setMaterial] = useState<GutterMaterial>('aluminum');
  const [downspouts, setDownspouts] = useState('4');
  const [corners, setCorners] = useState('4');
  const [gutterGuards, setGutterGuards] = useState(false);

  const feet = parseFloat(linearFeet) || 0;
  const downspoutCount = parseInt(downspouts) || 0;
  const cornerCount = parseInt(corners) || 0;
  
  // Gutter materials
  const gutterPrice = pricing.gutters[material].default;
  const gutterCost = feet * gutterPrice;
  
  // Downspouts (10 ft each typically)
  const downspoutLength = 10;
  const downspoutCost = downspoutCount * pricing.gutters.downspout;
  
  // Corners
  const cornerCost = cornerCount * pricing.gutters.corner;
  
  // Hangers (1 every 2 feet)
  const hangersNeeded = Math.ceil(feet / 2);
  const hangerCost = hangersNeeded * 3; // $3 per hanger
  
  // End caps (2 per run minimum)
  const endCaps = Math.max(4, Math.ceil(feet / 50) * 2);
  const endCapCost = endCaps * 5;
  
  // Gutter guards (optional)
  const guardCost = gutterGuards ? feet * 6 : 0; // $6 per linear foot
  
  // Labor: approximately 0.5 hours per 10 linear feet
  const laborHours = (feet / 10) * 0.5 + downspoutCount * 0.5;
  const laborCost = laborHours * pricing.gutters.laborRate;
  
  const totalMaterialCost = gutterCost + downspoutCost + cornerCost + hangerCost + endCapCost + guardCost;
  const totalCost = totalMaterialCost + laborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [
      {
        description: `${material.charAt(0).toUpperCase() + material.slice(1)} Gutters (${feet} lin ft)`,
        quantity: feet,
        unit: 'lin ft',
        unitPrice: gutterPrice,
        total: gutterCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: `Downspouts (${downspoutCount} pcs)`,
        quantity: downspoutCount,
        unit: 'pcs',
        unitPrice: pricing.gutters.downspout,
        total: downspoutCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Corners, Hangers & End Caps',
        quantity: 1,
        unit: 'lot',
        unitPrice: cornerCost + hangerCost + endCapCost,
        total: cornerCost + hangerCost + endCapCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
    ];
    
    if (gutterGuards) {
      items.push({
        description: 'Gutter Guards',
        quantity: feet,
        unit: 'lin ft',
        unitPrice: 6,
        total: guardCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }
    
    items.push({
      description: 'Installation Labor',
      quantity: parseFloat(laborHours.toFixed(1)),
      unit: 'hours',
      unitPrice: pricing.gutters.laborRate,
      total: laborCost,
      laborHours,
      laborRate: pricing.gutters.laborRate,
      laborCost,
    });
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Gutters Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-slate-400">Linear Feet</Label>
            <Input
              type="number"
              value={linearFeet}
              onChange={(e) => setLinearFeet(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="150"
            />
          </div>
          <div>
            <Label className="text-slate-400">Material</Label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as GutterMaterial)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="aluminum">Aluminum (${pricing.gutters.aluminum.default}/ft)</option>
              <option value="copper">Copper (${pricing.gutters.copper.default}/ft)</option>
              <option value="vinyl">Vinyl (${pricing.gutters.vinyl.default}/ft)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Downspouts</Label>
            <Input
              type="number"
              value={downspouts}
              onChange={(e) => setDownspouts(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
          <div>
            <Label className="text-slate-400">Corners</Label>
            <Input
              type="number"
              value={corners}
              onChange={(e) => setCorners(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
        </div>

        {/* Gutter Guards Option */}
        <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={gutterGuards}
            onChange={(e) => setGutterGuards(e.target.checked)}
            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500"
          />
          <div>
            <span className="text-white font-medium">Include Gutter Guards</span>
            <span className="text-slate-400 text-sm ml-2">(+$6/lin ft)</span>
          </div>
        </label>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Gutters</p>
              <p className="text-lg font-semibold text-white">{feet} lin ft</p>
            </div>
            <div>
              <p className="text-slate-400">Hangers</p>
              <p className="text-lg font-semibold text-white">{hangersNeeded}</p>
            </div>
            <div>
              <p className="text-slate-400">End Caps</p>
              <p className="text-lg font-semibold text-white">{endCaps}</p>
            </div>
            <div>
              <p className="text-slate-400">Labor Hours</p>
              <p className="text-lg font-semibold text-white">{laborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{material.charAt(0).toUpperCase() + material.slice(1)} Gutters ({feet} ft × ${gutterPrice})</span>
              <span className="text-white">${gutterCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Downspouts ({downspoutCount} pcs)</span>
              <span className="text-white">${downspoutCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Corners ({cornerCount} pcs)</span>
              <span className="text-white">${cornerCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Hangers & End Caps</span>
              <span className="text-white">${(hangerCost + endCapCost).toLocaleString()}</span>
            </div>
            {gutterGuards && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gutter Guards</span>
                <span className="text-white">${guardCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({laborHours.toFixed(1)} hrs × ${pricing.gutters.laborRate}/hr)</span>
              <span className="text-white">${laborCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-700">
              <span className="font-semibold text-white">Total Estimate</span>
              <span className="text-xl font-bold text-sky-400">${totalCost.toLocaleString()}</span>
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
