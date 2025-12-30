import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText, 
  Users,
  ArrowRight,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { AddressInput } from '@/components/AddressInput';
import { getProjects, getClients, generateId, saveProject } from '@/lib/storage';
import { Project, Client, PropertyData } from '@/lib/types';

const statusColors = {
  quote: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const statusLabels = {
  quote: 'Quote',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setProjects(getProjects());
    setClients(getClients());
  }, []);

  const stats = {
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    pendingQuotes: projects.filter(p => p.status === 'quote').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalRevenue: projects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.total, 0),
  };

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleNewProject = (propertyData: PropertyData) => {
    const newProject: Project = {
      id: generateId(),
      clientId: '',
      clientName: 'New Client',
      propertyAddress: propertyData.address,
      propertyData,
      status: 'quote',
      categories: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
    };
    saveProject(newProject);
    setProjects(getProjects());
    window.location.href = `/projects/${newProject.id}`;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-400 text-lg">
            Start a new estimate or manage your existing projects
          </p>
        </div>

        {/* Quick Start - Address Input */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-sky-400" />
              Quick Start New Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressInput onPropertyData={handleNewProject} />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Pending Quotes</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingQuotes}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.completedProjects}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Projects</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-sky-400 hover:text-sky-300 gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No projects yet. Start by entering an address above!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map(project => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-sky-500/50 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white truncate group-hover:text-sky-400 transition-colors">
                              {project.propertyAddress}
                            </p>
                            <p className="text-sm text-slate-400 mt-0.5">
                              {project.clientName} • {new Date(project.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold text-white">
                              ${project.total.toLocaleString()}
                            </p>
                            <Badge className={statusColors[project.status]}>
                              {statusLabels[project.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/projects/new">
                <Button className="w-full justify-start gap-3 bg-sky-500 hover:bg-sky-600 text-white">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <TrendingUp className="w-4 h-4" />
                  Calculators & Tools
                </Button>
              </Link>
              <Link href="/heatmap">
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <Users className="w-4 h-4" />
                  Find Hot Markets
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Clients Summary */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Clients ({clients.length})
            </CardTitle>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-sky-400 hover:text-sky-300">
                Manage Clients
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                Clients are automatically created when you start a project
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {clients.slice(0, 10).map(client => (
                  <Badge 
                    key={client.id} 
                    variant="outline" 
                    className="border-slate-600 text-slate-300"
                  >
                    {client.name}
                  </Badge>
                ))}
                {clients.length > 10 && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    +{clients.length - 10} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
