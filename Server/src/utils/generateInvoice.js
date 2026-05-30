import PDFDocument from "pdfkit";

export async function generateInvoice(milestone, res) {
  const doc = new PDFDocument();

  // tell the browser to download it as a pdf file
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${milestone._id}.pdf`
  );

  // pipe the pdf directly into the response
  doc.pipe(res);

  // build the pdf content
  const gst = milestone.amount * 0.18;
  const total = milestone.amount + gst;

  doc
    .fontSize(24)
    .text("GST Invoice", { align: "center" })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Date: ${new Date().toLocaleDateString()}`)
    .moveDown();

  doc
    .text(`Milestone: ${milestone.title}`)
    .moveDown();

  doc
    .text(`Client: ${milestone.client}`)
    .text(`Freelancer: ${milestone.freelancer}`)
    .moveDown();

  doc
    .text(`Amount: ₹${milestone.amount}`)
    .text(`GST (18%): ₹${gst.toFixed(2)}`)
    .text(`Total: ₹${total.toFixed(2)}`)
    .moveDown();

  doc
    .fontSize(10)
    .text(`Generated at: ${new Date().toISOString()}`, { align: "center" });

  doc.end();
}