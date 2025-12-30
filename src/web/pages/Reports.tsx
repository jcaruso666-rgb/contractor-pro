import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Printer, Settings, Building2, Upload, Check, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProjects, getCompanyInfo, saveCompanyInfo, CompanyInfo } from '@/lib/storage';
import { Project } from '@/lib/types';
import { downloadEstimatePDF } from '@/lib/pdfGenerator';

const DEFAULT_PAYMENT_TERMS = `50% deposit required to begin work. Balance due upon completion. 
We accept check, cash, or credit card (3% processing fee applies).
Late payments subject to 1.5% monthly interest.`;

const DEFAULT_TIMELINE = `Work will commence within 2 weeks of signed contract and deposit.
Estimated completion: 3-5 business days (weather permitting).
Customer will be notified of any delays.`;

const DEFAULT_TERMS = `1. All materials and workmanship warranted for 1 year.
2. Customer responsible for obtaining necessary permits.
3. Changes to scope of work may result in additional charges.
4. Contractor not responsible for hidden damage discovered during work.
5. Work area will be cleaned upon completion.
6. Customer agrees to provide access to work area as needed.`;

export default function Reports() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(getCompanyInfo());
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_PAYMENT_TERMS);
  const [timeline, setTimeline] = useState(DEFAULT_TIMELINE);
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleSaveCompany = () => {
    saveCompanyInfo(companyInfo);
    setShowSettings(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo({
          ...companyInfo,
          logo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const handleGeneratePDF = async () => {
    if (!selectedProjectData) return;
    
    setGenerating(true);
    try {
      // Small delay for UX
      await new Promise(r => setTimeout(r, 500));
      
      downloadEstimatePDF({
        project: selectedProjectData,
        company: companyInfo,
        paymentTerms,
        timeline,
        termsAndConditions: terms,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
            <p className="text-slate-400">Generate professional PDF estimates</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
          >
            <Settings className="w-4 h-4" />
            Company Settings
          </Button>
        </div>

        {/* Company Settings */}
        {showSettings && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-400">Company Name</Label>
                  <Input
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">License Number</Label>
                  <Input
                    value={companyInfo.license}
                    onChange={(e) => setCompanyInfo({...companyInfo, license: e.target.value})}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Phone</Label>
                  <Input
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Email</Label>
                  <Input
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-slate-400">Address</Label>
                  <Input
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                    className="mt-1.5 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400">Company Logo</Label>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    {companyInfo.logo && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={companyInfo.logo} 
                          alt="Logo" 
                          className="h-8 w-auto rounded"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setCompanyInfo({...companyInfo, logo: undefined})}
                          className="h-6 w-6 text-red-400 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleSaveCompany}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Company Info
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Selection */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Project</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No projects available. Create a project first to generate reports.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedProject === project.id
                          ? 'bg-sky-500/20 border-sky-500 text-white'
                          : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <p className="font-medium truncate">{project.propertyAddress || 'No address'}</p>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-slate-400">{project.clientName || 'No client'}</span>
                        <span className="font-semibold">${project.total.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Options */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Report Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-400">Payment Terms</Label>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="mt-1.5 w-full h-24 p-3 bg-slate-900 border border-slate-700 rounded-md text-white text-sm resize-none"
                  placeholder="Enter payment terms..."
                />
              </div>
              <div>
                <Label className="text-slate-400">Project Timeline</Label>
                <textarea
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="mt-1.5 w-full h-20 p-3 bg-slate-900 border border-slate-700 rounded-md text-white text-sm resize-none"
                  placeholder="Enter project timeline..."
                />
              </div>
              <div>
                <Label className="text-slate-400">Terms & Conditions</Label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="mt-1.5 w-full h-28 p-3 bg-slate-900 border border-slate-700 rounded-md text-white text-sm resize-none"
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700 print:bg-white print:border-0">
          <CardHeader className="flex flex-row items-center justify-between print:hidden">
            <CardTitle className="text-white">Report Preview</CardTitle>
            {selectedProjectData && (
              <div className="flex gap-2">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={generating}
                  className="bg-sky-500 hover:bg-sky-600 text-white gap-2"
                >
                  <Download className="w-4 h-4" />
                  {generating ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handlePrint}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedProjectData ? (
              <div className="bg-white text-slate-900 rounded-lg p-8 text-sm print:p-0 print:rounded-none">
                {/* Header */}
                <div className="border-b-2 border-blue-900 pb-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-900">{companyInfo.name}</h2>
                      {companyInfo.address && <p className="text-slate-600">{companyInfo.address}</p>}
                      <p className="text-slate-600">
                        {[companyInfo.phone, companyInfo.email].filter(Boolean).join(' • ')}
                      </p>
                      {companyInfo.license && (
                        <p className="text-slate-500 text-xs mt-1">License: {companyInfo.license}</p>
                      )}
                    </div>
                    {companyInfo.logo && (
                      <img src={companyInfo.logo} alt="Logo" className="h-16 w-auto" />
                    )}
                  </div>
                </div>

                {/* Estimate Title */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">PROJECT ESTIMATE</h3>
                  <p className="text-slate-500">
                    Date: {new Date().toLocaleDateString()} | Estimate #: {selectedProjectData.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>

                {/* Client & Property */}
                <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 rounded">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</p>
                    <p className="font-medium">{selectedProjectData.clientName || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Property</p>
                    <p className="font-medium">{selectedProjectData.propertyAddress}</p>
                  </div>
                </div>

                {/* Project Breakdown */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-base">Project Breakdown</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2">Qty</th>
                        <th className="text-right p-2">Unit Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProjectData.categories.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                            No items added to this estimate
                          </td>
                        </tr>
                      ) : (
                        selectedProjectData.categories.map(cat => (
                          <>
                            <tr key={cat.type} className="bg-blue-50">
                              <td colSpan={4} className="p-2 font-semibold capitalize">{cat.type}</td>
                            </tr>
                            {cat.items.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-100">
                                <td className="p-2">{item.description}</td>
                                <td className="text-right p-2">{item.quantity}</td>
                                <td className="text-right p-2">${item.unitPrice.toFixed(2)}</td>
                                <td className="text-right p-2">${item.total.toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50">
                              <td colSpan={3} className="p-2 text-right font-medium">
                                {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)} Subtotal:
                              </td>
                              <td className="text-right p-2 font-medium">${cat.subtotal.toLocaleString()}</td>
                            </tr>
                          </>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span>Subtotal</span>
                      <span>${selectedProjectData.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Tax (8%)</span>
                      <span>${selectedProjectData.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-slate-900 font-bold text-lg">
                      <span>TOTAL</span>
                      <span className="text-blue-900">${selectedProjectData.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms sections */}
                <div className="grid md:grid-cols-2 gap-6 text-xs mb-8">
                  <div>
                    <h5 className="font-semibold mb-2">Payment Terms</h5>
                    <p className="text-slate-600 whitespace-pre-line">{paymentTerms}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">Project Timeline</h5>
                    <p className="text-slate-600 whitespace-pre-line">{timeline}</p>
                  </div>
                </div>

                <div className="text-xs mb-8">
                  <h5 className="font-semibold mb-2">Terms & Conditions</h5>
                  <p className="text-slate-600 whitespace-pre-line">{terms}</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t">
                  <div>
                    <p className="text-sm font-medium mb-4">Client Acceptance</p>
                    <div className="border-b border-slate-400 mb-1 h-10"></div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Signature</span>
                      <span>Date</span>
                    </div>
                    <div className="border-b border-slate-400 mb-1 h-8 mt-4"></div>
                    <p className="text-xs text-slate-500">Print Name</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-4">Contractor</p>
                    <div className="border-b border-slate-400 mb-1 h-10"></div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Signature</span>
                      <span>Date</span>
                    </div>
                    <div className="border-b border-slate-400 mb-1 h-8 mt-4"></div>
                    <p className="text-xs text-slate-500">Print Name</p>
                  </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-8">
                  This estimate is valid for 30 days from the date above.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a project to preview the report</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white,
          .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
