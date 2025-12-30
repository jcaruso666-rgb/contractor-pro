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

type FenceMaterial = 'wood' | 'vinyl' | 'chainLink' | 'aluminum';

const materialLabels: Record<FenceMaterial, string> = {
  wood: 'Wood Privacy',
  vinyl: 'Vinyl',
  chainLink: 'Chain Link',
  aluminum: 'Aluminum',
};

export function FencingCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [linearFeet, setLinearFeet] = useState('');
  const [height, setHeight] = useState('6');
  const [material, setMaterial] = useState<FenceMaterial>('wood');
  const [gates, setGates] = useState('1');
  const [corners, setCorners] = useState('4');
  const [postSpacing, setPostSpacing] = useState('8');

  const feet = parseFloat(linearFeet) || 0;
  const fenceHeight = parseFloat(height) || 6;
  const gateCount = parseInt(gates) || 0;
  const cornerCount = parseInt(corners) || 0;
  const spacing = parseFloat(postSpacing) || 8;

  // Posts calculation
  const postsNeeded = Math.ceil(feet / spacing) + 1 + cornerCount;
  const postCost = postsNeeded * pricing.fencing.post;

  // Height factor (taller fences cost more per foot)
  const heightFactor = fenceHeight <= 4 ? 0.7 : fenceHeight <= 6 ? 1 : 1.4;

  // Material cost
  const materialPrice = pricing.fencing[material].default * heightFactor;
  const fencingCost = feet * materialPrice;

  // Gates
  const gatePrice = pricing.fencing.gate * (fenceHeight > 6 ? 1.3 : 1);
  const gateCost = gateCount * gatePrice;

  // Hardware (hinges, latches for gates, post caps)
  const hardwareCost = (gateCount * 45) + (postsNeeded * 5); // $45 per gate hardware, $5 per post cap

  // Concrete for posts (1 bag per post)
  const concreteBags = postsNeeded;
  const concreteCost = concreteBags * 6; // $6 per bag

  // Rails (usually 2 rails for 4ft, 3 for 6ft+)
  const railsPerSection = fenceHeight <= 4 ? 2 : 3;
  const railSections = Math.ceil(feet / 8); // Rails typically 8ft
  const totalRails = railSections * railsPerSection;
  const railCost = material === 'wood' ? totalRails * 8 : 0; // $8 per 2x4x8 rail (wood only)

  // Labor: varies by material and height
  const laborMultiplier = material === 'vinyl' ? 0.8 : material === 'chainLink' ? 0.6 : material === 'aluminum' ? 0.9 : 1;
  const baseLabor = feet * 0.15 * heightFactor * laborMultiplier; // 0.15 hours per linear foot base
  const postLabor = postsNeeded * 0.5; // 0.5 hours per post (digging, setting, concrete)
  const gateLabor = gateCount * 1.5; // 1.5 hours per gate
  const totalLaborHours = baseLabor + postLabor + gateLabor;
  const laborCost = totalLaborHours * pricing.fencing.laborRate;

  const totalMaterialCost = fencingCost + postCost + gateCost + hardwareCost + concreteCost + railCost;
  const totalCost = totalMaterialCost + laborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [
      {
        description: `${materialLabels[material]} Fence (${feet} ft × ${fenceHeight}ft high)`,
        quantity: feet,
        unit: 'lin ft',
        unitPrice: materialPrice,
        total: fencingCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
      {
        description: `Posts (${postsNeeded} pcs)`,
        quantity: postsNeeded,
        unit: 'posts',
        unitPrice: pricing.fencing.post,
        total: postCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
    ];

    if (gateCount > 0) {
      items.push({
        description: `Gates (${gateCount} × ${fenceHeight}ft)`,
        quantity: gateCount,
        unit: 'gates',
        unitPrice: gatePrice,
        total: gateCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    items.push({
      description: 'Hardware, Post Concrete & Supplies',
      quantity: 1,
      unit: 'lot',
      unitPrice: hardwareCost + concreteCost + railCost,
      total: hardwareCost + concreteCost + railCost,
      laborHours: 0,
      laborRate: 0,
      laborCost: 0,
    });

    items.push({
      description: 'Installation Labor',
      quantity: parseFloat(totalLaborHours.toFixed(1)),
      unit: 'hours',
      unitPrice: pricing.fencing.laborRate,
      total: laborCost,
      laborHours: totalLaborHours,
      laborRate: pricing.fencing.laborRate,
      laborCost,
    });
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Fencing Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Label className="text-slate-400">Height (ft)</Label>
            <select
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="3">3 ft</option>
              <option value="4">4 ft (standard)</option>
              <option value="5">5 ft</option>
              <option value="6">6 ft (privacy)</option>
              <option value="8">8 ft (tall privacy)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Material</Label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as FenceMaterial)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="wood">Wood Privacy (${pricing.fencing.wood.default}/ft)</option>
              <option value="vinyl">Vinyl (${pricing.fencing.vinyl.default}/ft)</option>
              <option value="chainLink">Chain Link (${pricing.fencing.chainLink.default}/ft)</option>
              <option value="aluminum">Aluminum (${pricing.fencing.aluminum.default}/ft)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Number of Gates</Label>
            <Input
              type="number"
              value={gates}
              onChange={(e) => setGates(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="1"
            />
          </div>
          <div>
            <Label className="text-slate-400">Corner Posts</Label>
            <Input
              type="number"
              value={corners}
              onChange={(e) => setCorners(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
          <div>
            <Label className="text-slate-400">Post Spacing (ft)</Label>
            <select
              value={postSpacing}
              onChange={(e) => setPostSpacing(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="6">6 ft (stronger)</option>
              <option value="8">8 ft (standard)</option>
              <option value="10">10 ft (economy)</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Total Fence</p>
              <p className="text-lg font-semibold text-white">{feet} lin ft</p>
            </div>
            <div>
              <p className="text-slate-400">Posts Needed</p>
              <p className="text-lg font-semibold text-white">{postsNeeded}</p>
            </div>
            <div>
              <p className="text-slate-400">Concrete Bags</p>
              <p className="text-lg font-semibold text-white">{concreteBags}</p>
            </div>
            <div>
              <p className="text-slate-400">Labor Hours</p>
              <p className="text-lg font-semibold text-white">{totalLaborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{materialLabels[material]} ({feet} ft × ${materialPrice.toFixed(2)})</span>
              <span className="text-white">${fencingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Posts ({postsNeeded} × ${pricing.fencing.post})</span>
              <span className="text-white">${postCost.toLocaleString()}</span>
            </div>
            {gateCount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gates ({gateCount})</span>
                <span className="text-white">${gateCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Hardware & Post Caps</span>
              <span className="text-white">${hardwareCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Post Concrete ({concreteBags} bags)</span>
              <span className="text-white">${concreteCost.toLocaleString()}</span>
            </div>
            {railCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rails ({totalRails} pcs)</span>
                <span className="text-white">${railCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({totalLaborHours.toFixed(1)} hrs × ${pricing.fencing.laborRate}/hr)</span>
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
