import PDFDocument from "pdfkit";

export async function generateInvoice(milestone, res) {
  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=invoice-" + milestone._id + ".pdf"
  );

  doc.pipe(res);

  const gst = milestone.amount * 0.18;
  const total = milestone.amount + gst;

  const clientName = milestone.client && milestone.client.username
    ? milestone.client.username
    : milestone.client.toString();

  const freelancerName = milestone.freelancer && milestone.freelancer.username
    ? milestone.freelancer.username
    : milestone.freelancer.toString();

  doc
    .fontSize(24)
    .text("GST Invoice", { align: "center" })
    .moveDown();

  doc
    .fontSize(12)
    .text("Date: " + new Date().toLocaleDateString())
    .moveDown();

  doc
    .text("Milestone: " + milestone.title)
    .moveDown();

  doc
    .text("Client: " + clientName)
    .text("Freelancer: " + freelancerName)
    .moveDown();

  doc
    .text("Amount: Rs." + milestone.amount)
    .text("GST (18%): Rs." + gst.toFixed(2))
    .text("Total: Rs." + total.toFixed(2))
    .moveDown();

  doc
    .fontSize(10)
    .text("Generated at: " + new Date().toISOString(), { align: "center" });

  doc.end();
}