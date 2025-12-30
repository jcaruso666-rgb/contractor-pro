import { jsPDF } from 'jspdf';
import { Project } from './types';
import { CompanyInfo } from './storage';

interface PDFOptions {
  project: Project;
  company: CompanyInfo;
  paymentTerms?: string;
  timeline?: string;
  termsAndConditions?: string;
}

export function generateEstimatePDF(options: PDFOptions) {
  const { project, company, paymentTerms, timeline, termsAndConditions } = options;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    y += lines.length * (fontSize * 0.4) + 2;
  };

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Blue color
  doc.text(company.name || 'Your Company Name', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (company.address) {
    doc.text(company.address, margin, y);
    y += 5;
  }
  
  const contactLine = [company.phone, company.email].filter(Boolean).join(' • ');
  if (contactLine) {
    doc.text(contactLine, margin, y);
    y += 5;
  }
  
  if (company.license) {
    doc.text(`License: ${company.license}`, margin, y);
    y += 5;
  }

  // Divider line
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Estimate Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PROJECT ESTIMATE', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Date and Estimate Number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const dateStr = `Date: ${new Date().toLocaleDateString()}`;
  const estimateNum = `Estimate #: ${project.id.substring(0, 8).toUpperCase()}`;
  doc.text(dateStr, margin, y);
  doc.text(estimateNum, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Client and Property Info boxes
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth / 2 - 5, 30, 'F');
  doc.rect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 30, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('CLIENT', margin + 5, y + 8);
  doc.text('PROPERTY', margin + contentWidth / 2 + 10, y + 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(project.clientName || 'TBD', margin + 5, y + 18);
  
  // Split long addresses
  const addressLines = doc.splitTextToSize(project.propertyAddress || 'TBD', contentWidth / 2 - 15);
  doc.text(addressLines, margin + contentWidth / 2 + 10, y + 18);
  
  y += 40;

  // Project Breakdown Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Breakdown', margin, y);
  y += 8;

  // Table Header
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, y, contentWidth, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Description', margin + 5, y + 7);
  doc.text('Qty', margin + 90, y + 7);
  doc.text('Unit Price', margin + 110, y + 7);
  doc.text('Total', pageWidth - margin - 5, y + 7, { align: 'right' });
  y += 12;

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Table rows
  let rowAlternate = false;
  
  project.categories.forEach(category => {
    // Category header
    doc.setFillColor(240, 249, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(category.type.charAt(0).toUpperCase() + category.type.slice(1), margin + 5, y + 6);
    y += 10;

    // Category items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    category.items.forEach(item => {
      if (rowAlternate) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 2, contentWidth, 8, 'F');
      }
      rowAlternate = !rowAlternate;

      // Truncate long descriptions
      const desc = item.description.length > 40 
        ? item.description.substring(0, 37) + '...' 
        : item.description;
      
      doc.text(desc, margin + 5, y + 3);
      doc.text(item.quantity.toString(), margin + 90, y + 3);
      doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 110, y + 3);
      doc.text(`$${item.total.toLocaleString()}`, pageWidth - margin - 5, y + 3, { align: 'right' });
      y += 8;

      // Check for page overflow
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    // Category subtotal
    doc.setFont('helvetica', 'bold');
    doc.text(`${category.type} Subtotal:`, margin + 100, y + 3);
    doc.text(`$${category.subtotal.toLocaleString()}`, pageWidth - margin - 5, y + 3, { align: 'right' });
    y += 10;
    doc.setFont('helvetica', 'normal');
  });

  // Totals section
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + contentWidth / 2, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(11);
  const totalsX = margin + contentWidth / 2 + 20;
  
  doc.text('Subtotal:', totalsX, y);
  doc.text(`$${project.subtotal.toLocaleString()}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 7;

  doc.text('Tax (8%):', totalsX, y);
  doc.text(`$${project.tax.toLocaleString()}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 7;

  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL:', totalsX, y);
  doc.text(`$${project.total.toLocaleString()}`, pageWidth - margin - 5, y, { align: 'right' });
  y += 15;

  // Check for page overflow before terms
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  // Payment Terms
  if (paymentTerms) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Terms', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    addWrappedText(paymentTerms, margin, contentWidth);
    y += 5;
  }

  // Timeline
  if (timeline) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Timeline', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    addWrappedText(timeline, margin, contentWidth);
    y += 5;
  }

  // Terms and Conditions
  if (termsAndConditions) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    addWrappedText(termsAndConditions, margin, contentWidth, 9);
    y += 5;
  }

  // Signature section
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Two signature columns
  const sigWidth = (contentWidth - 20) / 2;
  
  doc.text('Client Acceptance:', margin, y);
  doc.text('Contractor:', margin + sigWidth + 20, y);
  y += 20;

  // Signature lines
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, y, margin + sigWidth, y);
  doc.line(margin + sigWidth + 20, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Signature', margin, y);
  doc.text('Date', margin + sigWidth - 30, y);
  doc.text('Signature', margin + sigWidth + 20, y);
  doc.text('Date', pageWidth - margin - 30, y);

  y += 12;
  doc.line(margin, y, margin + sigWidth, y);
  doc.line(margin + sigWidth + 20, y, pageWidth - margin, y);
  y += 5;
  doc.text('Print Name', margin, y);
  doc.text('Print Name', margin + sigWidth + 20, y);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'This estimate is valid for 30 days from the date above.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  return doc;
}

export function downloadEstimatePDF(options: PDFOptions) {
  const doc = generateEstimatePDF(options);
  const fileName = `Estimate_${options.project.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
