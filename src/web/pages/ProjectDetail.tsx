import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { 
  ArrowLeft,
  Save,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { AddressInput } from '@/components/AddressInput';
import { BiddingSuggestions } from '@/components/BiddingSuggestions';
import { getProjects, saveProject, generateId } from '@/lib/storage';
import { Project, PropertyData, ProjectCategory, CategoryType } from '@/lib/types';

const statusOptions = [
  { value: 'quote', label: 'Quote', color: 'bg-amber-500' },
  { value: 'approved', label: 'Approved', color: 'bg-sky-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
];

const categoryTypes: { type: CategoryType; label: string }[] = [
  { type: 'roofing', label: 'Roofing' },
  { type: 'windows', label: 'Windows' },
  { type: 'gutters', label: 'Gutters' },
  { type: 'siding', label: 'Siding' },
  { type: 'doors', label: 'Doors' },
  { type: 'painting', label: 'Painting' },
  { type: 'concrete', label: 'Concrete' },
  { type: 'fencing', label: 'Fencing' },
];

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const projects = getProjects();
    const found = projects.find(p => p.id === params.id);
    
    if (params.id === 'new') {
      const newProject: Project = {
        id: generateId(),
        clientId: '',
        clientName: '',
        propertyAddress: '',
        status: 'quote',
        categories: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: '',
      };
      setProject(newProject);
      setEditing(true);
    } else if (found) {
      setProject(found);
    }
    setLoading(false);
  }, [params.id]);

  const handleSave = () => {
    if (!project) return;
    
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };
    saveProject(updated);
    setProject(updated);
    setEditing(false);
  };

  const updateField = (field: keyof Project, value: unknown) => {
    if (!project) return;
    setProject({ ...project, [field]: value });
  };

  const handlePropertyData = (data: PropertyData) => {
    if (!project) return;
    setProject({
      ...project,
      propertyAddress: data.address,
      propertyData: data,
    });
  };

  const addCategory = (type: CategoryType) => {
    if (!project) return;
    const existing = project.categories.find(c => c.type === type);
    if (existing) return;
    
    const newCategory: ProjectCategory = {
      type,
      items: [],
      subtotal: 0,
    };
    setProject({
      ...project,
      categories: [...project.categories, newCategory],
    });
  };

  const removeCategory = (type: CategoryType) => {
    if (!project) return;
    setProject({
      ...project,
      categories: project.categories.filter(c => c.type !== type),
    });
    recalculateTotals();
  };

  const recalculateTotals = () => {
    if (!project) return;
    const subtotal = project.categories.reduce((sum, cat) => sum + cat.subtotal, 0);
    const tax = subtotal * 0.08; // 8% tax
    setProject({
      ...project,
      subtotal,
      tax,
      total: subtotal + tax,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project not found</h1>
          <Link href="/projects">
            <Button className="bg-sky-500 hover:bg-sky-600">
              Back to Projects
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="outline" size="icon" className="border-slate-600 text-slate-400 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {params.id === 'new' ? 'New Project' : 'Edit Project'}
              </h1>
              <p className="text-slate-400">
                {project.propertyAddress || 'Enter property address to start'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Save className="w-4 h-4" />
                Save Project
              </Button>
            ) : (
              <Button onClick={() => setEditing(true)} className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="details" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="estimate" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Estimate
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Property Address */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-400" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressInput 
                  onPropertyData={handlePropertyData}
                  initialAddress={project.propertyAddress}
                />
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-400" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Client Name</Label>
                  <Input
                    value={project.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                    placeholder="Enter client name"
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <div className="flex gap-2 mt-1.5">
                    {statusOptions.map(option => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={project.status === option.value ? 'default' : 'outline'}
                        onClick={() => editing && updateField('status', option.value)}
                        className={project.status === option.value 
                          ? `${option.color} text-white` 
                          : 'border-slate-600 text-slate-400'
                        }
                        disabled={!editing}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Measurements */}
            {project.propertyData && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Property Measurements</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-slate-400">Lot Size (sq ft)</Label>
                    <Input
                      type="number"
                      value={project.propertyData.lotSize || ''}
                      onChange={(e) => updateField('propertyData', {
                        ...project.propertyData,
                        lotSize: Number(e.target.value)
                      })}
                      className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Building Area (sq ft)</Label>
                    <Input
                      type="number"
                      value={project.propertyData.buildingArea || ''}
                      onChange={(e) => updateField('propertyData', {
                        ...project.propertyData,
                        buildingArea: Number(e.target.value)
                      })}
                      className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Roof Area (sq ft)</Label>
                    <Input
                      type="number"
                      value={project.propertyData.roofArea || ''}
                      onChange={(e) => updateField('propertyData', {
                        ...project.propertyData,
                        roofArea: Number(e.target.value)
                      })}
                      className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-400">Perimeter (lin ft)</Label>
                    <Input
                      type="number"
                      value={project.propertyData.perimeter || ''}
                      onChange={(e) => updateField('propertyData', {
                        ...project.propertyData,
                        perimeter: Number(e.target.value)
                      })}
                      className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                      disabled={!editing}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Estimate Tab */}
          <TabsContent value="estimate" className="space-y-6">
            {/* Add Categories */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Project Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoryTypes.map(cat => {
                    const hasCategory = project.categories.some(c => c.type === cat.type);
                    return (
                      <Button
                        key={cat.type}
                        size="sm"
                        variant={hasCategory ? 'default' : 'outline'}
                        onClick={() => hasCategory ? removeCategory(cat.type) : addCategory(cat.type)}
                        className={hasCategory 
                          ? 'bg-sky-500 text-white' 
                          : 'border-slate-600 text-slate-400 hover:bg-slate-700'
                        }
                      >
                        {hasCategory && <Check className="w-3 h-3 mr-1" />}
                        {cat.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Category Details */}
            {project.categories.map(category => (
              <Card key={category.type} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white capitalize">{category.type}</CardTitle>
                  <Link href={`/tools?calculator=${category.type}&projectId=${project.id}`}>
                    <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white gap-1">
                      <Plus className="w-3 h-3" />
                      Add Items
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {category.items.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No items added yet. Click "Add Items" to use the calculator.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {category.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-300">{item.description}</span>
                          <span className="text-white font-medium">${item.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Totals */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${project.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (8%)</span>
                    <span>${project.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3 flex justify-between">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-sky-400">${project.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bidding Suggestions */}
            <BiddingSuggestions projectTotal={project.total} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  Project Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={project.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full h-64 p-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
                  placeholder="Add notes about this project..."
                  disabled={!editing}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
