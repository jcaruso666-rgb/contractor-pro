import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPricing } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';

interface Props {
  onAddToProject?: (items: CalculatorResult[]) => void;
  initialSqFt?: number;
}

type RoofingMaterial = 'shingles' | 'metal' | 'tile';

export function RoofingCalculator({ onAddToProject, initialSqFt = 0 }: Props) {
  const pricing = getPricing();
  
  const [squareFeet, setSquareFeet] = useState(initialSqFt.toString());
  const [pitch, setPitch] = useState('4');
  const [material, setMaterial] = useState<RoofingMaterial>('shingles');
  const [wasteFactor, setWasteFactor] = useState('15');

  // Calculate pitch factor (roof area multiplier based on pitch)
  const pitchMultipliers: Record<string, number> = {
    '1': 1.003, '2': 1.014, '3': 1.031, '4': 1.054,
    '5': 1.083, '6': 1.118, '7': 1.157, '8': 1.202,
    '9': 1.250, '10': 1.302, '11': 1.356, '12': 1.414,
  };

  const baseArea = parseFloat(squareFeet) || 0;
  const pitchFactor = pitchMultipliers[pitch] || 1.054;
  const wastePercent = parseFloat(wasteFactor) || 15;
  
  const actualRoofArea = baseArea * pitchFactor;
  const roofSquares = actualRoofArea / 100; // 1 square = 100 sq ft
  const materialWithWaste = roofSquares * (1 + wastePercent / 100);
  
  const materialPrice = pricing.roofing[material].default;
  const materialCost = materialWithWaste * materialPrice;
  
  // Labor: estimate 1.5-2 hours per square depending on material
  const laborHoursPerSquare = material === 'tile' ? 3 : material === 'metal' ? 2 : 1.5;
  const laborHours = materialWithWaste * laborHoursPerSquare;
  const laborCost = laborHours * pricing.roofing.laborRate;
  
  // Additional materials
  const underlaymentRolls = Math.ceil(roofSquares / 4); // 4 squares per roll
  const underlaymentCost = underlaymentRolls * 45;
  
  const ridgeCapsNeeded = Math.ceil(actualRoofArea / 500); // estimate
  const ridgeCapCost = ridgeCapsNeeded * 35;
  
  const nailsBoxes = Math.ceil(materialWithWaste / 3);
  const nailsCost = nailsBoxes * 25;
  
  const totalMaterialCost = materialCost + underlaymentCost + ridgeCapCost + nailsCost;
  const totalCost = totalMaterialCost + laborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [
      {
        description: `${material.charAt(0).toUpperCase() + material.slice(1)} Roofing (${materialWithWaste.toFixed(1)} squares)`,
        quantity: parseFloat(materialWithWaste.toFixed(1)),
        unit: 'squares',
        unitPrice: materialPrice,
        total: materialCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Underlayment',
        quantity: underlaymentRolls,
        unit: 'rolls',
        unitPrice: 45,
        total: underlaymentCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Ridge Caps',
        quantity: ridgeCapsNeeded,
        unit: 'pcs',
        unitPrice: 35,
        total: ridgeCapCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Installation Labor',
        quantity: parseFloat(laborHours.toFixed(1)),
        unit: 'hours',
        unitPrice: pricing.roofing.laborRate,
        total: laborCost,
        laborHours: laborHours,
        laborRate: pricing.roofing.laborRate,
        laborCost: laborCost,
      },
    ];
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Roofing Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-slate-400">Floor Square Footage</Label>
            <Input
              type="number"
              value={squareFeet}
              onChange={(e) => setSquareFeet(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="2000"
            />
          </div>
          <div>
            <Label className="text-slate-400">Roof Pitch</Label>
            <select
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              {Object.keys(pitchMultipliers).map(p => (
                <option key={p} value={p}>{p}/12</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Material</Label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as RoofingMaterial)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="shingles">Asphalt Shingles (${pricing.roofing.shingles.default}/sq)</option>
              <option value="metal">Metal Roofing (${pricing.roofing.metal.default}/sq)</option>
              <option value="tile">Tile Roofing (${pricing.roofing.tile.default}/sq)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Waste Factor %</Label>
            <Input
              type="number"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="15"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Actual Roof Area</p>
              <p className="text-lg font-semibold text-white">{actualRoofArea.toFixed(0)} sq ft</p>
            </div>
            <div>
              <p className="text-slate-400">Roofing Squares</p>
              <p className="text-lg font-semibold text-white">{roofSquares.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-slate-400">With Waste ({wastePercent}%)</p>
              <p className="text-lg font-semibold text-white">{materialWithWaste.toFixed(1)} squares</p>
            </div>
            <div>
              <p className="text-slate-400">Est. Labor Hours</p>
              <p className="text-lg font-semibold text-white">{laborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{material.charAt(0).toUpperCase() + material.slice(1)} ({materialWithWaste.toFixed(1)} sq × ${materialPrice})</span>
              <span className="text-white">${materialCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Underlayment ({underlaymentRolls} rolls)</span>
              <span className="text-white">${underlaymentCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ridge Caps ({ridgeCapsNeeded} pcs)</span>
              <span className="text-white">${ridgeCapCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Nails ({nailsBoxes} boxes)</span>
              <span className="text-white">${nailsCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({laborHours.toFixed(1)} hrs × ${pricing.roofing.laborRate}/hr)</span>
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
