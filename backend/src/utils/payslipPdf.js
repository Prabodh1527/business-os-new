import PDFDocument from "pdfkit";

// Helper: number to Indian words
function numberToWords(num) {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  num = Math.round(num);
  if (num === 0) return "Zero Rupees Only";
  if (num < 0) return "Negative " + numberToWords(Math.abs(num));

  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  }

  return "Rupees " + convert(num).trim() + " Only";
}

const formatCurrency = (val) => "INR " + Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function generatePayslipPdfBuffer(payroll, tenant, employee) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#1e293b";
      const accentColor = "#4f46e5";
      const tableHeaderBg = "#f1f5f9";
      const borderColor = "#cbd5e1";
      const textMuted = "#64748b";

      // ─── Header: Company Info ───
      const companyName = tenant?.companyName || "Business OS Enterprise";
      doc.fontSize(20).fillColor(accentColor).font("Helvetica-Bold").text(companyName, 40, 40);
      doc.fontSize(9).fillColor(textMuted).font("Helvetica");
      const companyAddress = [
        tenant?.address,
        tenant?.city,
        tenant?.state,
        tenant?.country,
        tenant?.postalCode ? "PIN: " + tenant.postalCode : null
      ].filter(Boolean).join(", ");

      if (companyAddress) doc.text(companyAddress, 40, 65);
      if (tenant?.businessEmail || tenant?.businessPhone) {
        doc.text("Email: " + (tenant?.businessEmail || "support@businessos.internal") + "  |  Phone: " + (tenant?.businessPhone || "N/A"), 40, 78);
      }

      // Payslip Title Box on Right
      doc.fontSize(14).fillColor(primaryColor).font("Helvetica-Bold").text("PAYSLIP / SALARY STATEMENT", 330, 40, { align: "right" });
      doc.fontSize(10).fillColor(textMuted).font("Helvetica").text("Pay Period: " + payroll.month, 330, 58, { align: "right" });
      doc.fontSize(9).text("Status: " + payroll.status.toUpperCase() + (payroll.paidDate ? " (" + payroll.paidDate + ")" : ""), 330, 72, { align: "right" });
      doc.fontSize(8).text("Ref #: " + (payroll.paymentRef || "PAY-" + (payroll._id?.toString().slice(-8) || "N/A")), 330, 85, { align: "right" });

      doc.moveTo(40, 105).lineTo(555, 105).strokeColor(borderColor).stroke();

      // ─── Employee & Attendance Details Grid ───
      const startY = 115;
      doc.rect(40, startY, 515, 75).fillAndStroke("#f8fafc", borderColor);

      doc.fillColor(primaryColor).fontSize(8.5).font("Helvetica-Bold");
      doc.text("EMPLOYEE DETAILS", 50, startY + 8);
      doc.text("ATTENDANCE & PAY DAYS", 310, startY + 8);

      doc.font("Helvetica").fontSize(8.5).fillColor("#334155");
      const empName = payroll.employee || employee?.name || "Staff";
      const empId = payroll.employeeId || employee?.employeeId || "EMP-001";
      const role = payroll.role || employee?.role || "Staff";
      const dept = payroll.department || employee?.department || "Operations";
      const joinDate = employee?.joinDate || "N/A";

      doc.text("Employee Name : " + empName, 50, startY + 24);
      doc.text("Employee ID   : " + empId, 50, startY + 38);
      doc.text("Designation   : " + role, 50, startY + 52);
      doc.text("Department    : " + dept + "   |   Joined: " + joinDate, 50, startY + 66);

      const workDays = payroll.workDaysInMonth || 26;
      const paidDays = payroll.paidDays !== undefined ? payroll.paidDays : workDays;
      const unpaidDays = payroll.unpaidDays !== undefined ? payroll.unpaidDays : Math.max(0, workDays - paidDays);
      const lop = payroll.lossOfPay || 0;

      doc.text("Total Work Days in Month : " + workDays, 310, startY + 24);
      doc.text("Paid Days (Present/Leave): " + paidDays, 310, startY + 38);
      doc.text("Unpaid / LOP Days        : " + unpaidDays, 310, startY + 52);
      doc.text("Loss of Pay Amount       : " + formatCurrency(lop), 310, startY + 66);

      // ─── Earnings & Deductions Tables ───
      const tableY = 205;
      const halfWidth = 252;
      const rightX = 303;

      // Earnings Table Header
      doc.rect(40, tableY, halfWidth, 20).fillAndStroke(tableHeaderBg, borderColor);
      doc.fillColor(primaryColor).fontSize(9).font("Helvetica-Bold");
      doc.text("EARNINGS", 48, tableY + 5);
      doc.text("AMOUNT", 40 + halfWidth - 65, tableY + 5, { width: 55, align: "right" });

      // Deductions Table Header
      doc.rect(rightX, tableY, halfWidth, 20).fillAndStroke(tableHeaderBg, borderColor);
      doc.text("DEDUCTIONS", rightX + 8, tableY + 5);
      doc.text("AMOUNT", rightX + halfWidth - 65, tableY + 5, { width: 55, align: "right" });

      // Populate Earnings Lines
      let earningsY = tableY + 25;
      const baseSalary = payroll.baseSalary || payroll.salary || 0;
      const bonus = payroll.bonus || 0;

      const earningsItems = [
        { label: "Base Monthly Salary", amount: baseSalary },
      ];
      if (bonus > 0) {
        earningsItems.push({ label: "Performance Bonus / Incentive", amount: bonus });
      }

      doc.font("Helvetica").fontSize(8.5).fillColor("#334155");
      earningsItems.forEach((item) => {
        doc.text(item.label, 48, earningsY);
        doc.text(formatCurrency(item.amount), 40 + halfWidth - 80, earningsY, { width: 70, align: "right" });
        earningsY += 18;
      });

      // Populate Deductions Lines
      let deductionsY = tableY + 25;
      const deductionItems = [];
      if (lop > 0) {
        deductionItems.push({ label: "Loss of Pay (" + unpaidDays + " day(s))", amount: lop });
      }

      if (payroll.deductionLines && Array.isArray(payroll.deductionLines)) {
        payroll.deductionLines.forEach((d) => {
          if (d.value > 0) {
            deductionItems.push({ label: d.name || "Deduction", amount: d.value });
          }
        });
      } else if (payroll.deduction > 0 && deductionItems.length === 0) {
        deductionItems.push({ label: "Total Deductions", amount: payroll.deduction });
      }

      if (deductionItems.length === 0) {
        deductionItems.push({ label: "Nil Deductions", amount: 0 });
      }

      deductionItems.forEach((item) => {
        doc.text(item.label, rightX + 8, deductionsY);
        doc.text(formatCurrency(item.amount), rightX + halfWidth - 80, deductionsY, { width: 70, align: "right" });
        deductionsY += 18;
      });

      const maxListY = Math.max(earningsY, deductionsY, tableY + 110);

      // Total Earnings Box
      const grossEarnings = payroll.grossEarnings || (baseSalary - lop + bonus);
      doc.rect(40, maxListY, halfWidth, 22).fillAndStroke("#f1f5f9", borderColor);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(primaryColor);
      doc.text("TOTAL GROSS EARNINGS", 48, maxListY + 6);
      doc.text(formatCurrency(grossEarnings), 40 + halfWidth - 85, maxListY + 6, { width: 75, align: "right" });

      // Total Deductions Box
      const totalDeductions = payroll.totalDeductions !== undefined ? payroll.totalDeductions : (payroll.deduction || 0);
      doc.rect(rightX, maxListY, halfWidth, 22).fillAndStroke("#f1f5f9", borderColor);
      doc.text("TOTAL DEDUCTIONS", rightX + 8, maxListY + 6);
      doc.text(formatCurrency(totalDeductions), rightX + halfWidth - 85, maxListY + 6, { width: 75, align: "right" });

      // ─── Net Salary Payable Box ───
      const netY = maxListY + 35;
      const netSalary = payroll.netSalary !== undefined ? payroll.netSalary : (payroll.net || (grossEarnings - totalDeductions));

      doc.rect(40, netY, 515, 48).fillAndStroke("#eef2ff", accentColor);
      doc.fontSize(10).fillColor("#4338ca").font("Helvetica-Bold").text("NET SALARY PAYABLE (TAKE HOME):", 55, netY + 10);
      doc.fontSize(16).fillColor("#1e1b4b").font("Helvetica-Bold").text(formatCurrency(netSalary), 320, netY + 8, { width: 220, align: "right" });

      doc.fontSize(8.5).fillColor("#475569").font("Helvetica").text("Amount in Words: " + numberToWords(netSalary), 55, netY + 30);

      // ─── Employer Contributions Notice (if applicable) ───
      const rules = payroll.payrollRulesSnapshot;
      let notesY = netY + 60;
      if (rules?.employerContributions?.length) {
        doc.fontSize(8).fillColor(textMuted).font("Helvetica-Bold").text("EMPLOYER CONTRIBUTIONS (Statutory Benefits - Not deducted from net pay):", 40, notesY);
        notesY += 12;
        doc.font("Helvetica").fontSize(8);
        const contribs = rules.employerContributions.filter(c => c.enabled).map(c => c.name + " (" + c.value + (c.type === "percentage" ? "%" : "") + ")").join(" | ");
        doc.text(contribs || "Configured per business rules.", 40, notesY);
        notesY += 16;
      }

      // ─── Signatures / Verification ───
      const signY = notesY + 30;
      doc.fontSize(8.5).font("Helvetica").fillColor(textMuted);
      doc.text("Prepared & Verified By: " + (payroll.approvedBy || "System Administrator"), 40, signY);
      doc.text("Employee Acknowledgment / Signature: ______________________", 300, signY);

      // ─── Footer ───
      doc.moveTo(40, signY + 35).lineTo(555, signY + 35).strokeColor(borderColor).stroke();
      doc.fontSize(7.5).fillColor("#94a3b8").text(
        "CONFIDENTIAL: This salary statement is generated by Business OS. All calculations are computer-verified and protected under corporate policy. Questions regarding deductions should be addressed to HR/Payroll within 7 days of issue.",
        40, signY + 45, { width: 515, align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
