import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Info, TrendingUp, Home, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ZoneData {
  id: string;
  coords: [number, number][];
  demandLevel: 'high' | 'medium' | 'low';
  avgHomeAge: number;
  avgHomeValue: number;
  totalHomes: number;
  incomeLevel: 'high' | 'medium' | 'low';
}

// Simulated zone data generator based on zip code
const generateZoneData = (lat: number, lng: number): ZoneData[] => {
  const zones: ZoneData[] = [];
  const gridSize = 0.015; // Approximately 1 mile
  
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const baseLat = lat + i * gridSize;
      const baseLng = lng + j * gridSize;
      
      // Generate pseudo-random data based on position
      const hash = Math.abs(Math.sin(baseLat * 1000) * Math.cos(baseLng * 1000));
      const homeAge = 20 + Math.floor(hash * 60);
      const incomeLevel = hash > 0.6 ? 'high' : hash > 0.3 ? 'medium' : 'low';
      
      // Demand is higher for older homes in higher income areas
      let demandLevel: 'high' | 'medium' | 'low' = 'low';
      if (homeAge > 40 && incomeLevel === 'high') {
        demandLevel = 'high';
      } else if (homeAge > 30 || incomeLevel === 'high') {
        demandLevel = 'medium';
      }
      
      zones.push({
        id: `${i}-${j}`,
        coords: [
          [baseLat, baseLng],
          [baseLat + gridSize, baseLng],
          [baseLat + gridSize, baseLng + gridSize],
          [baseLat, baseLng + gridSize],
        ],
        demandLevel,
        avgHomeAge: homeAge,
        avgHomeValue: 150000 + Math.floor(hash * 500000),
        totalHomes: 100 + Math.floor(hash * 400),
        incomeLevel,
      });
    }
  }
  
  return zones;
};

// ZIP code to coordinates (simplified - in production use a geocoding API)
const zipToCoords: Record<string, [number, number]> = {
  '10001': [40.7484, -73.9967], // NYC
  '90210': [34.0901, -118.4065], // Beverly Hills
  '60601': [41.8819, -87.6278], // Chicago
  '77001': [29.7604, -95.3698], // Houston
  '85001': [33.4484, -112.0740], // Phoenix
  '98101': [47.6062, -122.3321], // Seattle
  '33101': [25.7617, -80.1918], // Miami
  '30301': [33.7490, -84.3880], // Atlanta
  '02101': [42.3601, -71.0589], // Boston
  '19101': [39.9526, -75.1652], // Philadelphia
};

const demandColors = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  
  return null;
}

export default function HeatMap() {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // US center
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);

  const handleSearch = async () => {
    if (zipCode.length < 5) return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Get coordinates from zip or generate based on zip
    let coords = zipToCoords[zipCode];
    if (!coords) {
      // Generate pseudo-random coordinates within continental US
      const hash = zipCode.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      coords = [
        33 + (hash % 14), // Lat between 33-47
        -122 + (hash % 50), // Lng between -122 and -72
      ];
    }
    
    setMapCenter(coords);
    setZones(generateZoneData(coords[0], coords[1]));
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (zones.length === 0) return null;
    
    const highDemand = zones.filter(z => z.demandLevel === 'high').length;
    const avgAge = Math.round(zones.reduce((a, z) => a + z.avgHomeAge, 0) / zones.length);
    const avgValue = Math.round(zones.reduce((a, z) => a + z.avgHomeValue, 0) / zones.length);
    const totalHomes = zones.reduce((a, z) => a + z.totalHomes, 0);
    
    return { highDemand, avgAge, avgValue, totalHomes };
  }, [zones]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Heat Map</h1>
          <p className="text-slate-400">Discover high-demand areas for contracting work</p>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-xs">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP code..."
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={loading || zipCode.length < 5}
                className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search Area
              </Button>
              <div className="flex gap-2 text-sm text-slate-400">
                <span>Try:</span>
                {['10001', '90210', '60601', '77001'].map(zip => (
                  <button
                    key={zip}
                    onClick={() => {
                      setZipCode(zip);
                    }}
                    className="text-sky-400 hover:underline"
                  >
                    {zip}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map */}
          <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700 overflow-hidden">
            <div className="h-[500px]">
              <MapContainer
                center={mapCenter}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={mapCenter} />
                
                {zones.map(zone => (
                  <Polygon
                    key={zone.id}
                    positions={zone.coords}
                    pathOptions={{
                      fillColor: demandColors[zone.demandLevel],
                      fillOpacity: 0.5,
                      color: demandColors[zone.demandLevel],
                      weight: 1,
                    }}
                    eventHandlers={{
                      click: () => setSelectedZone(zone),
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold capitalize">{zone.demandLevel} Demand</p>
                        <p>Avg Home Age: {zone.avgHomeAge} years</p>
                        <p>Avg Value: ${zone.avgHomeValue.toLocaleString()}</p>
                        <p>Homes: {zone.totalHomes}</p>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </MapContainer>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Demand Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: demandColors.high }} />
                  <div>
                    <p className="font-medium text-white text-sm">High Demand</p>
                    <p className="text-xs text-slate-400">Older homes, high income</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: demandColors.medium }} />
                  <div>
                    <p className="font-medium text-white text-sm">Medium Demand</p>
                    <p className="text-xs text-slate-400">Mixed conditions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: demandColors.low }} />
                  <div>
                    <p className="font-medium text-white text-sm">Lower Demand</p>
                    <p className="text-xs text-slate-400">Newer construction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Area Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Area Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Calendar className="w-3 h-3" />
                        Avg Home Age
                      </div>
                      <p className="text-xl font-bold text-white">{stats.avgAge} years</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <DollarSign className="w-3 h-3" />
                        Avg Home Value
                      </div>
                      <p className="text-xl font-bold text-white">${stats.avgValue.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <TrendingUp className="w-3 h-3" />
                        High Demand Zones
                      </div>
                      <p className="text-xl font-bold text-red-400">{stats.highDemand} / {zones.length}</p>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Building2 className="w-3 h-3" />
                        Total Homes
                      </div>
                      <p className="text-xl font-bold text-white">{stats.totalHomes.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4 text-sm">
                    Search a ZIP code to see statistics
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Zone */}
            {selectedZone && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base">Selected Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-2 rounded text-white text-center font-semibold mb-3 capitalize"
                    style={{ backgroundColor: demandColors[selectedZone.demandLevel] }}
                  >
                    {selectedZone.demandLevel} Demand
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Home Age</span>
                      <span className="text-white">{selectedZone.avgHomeAge} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Value</span>
                      <span className="text-white">${selectedZone.avgHomeValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Income Level</span>
                      <span className="text-white capitalize">{selectedZone.incomeLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Homes in Zone</span>
                      <span className="text-white">{selectedZone.totalHomes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6 bg-sky-500/10 border-sky-500/30">
          <CardContent className="py-4">
            <p className="text-sm text-sky-300 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              This heat map estimates demand based on property age, income levels, and home values. 
              High demand areas typically have older homes in affluent neighborhoods where renovation budgets are larger.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
