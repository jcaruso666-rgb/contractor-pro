import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPricing } from '@/lib/storage';
import { CalculatorResult } from '@/lib/types';

interface Props {
  onAddToProject?: (items: CalculatorResult[]) => void;
}

type SidingMaterial = 'vinyl' | 'fiberCement' | 'wood';

export function SidingCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [wallHeight, setWallHeight] = useState('9');
  const [perimeter, setPerimeter] = useState('150');
  const [windowDoors, setWindowDoors] = useState('200'); // sq ft to subtract
  const [material, setMaterial] = useState<SidingMaterial>('vinyl');
  const [corners, setCorners] = useState('4');
  const [wasteFactor, setWasteFactor] = useState('10');

  const height = parseFloat(wallHeight) || 9;
  const perim = parseFloat(perimeter) || 0;
  const openings = parseFloat(windowDoors) || 0;
  const cornerCount = parseInt(corners) || 0;
  const waste = parseFloat(wasteFactor) || 10;

  // Calculate wall area
  const grossArea = height * perim;
  const netArea = grossArea - openings;
  const areaWithWaste = netArea * (1 + waste / 100);

  // Siding squares (100 sq ft each for ordering)
  const sidingSquares = areaWithWaste / 100;

  // Material costs
  const sidingPrice = pricing.siding[material].default;
  const sidingCost = areaWithWaste * sidingPrice;

  // J-channel (around openings - estimate 3x the opening area in linear feet)
  const jChannelFeet = Math.sqrt(openings) * 8; // rough estimate
  const jChannelCost = jChannelFeet * pricing.siding.jChannel;

  // Corner pieces
  const cornerPiecesNeeded = Math.ceil((height / 10) * cornerCount * 2);
  const cornerCost = cornerPiecesNeeded * pricing.siding.corner;

  // Starter strip (bottom of walls)
  const starterStripFeet = perim;
  const starterStripCost = starterStripFeet * 1.5;

  // Labor: approximately 0.8 hours per 100 sq ft depending on material
  const laborMultiplier = material === 'fiberCement' ? 1.5 : material === 'wood' ? 1.3 : 1;
  const laborHours = (areaWithWaste / 100) * 0.8 * laborMultiplier;
  const laborCost = laborHours * pricing.siding.laborRate;

  const totalMaterialCost = sidingCost + jChannelCost + cornerCost + starterStripCost;
  const totalCost = totalMaterialCost + laborCost;

  const materialLabels: Record<SidingMaterial, string> = {
    vinyl: 'Vinyl',
    fiberCement: 'Fiber Cement (Hardie)',
    wood: 'Wood',
  };

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [
      {
        description: `${materialLabels[material]} Siding (${areaWithWaste.toFixed(0)} sq ft)`,
        quantity: parseFloat(areaWithWaste.toFixed(0)),
        unit: 'sq ft',
        unitPrice: sidingPrice,
        total: sidingCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'J-Channel & Trim',
        quantity: parseFloat(jChannelFeet.toFixed(0)),
        unit: 'lin ft',
        unitPrice: pricing.siding.jChannel,
        total: jChannelCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Corner Pieces',
        quantity: cornerPiecesNeeded,
        unit: 'pcs',
        unitPrice: pricing.siding.corner,
        total: cornerCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: 'Installation Labor',
        quantity: parseFloat(laborHours.toFixed(1)),
        unit: 'hours',
        unitPrice: pricing.siding.laborRate,
        total: laborCost,
        laborHours,
        laborRate: pricing.siding.laborRate,
        laborCost,
      },
    ];
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Siding Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-slate-400">Wall Height (ft)</Label>
            <Input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="9"
            />
          </div>
          <div>
            <Label className="text-slate-400">House Perimeter (lin ft)</Label>
            <Input
              type="number"
              value={perimeter}
              onChange={(e) => setPerimeter(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="150"
            />
          </div>
          <div>
            <Label className="text-slate-400">Window/Door Area (sq ft)</Label>
            <Input
              type="number"
              value={windowDoors}
              onChange={(e) => setWindowDoors(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="200"
            />
          </div>
          <div>
            <Label className="text-slate-400">Material</Label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as SidingMaterial)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="vinyl">Vinyl (${pricing.siding.vinyl.default}/sq ft)</option>
              <option value="fiberCement">Fiber Cement (${pricing.siding.fiberCement.default}/sq ft)</option>
              <option value="wood">Wood (${pricing.siding.wood.default}/sq ft)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Outside Corners</Label>
            <Input
              type="number"
              value={corners}
              onChange={(e) => setCorners(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
          <div>
            <Label className="text-slate-400">Waste Factor %</Label>
            <Input
              type="number"
              value={wasteFactor}
              onChange={(e) => setWasteFactor(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="10"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Gross Wall Area</p>
              <p className="text-lg font-semibold text-white">{grossArea.toFixed(0)} sq ft</p>
            </div>
            <div>
              <p className="text-slate-400">Net Area</p>
              <p className="text-lg font-semibold text-white">{netArea.toFixed(0)} sq ft</p>
            </div>
            <div>
              <p className="text-slate-400">With Waste (+{waste}%)</p>
              <p className="text-lg font-semibold text-white">{areaWithWaste.toFixed(0)} sq ft</p>
            </div>
            <div>
              <p className="text-slate-400">Labor Hours</p>
              <p className="text-lg font-semibold text-white">{laborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{materialLabels[material]} ({areaWithWaste.toFixed(0)} sq ft × ${sidingPrice})</span>
              <span className="text-white">${sidingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">J-Channel ({jChannelFeet.toFixed(0)} ft)</span>
              <span className="text-white">${jChannelCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Corner Pieces ({cornerPiecesNeeded} pcs)</span>
              <span className="text-white">${cornerCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Starter Strip ({starterStripFeet} ft)</span>
              <span className="text-white">${starterStripCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({laborHours.toFixed(1)} hrs × ${pricing.siding.laborRate}/hr)</span>
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
