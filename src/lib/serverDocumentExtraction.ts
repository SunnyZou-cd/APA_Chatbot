import mammoth from "mammoth";

export async function extractDocxHtml(buffer: Buffer): Promise<{ html: string; text: string }> {
  const htmlResult = await mammoth.convertToHtml({ buffer });
  const textResult = await mammoth.extractRawText({ buffer });
  return {
    html: htmlResult.value,
    text: textResult.value,
  };
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    isEvalSupported: false,
  });
  const document = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  return pages.join("\n\n");
}
