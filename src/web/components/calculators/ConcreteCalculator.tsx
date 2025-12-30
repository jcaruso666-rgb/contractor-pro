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

export function ConcreteCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('4');
  const [includeRebar, setIncludeRebar] = useState(true);
  const [includeWireMesh, setIncludeWireMesh] = useState(false);
  const [finishType, setFinishType] = useState<'broom' | 'exposed' | 'stamped'>('broom');

  const lengthFt = parseFloat(length) || 0;
  const widthFt = parseFloat(width) || 0;
  const thicknessIn = parseFloat(thickness) || 4;

  // Calculate area and volume
  const areaSqFt = lengthFt * widthFt;
  const thicknessFt = thicknessIn / 12;
  const volumeCuFt = areaSqFt * thicknessFt;
  const cubicYards = volumeCuFt / 27;
  
  // Add 10% for waste
  const cubicYardsWithWaste = cubicYards * 1.10;
  const orderedYards = Math.ceil(cubicYardsWithWaste);

  // Concrete cost
  const concreteCost = orderedYards * pricing.concrete.perCubicYard.default;

  // Rebar (grid every 18 inches both ways)
  const rebarLengthRows = Math.ceil(widthFt / 1.5) + 1;
  const rebarWidthRows = Math.ceil(lengthFt / 1.5) + 1;
  const totalRebarFeet = (rebarLengthRows * lengthFt) + (rebarWidthRows * widthFt);
  const rebarCost = includeRebar ? totalRebarFeet * 1.25 : 0; // $1.25 per linear foot

  // Wire mesh (if chosen instead of rebar)
  const wireMeshSheets = Math.ceil(areaSqFt / 50); // 5x10 sheets = 50 sq ft each
  const wireMeshCost = includeWireMesh && !includeRebar ? wireMeshSheets * 35 : 0;

  // Forms (2x4 lumber around perimeter)
  const perimeterFeet = 2 * (lengthFt + widthFt);
  const formsNeeded = Math.ceil(perimeterFeet / 8) * 2; // 8ft boards, need inside and outside
  const formCost = formsNeeded * 6; // $6 per 2x4x8

  // Stakes and form oil
  const stakesNeeded = Math.ceil(perimeterFeet / 3);
  const stakesCost = stakesNeeded * 2;
  const formOilCost = 25;

  // Finish cost addition
  const finishMultiplier = finishType === 'stamped' ? 8 : finishType === 'exposed' ? 3 : 0;
  const finishCost = areaSqFt * finishMultiplier;

  // Labor: varies by thickness and finish
  const baseLabor = cubicYards * 4; // 4 hours per cubic yard base
  const formLabor = perimeterFeet * 0.1; // 0.1 hours per linear foot for forms
  const finishLabor = finishType === 'stamped' ? areaSqFt * 0.05 : finishType === 'exposed' ? areaSqFt * 0.02 : 0;
  const totalLaborHours = baseLabor + formLabor + finishLabor;
  const laborCost = totalLaborHours * pricing.concrete.laborRate;

  // Pump truck if over 5 yards
  const pumpTruckCost = orderedYards > 5 ? 350 : 0;

  const totalMaterialCost = concreteCost + rebarCost + wireMeshCost + formCost + stakesCost + formOilCost + finishCost + pumpTruckCost;
  const totalCost = totalMaterialCost + laborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [
      {
        description: `Ready-Mix Concrete (${orderedYards} cubic yards)`,
        quantity: orderedYards,
        unit: 'cu yd',
        unitPrice: pricing.concrete.perCubicYard.default,
        total: concreteCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      },
    ];

    if (includeRebar) {
      items.push({
        description: `Rebar Grid (${Math.ceil(totalRebarFeet)} lin ft)`,
        quantity: Math.ceil(totalRebarFeet),
        unit: 'lin ft',
        unitPrice: 1.25,
        total: rebarCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    if (includeWireMesh && !includeRebar) {
      items.push({
        description: `Wire Mesh (${wireMeshSheets} sheets)`,
        quantity: wireMeshSheets,
        unit: 'sheets',
        unitPrice: 35,
        total: wireMeshCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    items.push({
      description: 'Forms, Stakes & Supplies',
      quantity: 1,
      unit: 'lot',
      unitPrice: formCost + stakesCost + formOilCost,
      total: formCost + stakesCost + formOilCost,
      laborHours: 0,
      laborRate: 0,
      laborCost: 0,
    });

    if (finishCost > 0) {
      items.push({
        description: `${finishType.charAt(0).toUpperCase() + finishType.slice(1)} Finish`,
        quantity: areaSqFt,
        unit: 'sq ft',
        unitPrice: finishMultiplier,
        total: finishCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    if (pumpTruckCost > 0) {
      items.push({
        description: 'Concrete Pump Truck',
        quantity: 1,
        unit: 'service',
        unitPrice: 350,
        total: 350,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    items.push({
      description: 'Labor (pour, finish, cure)',
      quantity: parseFloat(totalLaborHours.toFixed(1)),
      unit: 'hours',
      unitPrice: pricing.concrete.laborRate,
      total: laborCost,
      laborHours: totalLaborHours,
      laborRate: pricing.concrete.laborRate,
      laborCost,
    });
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Concrete Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-slate-400">Length (ft)</Label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="20"
            />
          </div>
          <div>
            <Label className="text-slate-400">Width (ft)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="10"
            />
          </div>
          <div>
            <Label className="text-slate-400">Thickness (in)</Label>
            <select
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="4">4" (standard)</option>
              <option value="5">5"</option>
              <option value="6">6" (driveway)</option>
              <option value="8">8" (heavy duty)</option>
            </select>
          </div>
          <div>
            <Label className="text-slate-400">Finish</Label>
            <select
              value={finishType}
              onChange={(e) => setFinishType(e.target.value as 'broom' | 'exposed' | 'stamped')}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="broom">Broom Finish (standard)</option>
              <option value="exposed">Exposed Aggregate (+$3/sq ft)</option>
              <option value="stamped">Stamped (+$8/sq ft)</option>
            </select>
          </div>
        </div>

        {/* Reinforcement Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={includeRebar}
              onChange={(e) => {
                setIncludeRebar(e.target.checked);
                if (e.target.checked) setIncludeWireMesh(false);
              }}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500"
            />
            <span className="text-white">Include Rebar</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={includeWireMesh}
              onChange={(e) => {
                setIncludeWireMesh(e.target.checked);
                if (e.target.checked) setIncludeRebar(false);
              }}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500"
            />
            <span className="text-white">Wire Mesh Instead</span>
          </label>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Area</p>
              <p className="text-lg font-semibold text-white">{areaSqFt.toLocaleString()} sq ft</p>
            </div>
            <div>
              <p className="text-slate-400">Volume</p>
              <p className="text-lg font-semibold text-white">{cubicYards.toFixed(2)} cu yd</p>
            </div>
            <div>
              <p className="text-slate-400">Order Amount</p>
              <p className="text-lg font-semibold text-white">{orderedYards} cu yd</p>
            </div>
            <div>
              <p className="text-slate-400">Labor Hours</p>
              <p className="text-lg font-semibold text-white">{totalLaborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Concrete ({orderedYards} yd × ${pricing.concrete.perCubicYard.default})</span>
              <span className="text-white">${concreteCost.toLocaleString()}</span>
            </div>
            {includeRebar && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rebar ({Math.ceil(totalRebarFeet)} ft)</span>
                <span className="text-white">${rebarCost.toLocaleString()}</span>
              </div>
            )}
            {includeWireMesh && !includeRebar && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Wire Mesh ({wireMeshSheets} sheets)</span>
                <span className="text-white">${wireMeshCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Forms & Supplies</span>
              <span className="text-white">${(formCost + stakesCost + formOilCost).toLocaleString()}</span>
            </div>
            {finishCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{finishType.charAt(0).toUpperCase() + finishType.slice(1)} Finish</span>
                <span className="text-white">${finishCost.toLocaleString()}</span>
              </div>
            )}
            {pumpTruckCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pump Truck (orders &gt;5 yd)</span>
                <span className="text-white">${pumpTruckCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({totalLaborHours.toFixed(1)} hrs × ${pricing.concrete.laborRate}/hr)</span>
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
