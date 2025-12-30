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

export function PaintingCalculator({ onAddToProject }: Props) {
  const pricing = getPricing();
  
  const [interiorSqFt, setInteriorSqFt] = useState('');
  const [exteriorSqFt, setExteriorSqFt] = useState('');
  const [coats, setCoats] = useState('2');
  const [includePrimer, setIncludePrimer] = useState(true);
  const [ceilings, setCeilings] = useState('');
  const [trim, setTrim] = useState('');

  const intSqFt = parseFloat(interiorSqFt) || 0;
  const extSqFt = parseFloat(exteriorSqFt) || 0;
  const numCoats = parseInt(coats) || 2;
  const ceilingSqFt = parseFloat(ceilings) || 0;
  const trimLinFt = parseFloat(trim) || 0;

  // Coverage per gallon
  const sqFtPerGallon = pricing.painting.sqftPerGallon;

  // Interior calculations
  const intGallonsBase = intSqFt / sqFtPerGallon;
  const intGallonsTotal = Math.ceil(intGallonsBase * numCoats);
  const intPrimerGallons = includePrimer ? Math.ceil(intSqFt / sqFtPerGallon) : 0;
  const intPaintCost = intGallonsTotal * pricing.painting.interior.default;
  const intPrimerCost = intPrimerGallons * pricing.painting.primer;
  
  // Ceiling calculations
  const ceilingGallons = Math.ceil((ceilingSqFt / sqFtPerGallon) * numCoats);
  const ceilingCost = ceilingGallons * pricing.painting.interior.default;

  // Trim calculations (linear feet to sq ft estimate - about 0.5 sq ft per linear foot)
  const trimSqFt = trimLinFt * 0.5;
  const trimGallons = Math.ceil(trimSqFt / sqFtPerGallon * numCoats);
  const trimCost = trimGallons * pricing.painting.interior.default;

  // Exterior calculations
  const extGallonsBase = extSqFt / sqFtPerGallon;
  const extGallonsTotal = Math.ceil(extGallonsBase * numCoats);
  const extPrimerGallons = includePrimer ? Math.ceil(extSqFt / sqFtPerGallon) : 0;
  const extPaintCost = extGallonsTotal * pricing.painting.exterior.default;
  const extPrimerCost = extPrimerGallons * pricing.painting.primer;

  // Labor: Interior ~100 sq ft/hour, Exterior ~75 sq ft/hour
  const intLaborHours = intSqFt > 0 ? (intSqFt / 100) * numCoats + (intPrimerGallons > 0 ? intSqFt / 150 : 0) : 0;
  const ceilingLaborHours = ceilingSqFt > 0 ? (ceilingSqFt / 80) * numCoats : 0;
  const trimLaborHours = trimLinFt > 0 ? (trimLinFt / 60) * numCoats : 0;
  const extLaborHours = extSqFt > 0 ? (extSqFt / 75) * numCoats + (extPrimerGallons > 0 ? extSqFt / 100 : 0) : 0;

  const totalLaborHours = intLaborHours + ceilingLaborHours + trimLaborHours + extLaborHours;
  const laborCost = totalLaborHours * pricing.painting.laborRate;

  // Supplies (brushes, rollers, tape, drop cloths, etc.) - estimate 10% of paint cost
  const suppliesCost = (intPaintCost + ceilingCost + trimCost + extPaintCost) * 0.1;

  const totalMaterialCost = intPaintCost + intPrimerCost + ceilingCost + trimCost + extPaintCost + extPrimerCost + suppliesCost;
  const totalCost = totalMaterialCost + laborCost;

  const handleAddToProject = () => {
    if (!onAddToProject) return;
    
    const items: CalculatorResult[] = [];

    if (intSqFt > 0) {
      items.push({
        description: `Interior Wall Paint (${intGallonsTotal} gallons, ${numCoats} coats)`,
        quantity: intGallonsTotal,
        unit: 'gallons',
        unitPrice: pricing.painting.interior.default,
        total: intPaintCost,
        laborHours: intLaborHours,
        laborRate: pricing.painting.laborRate,
        laborCost: intLaborHours * pricing.painting.laborRate,
      });
    }

    if (ceilingSqFt > 0) {
      items.push({
        description: `Ceiling Paint (${ceilingGallons} gallons)`,
        quantity: ceilingGallons,
        unit: 'gallons',
        unitPrice: pricing.painting.interior.default,
        total: ceilingCost,
        laborHours: ceilingLaborHours,
        laborRate: pricing.painting.laborRate,
        laborCost: ceilingLaborHours * pricing.painting.laborRate,
      });
    }

    if (trimLinFt > 0) {
      items.push({
        description: `Trim Paint (${trimGallons} gallons, ${trimLinFt} lin ft)`,
        quantity: trimGallons,
        unit: 'gallons',
        unitPrice: pricing.painting.interior.default,
        total: trimCost,
        laborHours: trimLaborHours,
        laborRate: pricing.painting.laborRate,
        laborCost: trimLaborHours * pricing.painting.laborRate,
      });
    }

    if (extSqFt > 0) {
      items.push({
        description: `Exterior Paint (${extGallonsTotal} gallons, ${numCoats} coats)`,
        quantity: extGallonsTotal,
        unit: 'gallons',
        unitPrice: pricing.painting.exterior.default,
        total: extPaintCost,
        laborHours: extLaborHours,
        laborRate: pricing.painting.laborRate,
        laborCost: extLaborHours * pricing.painting.laborRate,
      });
    }

    if (includePrimer && (intPrimerGallons > 0 || extPrimerGallons > 0)) {
      items.push({
        description: `Primer (${intPrimerGallons + extPrimerGallons} gallons)`,
        quantity: intPrimerGallons + extPrimerGallons,
        unit: 'gallons',
        unitPrice: pricing.painting.primer,
        total: intPrimerCost + extPrimerCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }

    if (suppliesCost > 0) {
      items.push({
        description: 'Painting Supplies (brushes, rollers, tape, etc.)',
        quantity: 1,
        unit: 'lot',
        unitPrice: suppliesCost,
        total: suppliesCost,
        laborHours: 0,
        laborRate: 0,
        laborCost: 0,
      });
    }
    
    onAddToProject(items);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Painting Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-slate-400">Interior Wall Area (sq ft)</Label>
            <Input
              type="number"
              value={interiorSqFt}
              onChange={(e) => setInteriorSqFt(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="1500"
            />
          </div>
          <div>
            <Label className="text-slate-400">Ceiling Area (sq ft)</Label>
            <Input
              type="number"
              value={ceilings}
              onChange={(e) => setCeilings(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="800"
            />
          </div>
          <div>
            <Label className="text-slate-400">Trim (linear ft)</Label>
            <Input
              type="number"
              value={trim}
              onChange={(e) => setTrim(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="200"
            />
          </div>
          <div>
            <Label className="text-slate-400">Exterior Area (sq ft)</Label>
            <Input
              type="number"
              value={exteriorSqFt}
              onChange={(e) => setExteriorSqFt(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="2000"
            />
          </div>
          <div>
            <Label className="text-slate-400">Number of Coats</Label>
            <select
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
              className="mt-1.5 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="1">1 Coat</option>
              <option value="2">2 Coats</option>
              <option value="3">3 Coats</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer w-full">
              <input
                type="checkbox"
                checked={includePrimer}
                onChange={(e) => setIncludePrimer(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500"
              />
              <span className="text-white">Include Primer</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sky-400">Calculation Results</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Interior Paint</p>
              <p className="text-lg font-semibold text-white">{intGallonsTotal} gal</p>
            </div>
            <div>
              <p className="text-slate-400">Exterior Paint</p>
              <p className="text-lg font-semibold text-white">{extGallonsTotal} gal</p>
            </div>
            <div>
              <p className="text-slate-400">Primer</p>
              <p className="text-lg font-semibold text-white">{intPrimerGallons + extPrimerGallons} gal</p>
            </div>
            <div>
              <p className="text-slate-400">Labor Hours</p>
              <p className="text-lg font-semibold text-white">{totalLaborHours.toFixed(1)} hrs</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 space-y-2">
            {intSqFt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Interior Paint ({intGallonsTotal} gal)</span>
                <span className="text-white">${intPaintCost.toLocaleString()}</span>
              </div>
            )}
            {ceilingSqFt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Ceiling Paint ({ceilingGallons} gal)</span>
                <span className="text-white">${ceilingCost.toLocaleString()}</span>
              </div>
            )}
            {trimLinFt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Trim Paint ({trimGallons} gal)</span>
                <span className="text-white">${trimCost.toLocaleString()}</span>
              </div>
            )}
            {extSqFt > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Exterior Paint ({extGallonsTotal} gal)</span>
                <span className="text-white">${extPaintCost.toLocaleString()}</span>
              </div>
            )}
            {includePrimer && (intPrimerGallons + extPrimerGallons) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Primer ({intPrimerGallons + extPrimerGallons} gal)</span>
                <span className="text-white">${(intPrimerCost + extPrimerCost).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Supplies (brushes, rollers, tape)</span>
              <span className="text-white">${suppliesCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Labor ({totalLaborHours.toFixed(1)} hrs × ${pricing.painting.laborRate}/hr)</span>
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
