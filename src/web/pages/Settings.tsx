import { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  RefreshCw, 
  DollarSign, 
  Users, 
  Building2, 
  Download, 
  Upload,
  Trash2,
  Plus,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getPricing, 
  savePricing, 
  getClients, 
  saveClient, 
  deleteClient,
  getCompanyInfo,
  saveCompanyInfo,
  exportAllData,
  importAllData,
  generateId,
  CompanyInfo
} from '@/lib/storage';
import { PricingData, DEFAULT_PRICING, Client } from '@/lib/types';

export default function Settings() {
  const [pricing, setPricing] = useState<PricingData>(getPricing());
  const [clients, setClients] = useState<Client[]>(getClients());
  const [company, setCompany] = useState<CompanyInfo>(getCompanyInfo());
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const handleSavePricing = () => {
    savePricing(pricing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetPricing = () => {
    if (confirm('Reset all prices to defaults?')) {
      setPricing(DEFAULT_PRICING);
      savePricing(DEFAULT_PRICING);
    }
  };

  const handleSaveCompany = () => {
    saveCompanyInfo(company);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contractor-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        importAllData(data);
        setPricing(getPricing());
        setClients(getClients());
        setCompany(getCompanyInfo());
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveClient = (client: Client) => {
    saveClient(client);
    setClients(getClients());
    setEditingClient(null);
    setShowNewClient(false);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Delete this client?')) {
      deleteClient(id);
      setClients(getClients());
    }
  };

  const newClient: Client = {
    id: generateId(),
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400">Manage pricing, clients, and company info</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pricing">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="pricing" className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <DollarSign className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <Building2 className="w-4 h-4" />
              Company
            </TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Material & Labor Pricing</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPricing}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Defaults
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePricing}
                    className="bg-sky-500 hover:bg-sky-600 text-white gap-1"
                  >
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? 'Saved!' : 'Save'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Roofing */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Roofing (per square)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Shingles</Label>
                      <Input
                        type="number"
                        value={pricing.roofing.shingles.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          roofing: {
                            ...pricing.roofing,
                            shingles: { ...pricing.roofing.shingles, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Metal</Label>
                      <Input
                        type="number"
                        value={pricing.roofing.metal.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          roofing: {
                            ...pricing.roofing,
                            metal: { ...pricing.roofing.metal, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Tile</Label>
                      <Input
                        type="number"
                        value={pricing.roofing.tile.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          roofing: {
                            ...pricing.roofing,
                            tile: { ...pricing.roofing.tile, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Labor Rate ($/hr)</Label>
                      <Input
                        type="number"
                        value={pricing.roofing.laborRate}
                        onChange={(e) => setPricing({
                          ...pricing,
                          roofing: { ...pricing.roofing, laborRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Windows (per window)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Single Hung</Label>
                      <Input
                        type="number"
                        value={pricing.windows.singleHung.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          windows: {
                            ...pricing.windows,
                            singleHung: { ...pricing.windows.singleHung, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Double Hung</Label>
                      <Input
                        type="number"
                        value={pricing.windows.doubleHung.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          windows: {
                            ...pricing.windows,
                            doubleHung: { ...pricing.windows.doubleHung, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Casement</Label>
                      <Input
                        type="number"
                        value={pricing.windows.casement.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          windows: {
                            ...pricing.windows,
                            casement: { ...pricing.windows.casement, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Sliding</Label>
                      <Input
                        type="number"
                        value={pricing.windows.sliding.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          windows: {
                            ...pricing.windows,
                            sliding: { ...pricing.windows.sliding, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Labor ($/hr)</Label>
                      <Input
                        type="number"
                        value={pricing.windows.laborRate}
                        onChange={(e) => setPricing({
                          ...pricing,
                          windows: { ...pricing.windows, laborRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Gutters */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Gutters (per linear ft)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Aluminum</Label>
                      <Input
                        type="number"
                        value={pricing.gutters.aluminum.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          gutters: {
                            ...pricing.gutters,
                            aluminum: { ...pricing.gutters.aluminum, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Copper</Label>
                      <Input
                        type="number"
                        value={pricing.gutters.copper.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          gutters: {
                            ...pricing.gutters,
                            copper: { ...pricing.gutters.copper, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Vinyl</Label>
                      <Input
                        type="number"
                        value={pricing.gutters.vinyl.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          gutters: {
                            ...pricing.gutters,
                            vinyl: { ...pricing.gutters.vinyl, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Labor ($/hr)</Label>
                      <Input
                        type="number"
                        value={pricing.gutters.laborRate}
                        onChange={(e) => setPricing({
                          ...pricing,
                          gutters: { ...pricing.gutters, laborRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Siding */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Siding (per sq ft)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-slate-400 text-xs">Vinyl</Label>
                      <Input
                        type="number"
                        value={pricing.siding.vinyl.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          siding: {
                            ...pricing.siding,
                            vinyl: { ...pricing.siding.vinyl, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Fiber Cement</Label>
                      <Input
                        type="number"
                        value={pricing.siding.fiberCement.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          siding: {
                            ...pricing.siding,
                            fiberCement: { ...pricing.siding.fiberCement, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Wood</Label>
                      <Input
                        type="number"
                        value={pricing.siding.wood.default}
                        onChange={(e) => setPricing({
                          ...pricing,
                          siding: {
                            ...pricing.siding,
                            wood: { ...pricing.siding.wood, default: parseFloat(e.target.value) || 0 }
                          }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-xs">Labor ($/hr)</Label>
                      <Input
                        type="number"
                        value={pricing.siding.laborRate}
                        onChange={(e) => setPricing({
                          ...pricing,
                          siding: { ...pricing.siding, laborRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="mt-1 bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* More categories... */}
                <p className="text-sm text-slate-400">
                  Prices are automatically applied to all calculators. Adjust for your local market rates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Client Management</CardTitle>
                <Button
                  onClick={() => {
                    setEditingClient(newClient);
                    setShowNewClient(true);
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              </CardHeader>
              <CardContent>
                {clients.length === 0 && !showNewClient ? (
                  <p className="text-slate-400 text-center py-8">
                    No clients yet. Add your first client to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* New Client Form */}
                    {showNewClient && editingClient && (
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-sky-500/50">
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-slate-400">Name</Label>
                            <Input
                              value={editingClient.name}
                              onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                              className="mt-1 bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-400">Phone</Label>
                            <Input
                              value={editingClient.phone}
                              onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                              className="mt-1 bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-400">Email</Label>
                            <Input
                              value={editingClient.email}
                              onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                              className="mt-1 bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-400">Address</Label>
                            <Input
                              value={editingClient.address}
                              onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                              className="mt-1 bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveClient(editingClient)}
                            className="bg-sky-500 hover:bg-sky-600 text-white gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingClient(null);
                              setShowNewClient(false);
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Client List */}
                    {clients.map(client => (
                      <div
                        key={client.id}
                        className="p-4 bg-slate-900/50 rounded-lg flex items-start justify-between"
                      >
                        <div>
                          <p className="font-semibold text-white">{client.name}</p>
                          <p className="text-sm text-slate-400">
                            {[client.phone, client.email].filter(Boolean).join(' • ')}
                          </p>
                          {client.address && (
                            <p className="text-sm text-slate-500">{client.address}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingClient(client)}
                            className="h-8 w-8 text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClient(client.id)}
                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Company Information</CardTitle>
                <Button
                  onClick={handleSaveCompany}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-1"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Company Name</Label>
                    <Input
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      className="mt-1 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">License Number</Label>
                    <Input
                      value={company.license}
                      onChange={(e) => setCompany({ ...company, license: e.target.value })}
                      className="mt-1 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Phone</Label>
                    <Input
                      value={company.phone}
                      onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                      className="mt-1 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Email</Label>
                    <Input
                      value={company.email}
                      onChange={(e) => setCompany({ ...company, email: e.target.value })}
                      className="mt-1 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-slate-400">Address</Label>
                    <Input
                      value={company.address}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                      className="mt-1 bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  This information appears on all your estimates and PDF reports.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
