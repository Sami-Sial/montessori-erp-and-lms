import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a professional PDF invoice and trigger a browser download.
 *
 * @param {Object} invoice - The full invoice object from the API
 * @param {Object} [options] - Optional branding overrides
 * @param {string} [options.schoolName]  - School name for header
 * @param {string} [options.schoolAddress] - School address for header
 * @param {string} [options.schoolPhone]   - Contact phone
 * @param {string} [options.schoolEmail]   - Contact email
 */
export function downloadInvoicePdf(invoice, options = {}) {
  const {
    schoolName   = 'Montessori Academy',
    schoolAddress = '123 Learning Lane, Education City',
    schoolPhone   = '+1 (555) 000-1234',
    schoolEmail   = 'billing@montessori.edu',
  } = options;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  // ─── Colors ───────────────────────────────────────────────────────────────────
  const primaryColor   = [30, 41, 59];   // slate-800
  const accentColor    = [99, 102, 241];  // indigo-500
  const mutedColor     = [100, 116, 139]; // slate-500
  const lightBorder    = [226, 232, 240]; // slate-200

  // ─── Header bar ───────────────────────────────────────────────────────────────
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // School logo placeholder (monogram)
  doc.setFillColor(...accentColor);
  doc.roundedRect(margin, 12, 14, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('M', margin + 7, 21, { align: 'center' });

  // School name & details
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, margin + 18, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text(`${schoolAddress}  |  ${schoolPhone}  |  ${schoolEmail}`, margin + 18, 25);

  // ─── INVOICE title ────────────────────────────────────────────────────────────
  const titleY = 40;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', pageWidth - margin, titleY, { align: 'right' });

  // Invoice meta
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  const metaStartY = titleY + 8;
  const metaX = pageWidth - margin;
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, metaX, metaStartY, { align: 'right' });
  doc.text(`Issue Date: ${formatDate(invoice.issueDate ?? invoice.createdAt)}`, metaX, metaStartY + 5, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, metaX, metaStartY + 10, { align: 'right' });

  // Status badge
  const status = invoice.status ?? 'SENT';
  const statusColors = {
    PAID:           { bg: [220, 252, 231], text: [22, 163, 74] },
    PARTIALLY_PAID: { bg: [254, 249, 195], text: [161, 98, 7] },
    OVERDUE:        { bg: [254, 226, 226], text: [220, 38, 38] },
    SENT:           { bg: [224, 231, 255], text: [79, 70, 229] },
    DRAFT:          { bg: [241, 245, 249], text: [100, 116, 139] },
    CANCELLED:      { bg: [241, 245, 249], text: [100, 116, 139] },
  };
  const statusStyle = statusColors[status] ?? statusColors.SENT;
  const statusText = status.replace(/_/g, ' ');
  doc.setFontSize(8);
  const statusWidth = doc.getTextWidth(statusText) + 8;
  doc.setFillColor(...statusStyle.bg);
  doc.roundedRect(metaX - statusWidth, metaStartY + 14, statusWidth, 6, 2, 2, 'F');
  doc.setTextColor(...statusStyle.text);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, metaX - statusWidth / 2, metaStartY + 18.2, { align: 'center' });

  // ─── Bill To ──────────────────────────────────────────────────────────────────
  const billToY = titleY + 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('BILL TO', margin, billToY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  const studentName = invoice.student
    ? `${invoice.student.firstName} ${invoice.student.lastName}`
    : 'N/A';
  doc.text(studentName, margin, billToY + 6);

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  if (invoice.student?.studentNumber) {
    doc.text(`Student ID: ${invoice.student.studentNumber}`, margin, billToY + 11);
  }

  // Guardian info
  const guardian = invoice.student?.guardians?.[0]?.guardian;
  if (guardian) {
    doc.text(`Guardian: ${guardian.firstName} ${guardian.lastName}`, margin, billToY + 16);
    if (guardian.email) doc.text(guardian.email, margin, billToY + 21);
  }

  // ─── Divider ──────────────────────────────────────────────────────────────────
  const tableStartY = billToY + 30;
  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.4);
  doc.line(margin, tableStartY - 4, pageWidth - margin, tableStartY - 4);

  // ─── Line items table ─────────────────────────────────────────────────────────
  const lineItems = invoice.lineItems ?? [];
  const tableData = lineItems.map((item, i) => [
    i + 1,
    item.description ?? '—',
    item.quantity ?? 1,
    formatCurrency(item.unitPrice),
    formatCurrency((item.quantity ?? 1) * (item.unitPrice ?? 0)),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['#', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      textColor: primaryColor,
      lineColor: lightBorder,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [248, 250, 252], // slate-50
      textColor: mutedColor,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 28, halign: 'right', font: 'courier' },
      4: { cellWidth: 28, halign: 'right', font: 'courier' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    theme: 'grid',
  });

  // ─── Totals section ───────────────────────────────────────────────────────────
  const afterTableY = doc.lastAutoTable.finalY + 6;
  const totalsX = pageWidth - margin - 60;

  const totalAmount = Number(invoice.totalAmount ?? 0);
  const paidAmount  = Number(invoice.paidAmount ?? 0);
  const outstanding = totalAmount - paidAmount;

  const drawTotalRow = (label, value, y, bold = false) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...(bold ? primaryColor : mutedColor));
    doc.text(label, totalsX, y);
    doc.setTextColor(...primaryColor);
    doc.setFont('courier', bold ? 'bold' : 'normal');
    doc.text(value, pageWidth - margin, y, { align: 'right' });
  };

  drawTotalRow('Subtotal:', formatCurrency(totalAmount), afterTableY);
  if (paidAmount > 0) {
    drawTotalRow('Amount Paid:', `- ${formatCurrency(paidAmount)}`, afterTableY + 6);
  }

  // Outstanding divider
  const outstandingY = afterTableY + (paidAmount > 0 ? 14 : 8);
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.6);
  doc.line(totalsX, outstandingY, pageWidth - margin, outstandingY);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(outstanding > 0 ? [220, 38, 38] : [22, 163, 74]));
  doc.text('Amount Due:', totalsX, outstandingY + 6);
  doc.setFont('courier', 'bold');
  doc.text(formatCurrency(outstanding), pageWidth - margin, outstandingY + 6, { align: 'right' });

  // ─── Notes ────────────────────────────────────────────────────────────────────
  if (invoice.notes) {
    const notesY = outstandingY + 18;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('NOTES', margin, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    doc.setFontSize(8);
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, notesY + 5);
  }

  // ─── Footer ───────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setDrawColor(...lightBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your prompt payment.', margin, footerY);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin, footerY, { align: 'right' });

  // ─── Bottom accent bar ────────────────────────────────────────────────────────
  doc.setFillColor(...accentColor);
  doc.rect(0, doc.internal.pageSize.getHeight() - 3, pageWidth, 3, 'F');

  // ─── Download ─────────────────────────────────────────────────────────────────
  doc.save(`${invoice.invoiceNumber ?? 'invoice'}.pdf`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value) {
  return `$${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}
