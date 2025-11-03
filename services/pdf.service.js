import PDFDocument from 'pdfkit'


export const pdfService = {
  buildBugPDFStream
}

function buildBugPDFStream(bugs) {
  const doc = new PDFDocument()

  doc.fontSize(20).text('Bug Report', { align: 'center' })
  doc.moveDown() // Add some space after the title

  bugs.forEach((bug, index) => {
    if (index > 0) {
      doc.moveDown(0.5) // Smaller space between items
    }

    // Set the font size for the bug details
    doc.fontSize(16)

    doc.text(`Bug #${index + 1}`)
    doc.fontSize(14)

    doc.text(`Title: ${bug.title}`)
    doc.text(`Severity: ${bug.severity}`)
    doc.text(`Description: ${bug.description}`)
    doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)

    doc.moveDown()
  })

  doc.end()

  return doc // Returns the stream to be piped to res
}
