import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { extractDocxHtml, extractPdfText } from "./serverDocumentExtraction";

async function makeDocxFixture(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );
  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Reference title with </w:t></w:r>
      <w:r><w:rPr><w:i/></w:rPr><w:t>italic journal</w:t></w:r>
      <w:r><w:t> and </w:t></w:r>
      <w:r><w:rPr><w:b/></w:rPr><w:t>bold cue</w:t></w:r>
      <w:r><w:t>.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`,
  );

  return await zip.generateAsync({ type: "nodebuffer" });
}

function makePdfFixture(text: string): Buffer {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${text.length + 35} >>\nstream\nBT /F1 12 Tf 72 720 Td (${text}) Tj ET\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

describe("v1.4 server document extraction", () => {
  it("extracts DOCX text and preserves italic/bold as HTML", async () => {
    const result = await extractDocxHtml(await makeDocxFixture());

    expect(result.text).toContain("Reference title with italic journal and bold cue.");
    expect(result.html).toContain("<em>italic journal</em>");
    expect(result.html).toContain("<strong>bold cue</strong>");
  });

  it("extracts basic PDF text without using frontend chunks", async () => {
    const text = await extractPdfText(makePdfFixture("Smith 2024 PDF citation"));

    expect(text).toContain("Smith 2024 PDF citation");
  });
});
