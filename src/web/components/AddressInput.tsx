import { useState } from 'react';
import { Search, MapPin, Home, Ruler, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyData } from '@/lib/types';

interface AddressInputProps {
  onPropertyData: (data: PropertyData) => void;
  initialAddress?: string;
}

export function AddressInput({ onPropertyData, initialAddress = '' }: AddressInputProps) {
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState('');

  const fetchPropertyData = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate geocoding with estimated property data
      // In production, this would use Google Maps Geocoding API
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Generate simulated property data based on address
      const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      
      const data: PropertyData = {
        address: address,
        lat: 40.7128 + (hash % 100) / 1000,
        lng: -74.0060 + (hash % 100) / 1000,
        lotSize: 5000 + (hash % 15000),
        buildingArea: 1500 + (hash % 3500),
        roofArea: Math.round((1500 + (hash % 3500)) * 1.15), // Roof typically 15% more than floor
        perimeter: Math.round(Math.sqrt(1500 + (hash % 3500)) * 4.2),
        yearBuilt: 1960 + (hash % 60),
        propertyType: hash % 2 === 0 ? 'Single Family' : 'Multi Family',
      };

      setPropertyData(data);
      onPropertyData(data);
    } catch (err) {
      setError('Failed to fetch property data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter property address..."
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20"
            onKeyDown={(e) => e.key === 'Enter' && fetchPropertyData()}
          />
        </div>
        <Button
          onClick={fetchPropertyData}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Lookup
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {propertyData && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-sky-400">
              <Home className="w-4 h-4" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Lot Size</p>
                <p className="text-lg font-semibold text-white">{propertyData.lotSize?.toLocaleString()} sq ft</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Building Area</p>
                <p className="text-lg font-semibold text-white">{propertyData.buildingArea?.toLocaleString()} sq ft</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Est. Roof Area</p>
                <p className="text-lg font-semibold text-white">{propertyData.roofArea?.toLocaleString()} sq ft</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Perimeter</p>
                <p className="text-lg font-semibold text-white">{propertyData.perimeter} lin ft</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Year Built</p>
                <p className="text-lg font-semibold text-white">{propertyData.yearBuilt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Property Type</p>
                <p className="text-lg font-semibold text-white">{propertyData.propertyType}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Coordinates</p>
                <p className="text-sm font-mono text-slate-300">{propertyData.lat.toFixed(4)}, {propertyData.lng.toFixed(4)}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
              <p className="text-sm text-sky-300 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                These estimates can be manually adjusted in project details
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
