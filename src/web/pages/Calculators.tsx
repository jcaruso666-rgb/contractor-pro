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
  Fence
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const calculatorTabs = [
  { id: 'roofing', label: 'Roofing', icon: Home },
  { id: 'windows', label: 'Windows', icon: Square },
  { id: 'gutters', label: 'Gutters', icon: Droplets },
  { id: 'siding', label: 'Siding', icon: Layers },
  { id: 'doors', label: 'Doors', icon: DoorOpen },
  { id: 'painting', label: 'Painting', icon: PaintBucket },
  { id: 'concrete', label: 'Concrete', icon: Box },
  { id: 'fencing', label: 'Fencing', icon: Fence },
];

export default function Calculators() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialTab = params.get('calculator') || 'roofing';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Project Calculators</h1>
          <p className="text-slate-400">
            Calculate materials, labor, and costs for each project category
          </p>
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

          <TabsContent value="roofing">
            <RoofingCalculator />
          </TabsContent>

          <TabsContent value="windows">
            <WindowsCalculator />
          </TabsContent>

          <TabsContent value="gutters">
            <GuttersCalculator />
          </TabsContent>

          <TabsContent value="siding">
            <SidingCalculator />
          </TabsContent>

          <TabsContent value="doors">
            <DoorsCalculator />
          </TabsContent>

          <TabsContent value="painting">
            <PaintingCalculator />
          </TabsContent>

          <TabsContent value="concrete">
            <ConcreteCalculator />
          </TabsContent>

          <TabsContent value="fencing">
            <FencingCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
