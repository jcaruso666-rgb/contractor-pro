import { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { getProjects, deleteProject } from '@/lib/storage';
import { Project } from '@/lib/types';

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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.propertyAddress.toLowerCase().includes(search.toLowerCase()) ||
      project.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setProjects(getProjects());
    }
    setOpenMenu(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
            <p className="text-slate-400">Manage all your estimates and projects</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'quote', 'approved', 'in_progress', 'completed'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status 
                  ? 'bg-sky-500 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }
              >
                {status === 'all' ? 'All' : statusLabels[status as keyof typeof statusLabels]}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-16">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-slate-400 mb-6">
                {projects.length === 0 
                  ? "Get started by creating your first project"
                  : "Try adjusting your search or filters"
                }
              </p>
              <Link href="/projects/new">
                <Button className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map(project => (
              <Card 
                key={project.id} 
                className="bg-slate-800/50 border-slate-700 hover:border-sky-500/50 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-sky-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white truncate">
                            {project.propertyAddress}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {project.clientName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {project.categories.length} categories
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                      <p className="text-2xl font-bold text-white">
                        ${project.total.toLocaleString()}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
