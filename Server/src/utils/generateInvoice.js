import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";

export async function generateInvoice(milestone) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    // collect pdf data into buffer
    doc.on("data", (chunk) => buffers.push(chunk));

    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);

        // upload buffer to cloudinary
        const result = await new Promise((res, rej) => {
          cloudinary.uploader.upload_stream(
            {
              folder: "invoices",
              resource_type: "raw",
              format: "pdf",
            },
            (error, result) => {
              if (error) rej(error);
              else res(result);
            }
          ).end(pdfBuffer);
        });

        resolve(result.secure_url);
      } catch (err) {
        reject(err);
      }
    });

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
  });
}