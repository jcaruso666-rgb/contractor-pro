import { useState } from 'react';
import { useSearch } from 'wouter';
import { 
  Home,
  Square,
  Droplets,
  Layers,
  DoorOpen,
  PaintBucket,
  Box,
  Fence,
  ArrowRight,
  Calculator,
  ArrowLeftRight,
  TrendingUp,
  Percent,
  Ruler,
  Hammer,
  DollarSign
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  RoofingCalculator,
  WindowsCalculator,
  GuttersCalculator,
  SidingCalculator,
  DoorsCalculator,
  PaintingCalculator,
  ConcreteCalculator,
  FencingCalculator,
} from '@/components/calculators';
import {
  UnitConverter,
  PitchCalculator,
  WasteCalculator,
  StairCalculator,
  ConcreteVolumeCalculator,
  BoardFeetCalculator,
  PaintCoverageCalculator,
  MarkupCalculator,
} from '@/components/tools/UtilityTools';

const calculatorTabs = [
  { id: 'roofing', label: 'Roofing', icon: Home, description: 'Shingles, metal, tile with pitch factor' },
  { id: 'windows', label: 'Windows', icon: Square, description: 'Count by type and size' },
  { id: 'gutters', label: 'Gutters', icon: Droplets, description: 'Linear feet with downspouts' },
  { id: 'siding', label: 'Siding', icon: Layers, description: 'Wall area with waste factor' },
  { id: 'doors', label: 'Doors', icon: DoorOpen, description: 'Interior & exterior types' },
  { id: 'painting', label: 'Painting', icon: PaintBucket, description: 'Coverage and coats' },
  { id: 'concrete', label: 'Concrete', icon: Box, description: 'Cubic yards with rebar' },
  { id: 'fencing', label: 'Fencing', icon: Fence, description: 'Posts, gates, materials' },
];

const utilityTools = [
  { id: 'converter', label: 'Unit Converter', icon: ArrowLeftRight, description: 'Feet, inches, meters, squares' },
  { id: 'pitch', label: 'Pitch Calculator', icon: TrendingUp, description: 'Rise/run to degrees' },
  { id: 'waste', label: 'Waste Calculator', icon: Percent, description: 'Add waste percentage' },
  { id: 'stairs', label: 'Stair Calculator', icon: Ruler, description: 'Rise, run, steps needed' },
  { id: 'concrete-vol', label: 'Concrete Volume', icon: Box, description: 'Area to cubic yards' },
  { id: 'boardfeet', label: 'Board Feet', icon: Hammer, description: 'Lumber calculations' },
  { id: 'paint-cover', label: 'Paint Coverage', icon: PaintBucket, description: 'Gallons needed' },
  { id: 'markup', label: 'Markup Calculator', icon: DollarSign, description: 'Pricing & margins' },
];

export default function Tools() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialTab = params.get('calculator') || '';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeUtility, setActiveUtility] = useState('');
  const [view, setView] = useState<'menu' | 'calculators' | 'utilities'>(initialTab ? 'calculators' : 'menu');

  if (view === 'calculators') {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => {
                setView('menu');
                setActiveTab('');
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← Back to Tools
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Project Calculators</h1>
              <p className="text-slate-400">Calculate materials, labor, and costs</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-slate-800/50 border border-slate-700 mb-6">
              {calculatorTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="roofing"><RoofingCalculator /></TabsContent>
            <TabsContent value="windows"><WindowsCalculator /></TabsContent>
            <TabsContent value="gutters"><GuttersCalculator /></TabsContent>
            <TabsContent value="siding"><SidingCalculator /></TabsContent>
            <TabsContent value="doors"><DoorsCalculator /></TabsContent>
            <TabsContent value="painting"><PaintingCalculator /></TabsContent>
            <TabsContent value="concrete"><ConcreteCalculator /></TabsContent>
            <TabsContent value="fencing"><FencingCalculator /></TabsContent>
          </Tabs>
        </div>
      </Layout>
    );
  }

  if (view === 'utilities') {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="outline" 
              onClick={() => {
                setView('menu');
                setActiveUtility('');
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              ← Back to Tools
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Utility Tools</h1>
              <p className="text-slate-400">Quick calculations and conversions</p>
            </div>
          </div>

          <Tabs value={activeUtility} onValueChange={setActiveUtility}>
            <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-slate-800/50 border border-slate-700 mb-6">
              {utilityTools.map(tool => {
                const Icon = tool.icon;
                return (
                  <TabsTrigger
                    key={tool.id}
                    value={tool.id}
                    className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tool.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="converter"><UnitConverter /></TabsContent>
            <TabsContent value="pitch"><PitchCalculator /></TabsContent>
            <TabsContent value="waste"><WasteCalculator /></TabsContent>
            <TabsContent value="stairs"><StairCalculator /></TabsContent>
            <TabsContent value="concrete-vol"><ConcreteVolumeCalculator /></TabsContent>
            <TabsContent value="boardfeet"><BoardFeetCalculator /></TabsContent>
            <TabsContent value="paint-cover"><PaintCoverageCalculator /></TabsContent>
            <TabsContent value="markup"><MarkupCalculator /></TabsContent>
          </Tabs>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Contractor Tools</h1>
          <p className="text-slate-400">Calculators and utilities for your projects</p>
        </div>

        {/* Project Calculators Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-sky-400" />
              Project Calculators
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveTab('roofing');
                setView('calculators');
              }}
              className="text-sky-400 hover:text-sky-300"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculatorTabs.map((calc) => {
              const Icon = calc.icon;
              return (
                <Card 
                  key={calc.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-sky-500/50 cursor-pointer transition-all group"
                  onClick={() => {
                    setActiveTab(calc.id);
                    setView('calculators');
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-sky-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{calc.label}</h3>
                    <p className="text-sm text-slate-400">{calc.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Utility Tools Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Hammer className="w-5 h-5 text-emerald-400" />
              Utility Tools
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveUtility('converter');
                setView('utilities');
              }}
              className="text-emerald-400 hover:text-emerald-300"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilityTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card 
                  key={tool.id}
                  className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-all group"
                  onClick={() => {
                    setActiveUtility(tool.id);
                    setView('utilities');
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{tool.label}</h3>
                    <p className="text-sm text-slate-400">{tool.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Tip */}
        <Card className="bg-sky-500/10 border-sky-500/30">
          <CardContent className="py-6">
            <p className="text-sky-300 text-center">
              All calculators provide instant results. Project calculators include labor costs and material estimates 
              that can be added directly to your project quotes.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
