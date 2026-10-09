import PDFDocument from "pdfkit";

function formatCurrency(val, currency = "INR") {
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  return symbol + Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateInvoicePdfBuffer(invoice, tenant) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#0f172a";
      const brandColor = "#4f46e5";
      const tableHeaderBg = "#f8fafc";
      const borderColor = "#e2e8f0";
      const textMuted = "#64748b";

      // ─── Header: Company Info ───
      const companyName = tenant?.companyName || "Business OS Enterprise";
      doc.fontSize(22).fillColor(brandColor).font("Helvetica-Bold").text(companyName, 40, 40);

      doc.fontSize(9).fillColor(textMuted).font("Helvetica");
      const companyAddress = [
        tenant?.address,
        tenant?.city,
        tenant?.state,
        tenant?.country,
        tenant?.postalCode ? `PIN: ${tenant.postalCode}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      if (companyAddress) doc.text(companyAddress, 40, 68);
      if (tenant?.businessEmail || tenant?.businessPhone) {
        doc.text(
          `Email: ${tenant?.businessEmail || "info@businessos.internal"}  |  Phone: ${
            tenant?.businessPhone || "N/A"
          }`,
          40,
          81
        );
      }

      // ─── Header: Invoice Title & Meta Box (Right) ───
      doc.fontSize(16).fillColor(primaryColor).font("Helvetica-Bold").text("TAX INVOICE", 330, 40, { align: "right" });
      doc.fontSize(10).fillColor(textMuted).font("Helvetica");
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 330, 62, { align: "right" });
      
      const issueDate = invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("en-IN");
      doc.text(`Issue Date: ${issueDate}`, 330, 76, { align: "right" });

      if (invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
        doc.text(`Due Date: ${dueDate}`, 330, 90, { align: "right" });
      }

      const statusColor = invoice.status === "PAID" ? "#059669" : invoice.status === "PARTIAL" ? "#d97706" : "#dc2626";
      doc.fontSize(10).fillColor(statusColor).font("Helvetica-Bold").text(
        `Status: ${invoice.status}`,
        330,
        invoice.dueDate ? 104 : 90,
        { align: "right" }
      );

      // Divider Line
      doc.moveTo(40, 125).lineTo(555, 125).strokeColor(borderColor).stroke();

      // ─── Customer Details Box ───
      const customerBoxY = 135;
      doc.rect(40, customerBoxY, 515, 65).fillAndStroke("#f8fafc", borderColor);
      doc.fillColor(primaryColor).fontSize(9).font("Helvetica-Bold").text("BILLED TO:", 50, customerBoxY + 10);
      doc.font("Helvetica-Bold").fontSize(10).text(invoice.customer?.name || "Customer", 50, customerBoxY + 24);

      doc.font("Helvetica").fontSize(8.5).fillColor(textMuted);
      if (invoice.customer?.email) {
        doc.text(`Email: ${invoice.customer.email}`, 50, customerBoxY + 38);
      }
      if (invoice.customer?.phone) {
        doc.text(`Phone: ${invoice.customer.phone}`, 50, customerBoxY + 50);
      }
      if (invoice.customer?.taxId) {
        doc.text(`GST / Tax ID: ${invoice.customer.taxId}`, 320, customerBoxY + 24);
      }
      if (invoice.paymentMethod) {
        doc.text(`Payment Mode: ${invoice.paymentMethod}`, 320, customerBoxY + 38);
      }

      // ─── Items Table ───
      const tableY = 215;
      doc.rect(40, tableY, 515, 22).fillAndStroke(tableHeaderBg, borderColor);

      doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold");
      doc.text("#", 48, tableY + 6, { width: 20 });
      doc.text("ITEM / SERVICE DESCRIPTION", 75, tableY + 6, { width: 240 });
      doc.text("QTY", 320, tableY + 6, { width: 40, align: "right" });
      doc.text("RATE", 370, tableY + 6, { width: 70, align: "right" });
      doc.text("TAX", 445, tableY + 6, { width: 40, align: "right" });
      doc.text("AMOUNT", 490, tableY + 6, { width: 60, align: "right" });

      let currentY = tableY + 28;
      const items = Array.isArray(invoice.items) && invoice.items.length > 0 ? invoice.items : [];

      items.forEach((item, index) => {
        doc.font("Helvetica").fontSize(8.5).fillColor("#334155");
        doc.text((index + 1).toString(), 48, currentY, { width: 20 });
        doc.font("Helvetica-Bold").text(item.name || "Item", 75, currentY, { width: 240 });

        doc.font("Helvetica");
        doc.text(String(item.quantity || 1), 320, currentY, { width: 40, align: "right" });
        doc.text(formatCurrency(item.unitPrice, invoice.currency), 370, currentY, { width: 70, align: "right" });
        doc.text(`${item.taxRate || 0}%`, 445, currentY, { width: 40, align: "right" });
        doc.text(formatCurrency(item.total, invoice.currency), 490, currentY, { width: 60, align: "right" });

        currentY += 18;
      });

      // Divider below items
      currentY = Math.max(currentY, tableY + 90);
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).stroke();

      // ─── Summary Totals Box (Right aligned) ───
      const summaryY = currentY + 10;
      const rightColLabel = 360;
      const rightColValue = 475;
      const rightColWidth = 80;

      doc.font("Helvetica").fontSize(8.5).fillColor(textMuted);
      doc.text("Subtotal:", rightColLabel, summaryY);
      doc.fillColor(primaryColor).text(formatCurrency(invoice.subtotal, invoice.currency), rightColValue, summaryY, { width: rightColWidth, align: "right" });

      doc.fillColor(textMuted).text("Tax:", rightColLabel, summaryY + 16);
      doc.fillColor(primaryColor).text(formatCurrency(invoice.taxTotal, invoice.currency), rightColValue, summaryY + 16, { width: rightColWidth, align: "right" });

      if (invoice.discountTotal > 0) {
        doc.fillColor("#059669").text("Discount:", rightColLabel, summaryY + 32);
        doc.fillColor("#059669").text(`-${formatCurrency(invoice.discountTotal, invoice.currency)}`, rightColValue, summaryY + 32, { width: rightColWidth, align: "right" });
      }

      // Grand Total Box
      const grandTotalBoxY = summaryY + (invoice.discountTotal > 0 ? 52 : 36);
      doc.rect(350, grandTotalBoxY, 205, 28).fillAndStroke("#eef2ff", brandColor);

      doc.fillColor("#4338ca").fontSize(10).font("Helvetica-Bold").text("GRAND TOTAL:", 360, grandTotalBoxY + 8);
      doc.fillColor("#1e1b4b").fontSize(12).font("Helvetica-Bold").text(
        formatCurrency(invoice.grandTotal, invoice.currency),
        rightColValue,
        grandTotalBoxY + 7,
        { width: rightColWidth, align: "right" }
      );

      // Payment Details
      let payDetailsY = grandTotalBoxY + 36;
      doc.font("Helvetica").fontSize(8.5).fillColor(textMuted);
      doc.text("Amount Paid:", rightColLabel, payDetailsY);
      doc.fillColor("#059669").font("Helvetica-Bold").text(formatCurrency(invoice.amountPaid, invoice.currency), rightColValue, payDetailsY, { width: rightColWidth, align: "right" });

      payDetailsY += 16;
      doc.font("Helvetica").fillColor(textMuted).text("Balance Due:", rightColLabel, payDetailsY);
      const balanceColor = invoice.balanceDue > 0 ? "#dc2626" : "#059669";
      doc.fillColor(balanceColor).font("Helvetica-Bold").text(formatCurrency(invoice.balanceDue, invoice.currency), rightColValue, payDetailsY, { width: rightColWidth, align: "right" });

      // Left Notes / Terms
      if (invoice.notes) {
        doc.rect(40, summaryY, 280, 70).fillAndStroke("#f8fafc", borderColor);
        doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold").text("Notes / Remarks:", 48, summaryY + 8);
        doc.font("Helvetica").fontSize(8).fillColor(textMuted).text(invoice.notes, 48, summaryY + 22, { width: 260 });
      }

      // ─── Footer & Sign Off ───
      const footerY = 740;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(borderColor).stroke();
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(
        "Thank you for doing business with us! This is a system-generated computer invoice.",
        40,
        footerY + 10,
        { width: 515, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
