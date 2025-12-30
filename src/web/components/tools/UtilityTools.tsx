import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Unit Converter
export function UnitConverter() {
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [meters, setMeters] = useState('');
  const [sqFeet, setSqFeet] = useState('');
  const [sqMeters, setSqMeters] = useState('');
  const [squares, setSquares] = useState('');

  const updateFromFeet = (val: string) => {
    setFeet(val);
    const f = parseFloat(val) || 0;
    setInches((f * 12).toFixed(2));
    setMeters((f * 0.3048).toFixed(4));
  };

  const updateFromInches = (val: string) => {
    setInches(val);
    const i = parseFloat(val) || 0;
    setFeet((i / 12).toFixed(4));
    setMeters((i * 0.0254).toFixed(4));
  };

  const updateFromMeters = (val: string) => {
    setMeters(val);
    const m = parseFloat(val) || 0;
    setFeet((m / 0.3048).toFixed(4));
    setInches((m / 0.0254).toFixed(2));
  };

  const updateFromSqFeet = (val: string) => {
    setSqFeet(val);
    const sf = parseFloat(val) || 0;
    setSqMeters((sf * 0.092903).toFixed(4));
    setSquares((sf / 100).toFixed(2));
  };

  const updateFromSqMeters = (val: string) => {
    setSqMeters(val);
    const sm = parseFloat(val) || 0;
    setSqFeet((sm / 0.092903).toFixed(2));
    setSquares((sm / 0.092903 / 100).toFixed(2));
  };

  const updateFromSquares = (val: string) => {
    setSquares(val);
    const sq = parseFloat(val) || 0;
    setSqFeet((sq * 100).toFixed(2));
    setSqMeters((sq * 100 * 0.092903).toFixed(4));
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Unit Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-slate-400 mb-3">Linear Measurements</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Feet</Label>
              <Input
                type="number"
                value={feet}
                onChange={(e) => updateFromFeet(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Inches</Label>
              <Input
                type="number"
                value={inches}
                onChange={(e) => updateFromInches(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Meters</Label>
              <Input
                type="number"
                value={meters}
                onChange={(e) => updateFromMeters(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-400 mb-3">Area Measurements</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-400">Square Feet</Label>
              <Input
                type="number"
                value={sqFeet}
                onChange={(e) => updateFromSqFeet(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Square Meters</Label>
              <Input
                type="number"
                value={sqMeters}
                onChange={(e) => updateFromSqMeters(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400">Roofing Squares</Label>
              <Input
                type="number"
                value={squares}
                onChange={(e) => updateFromSquares(e.target.value)}
                className="mt-1 bg-slate-900 border-slate-700 text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pitch Calculator
export function PitchCalculator() {
  const [rise, setRise] = useState('');
  const [run, setRun] = useState('12');

  const riseVal = parseFloat(rise) || 0;
  const runVal = parseFloat(run) || 12;
  
  const pitch = runVal > 0 ? riseVal / runVal : 0;
  const degrees = Math.atan(pitch) * (180 / Math.PI);
  const percentage = pitch * 100;
  
  // Pitch multiplier for roof area
  const multiplier = Math.sqrt(1 + pitch * pitch);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Roof Pitch Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400">Rise (inches)</Label>
            <Input
              type="number"
              value={rise}
              onChange={(e) => setRise(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="6"
            />
          </div>
          <div>
            <Label className="text-slate-400">Run (inches)</Label>
            <Input
              type="number"
              value={run}
              onChange={(e) => setRun(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="12"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Pitch Ratio</p>
            <p className="text-xl font-bold text-white">{riseVal}/{runVal}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Degrees</p>
            <p className="text-xl font-bold text-sky-400">{degrees.toFixed(1)}°</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Percentage</p>
            <p className="text-xl font-bold text-white">{percentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Area Multiplier</p>
            <p className="text-xl font-bold text-emerald-400">×{multiplier.toFixed(3)}</p>
          </div>
        </div>

        <p className="text-sm text-slate-400">
          Multiply floor area by {multiplier.toFixed(3)} to get actual roof area
        </p>
      </CardContent>
    </Card>
  );
}

// Waste Calculator
export function WasteCalculator() {
  const [quantity, setQuantity] = useState('');
  const [wastePercent, setWastePercent] = useState('10');

  const qty = parseFloat(quantity) || 0;
  const waste = parseFloat(wastePercent) || 0;
  const wasteAmount = qty * (waste / 100);
  const totalNeeded = qty + wasteAmount;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Waste Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400">Base Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="100"
            />
          </div>
          <div>
            <Label className="text-slate-400">Waste Factor %</Label>
            <Input
              type="number"
              value={wastePercent}
              onChange={(e) => setWastePercent(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="10"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Base Amount</p>
            <p className="text-xl font-bold text-white">{qty.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Waste (+{waste}%)</p>
            <p className="text-xl font-bold text-amber-400">+{wasteAmount.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Order Amount</p>
            <p className="text-xl font-bold text-sky-400">{totalNeeded.toFixed(1)}</p>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          <p className="font-medium mb-1">Typical Waste Factors:</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span>• Shingles: 10-15%</span>
            <span>• Siding: 10%</span>
            <span>• Tile/Stone: 15-20%</span>
            <span>• Lumber: 10-15%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stair Calculator
export function StairCalculator() {
  const [totalRise, setTotalRise] = useState('');
  const [idealRiser, setIdealRiser] = useState('7.5');

  const rise = parseFloat(totalRise) || 0;
  const ideal = parseFloat(idealRiser) || 7.5;
  
  const numberOfSteps = Math.round(rise / ideal);
  const actualRiser = numberOfSteps > 0 ? rise / numberOfSteps : 0;
  
  // Standard tread depth: 25 - (2 × riser height)
  const treadDepth = 25 - (2 * actualRiser);
  const constrainedTread = Math.max(9, Math.min(12, treadDepth));
  
  const totalRun = constrainedTread * (numberOfSteps - 1);
  const stringerLength = Math.sqrt(rise * rise + totalRun * totalRun);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Stair Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400">Total Rise (in)</Label>
            <Input
              type="number"
              value={totalRise}
              onChange={(e) => setTotalRise(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="108"
            />
            <p className="text-xs text-slate-500 mt-1">Floor to floor height</p>
          </div>
          <div>
            <Label className="text-slate-400">Ideal Riser (in)</Label>
            <Input
              type="number"
              value={idealRiser}
              onChange={(e) => setIdealRiser(e.target.value)}
              className="mt-1.5 bg-slate-900 border-slate-700 text-white"
              placeholder="7.5"
            />
            <p className="text-xs text-slate-500 mt-1">Code: 7-7.75"</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Number of Risers</p>
            <p className="text-xl font-bold text-white">{numberOfSteps}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Actual Riser Height</p>
            <p className="text-xl font-bold text-sky-400">{actualRiser.toFixed(2)}"</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tread Depth</p>
            <p className="text-xl font-bold text-white">{constrainedTread.toFixed(2)}"</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Run</p>
            <p className="text-xl font-bold text-white">{totalRun.toFixed(1)}"</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Stringer Length</p>
            <p className="text-xl font-bold text-emerald-400">{stringerLength.toFixed(1)}"</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Treads Needed</p>
            <p className="text-xl font-bold text-white">{Math.max(0, numberOfSteps - 1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Concrete Volume Calculator
export function ConcreteVolumeCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('4');

  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const t = parseFloat(thickness) || 0;

  const areaSqFt = l * w;
  const volumeCuFt = areaSqFt * (t / 12);
  const cubicYards = volumeCuFt / 27;
  const withWaste = cubicYards * 1.1;
  const bags80lb = Math.ceil(volumeCuFt / 0.6); // 80lb bag = 0.6 cu ft
  const bags60lb = Math.ceil(volumeCuFt / 0.45);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Concrete Volume Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Length (ft)</Label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="10"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Width (ft)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="10"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Thickness (in)</Label>
            <Input
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Area</p>
            <p className="text-xl font-bold text-white">{areaSqFt.toFixed(1)} sq ft</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cubic Yards</p>
            <p className="text-xl font-bold text-sky-400">{cubicYards.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">With 10% Waste</p>
            <p className="text-xl font-bold text-emerald-400">{withWaste.toFixed(2)} yd³</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">80lb Bags</p>
            <p className="text-xl font-bold text-white">{bags80lb}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">60lb Bags</p>
            <p className="text-xl font-bold text-white">{bags60lb}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Cubic Feet</p>
            <p className="text-xl font-bold text-white">{volumeCuFt.toFixed(1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Board Feet Calculator
export function BoardFeetCalculator() {
  const [thickness, setThickness] = useState('1');
  const [width, setWidth] = useState('6');
  const [lengthFt, setLengthFt] = useState('8');
  const [quantity, setQuantity] = useState('1');

  const t = parseFloat(thickness) || 0;
  const w = parseFloat(width) || 0;
  const l = parseFloat(lengthFt) || 0;
  const qty = parseInt(quantity) || 1;

  const boardFeetPer = (t * w * l) / 12;
  const totalBoardFeet = boardFeetPer * qty;
  
  // Price estimates
  const pricePerBF = {
    pine: 3.50,
    oak: 8.00,
    maple: 7.00,
    walnut: 12.00,
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Board Feet Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Thickness (in)</Label>
            <Input
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="1"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Width (in)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="6"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Length (ft)</Label>
            <Input
              type="number"
              value={lengthFt}
              onChange={(e) => setLengthFt(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="8"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">BF per Board</p>
            <p className="text-xl font-bold text-white">{boardFeetPer.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Board Feet</p>
            <p className="text-xl font-bold text-sky-400">{totalBoardFeet.toFixed(2)}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-slate-400 mb-2">Estimated Cost:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.entries(pricePerBF).map(([wood, price]) => (
              <div key={wood} className="p-2 bg-slate-900/50 rounded">
                <p className="text-slate-400 capitalize">{wood}</p>
                <p className="font-semibold text-white">${(totalBoardFeet * price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Paint Coverage Calculator
export function PaintCoverageCalculator() {
  const [wallHeight, setWallHeight] = useState('9');
  const [wallLength, setWallLength] = useState('');
  const [numWalls, setNumWalls] = useState('4');
  const [windowDoors, setWindowDoors] = useState('60');
  const [coats, setCoats] = useState('2');

  const h = parseFloat(wallHeight) || 0;
  const l = parseFloat(wallLength) || 0;
  const walls = parseInt(numWalls) || 0;
  const openings = parseFloat(windowDoors) || 0;
  const numCoats = parseInt(coats) || 2;

  const grossArea = h * l * walls;
  const netArea = grossArea - openings;
  const sqFtPerGallon = 350;
  const gallonsBase = netArea / sqFtPerGallon;
  const gallonsTotal = gallonsBase * numCoats;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Paint Coverage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Wall Height (ft)</Label>
            <Input
              type="number"
              value={wallHeight}
              onChange={(e) => setWallHeight(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="9"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Wall Length (ft)</Label>
            <Input
              type="number"
              value={wallLength}
              onChange={(e) => setWallLength(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="12"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400"># of Walls</Label>
            <Input
              type="number"
              value={numWalls}
              onChange={(e) => setNumWalls(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="4"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Windows/Doors (sq ft)</Label>
            <Input
              type="number"
              value={windowDoors}
              onChange={(e) => setWindowDoors(e.target.value)}
              className="mt-1 bg-slate-900 border-slate-700 text-white"
              placeholder="60"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Number of Coats</Label>
            <select
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
              className="mt-1 w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
            >
              <option value="1">1 Coat</option>
              <option value="2">2 Coats</option>
              <option value="3">3 Coats</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-lg">
          <div>
            <p className="text-xs text-slate-400">Gross Area</p>
            <p className="text-xl font-bold text-white">{grossArea.toFixed(0)} sq ft</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Net Area</p>
            <p className="text-xl font-bold text-white">{netArea.toFixed(0)} sq ft</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Gallons Needed</p>
            <p className="text-xl font-bold text-sky-400">{Math.ceil(gallonsTotal)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Est. Cost</p>
            <p className="text-xl font-bold text-emerald-400">${(Math.ceil(gallonsTotal) * 40).toLocaleString()}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Based on 350 sq ft coverage per gallon, $40/gallon average paint
        </p>
      </CardContent>
    </Card>
  );
}

// Markup/Margin Calculator
export function MarkupCalculator() {
  const [cost, setCost] = useState('');
  const [markup, setMarkup] = useState('25');
  const [targetPrice, setTargetPrice] = useState('');

  const costVal = parseFloat(cost) || 0;
  const markupPercent = parseFloat(markup) || 0;
  const target = parseFloat(targetPrice) || 0;

  // Calculate from cost and markup
  const priceFromMarkup = costVal * (1 + markupPercent / 100);
  const profit = priceFromMarkup - costVal;
  const marginPercent = priceFromMarkup > 0 ? (profit / priceFromMarkup) * 100 : 0;

  // Calculate from target price
  const markupFromTarget = costVal > 0 ? ((target - costVal) / costVal) * 100 : 0;
  const marginFromTarget = target > 0 ? ((target - costVal) / target) * 100 : 0;
  const profitFromTarget = target - costVal;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Markup & Margin Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Calculate from markup */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Calculate from Markup %</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Job Cost</Label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-700 text-white"
                  placeholder="1000"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Markup %</Label>
                <Input
                  type="number"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-700 text-white"
                  placeholder="25"
                />
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Sell Price:</span>
                <span className="font-bold text-white">${priceFromMarkup.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Profit:</span>
                <span className="font-bold text-emerald-400">${profit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margin:</span>
                <span className="font-bold text-sky-400">{marginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Calculate from target price */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Calculate from Target Price</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400">Job Cost</Label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-700 text-white"
                  placeholder="1000"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Target Price</Label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="mt-1 bg-slate-900 border-slate-700 text-white"
                  placeholder="1500"
                />
              </div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Markup:</span>
                <span className="font-bold text-white">{markupFromTarget.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Profit:</span>
                <span className="font-bold text-emerald-400">${profitFromTarget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margin:</span>
                <span className="font-bold text-sky-400">{marginFromTarget.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
          <p className="font-medium text-sky-300 mb-1">Markup vs Margin:</p>
          <p>• <strong>Markup</strong> = (Price - Cost) ÷ Cost × 100</p>
          <p>• <strong>Margin</strong> = (Price - Cost) ÷ Price × 100</p>
          <p className="mt-1">A 25% markup equals ~20% margin. A 50% markup equals ~33% margin.</p>
        </div>
      </CardContent>
    </Card>
  );
}
