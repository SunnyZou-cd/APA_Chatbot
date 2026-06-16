import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { IncomingForm, type File, type Fields, type Files } from "formidable";
import { analyzeDocument, textToHtml } from "../src/lib/documentAnalysis.js";
import { extractDocxHtml, extractPdfText } from "../src/lib/serverDocumentExtraction.js";
import type { UploadedDocumentKind } from "../src/types.js";

type VercelRequest = IncomingMessage & {
  method?: string;
};

type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

function firstField(fields: Fields, key: string): string {
  const value = fields[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

function firstFile(files: Files, key: string): File | null {
  const value = files[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fileKind(fileName: string): UploadedDocumentKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".pdf")) return "pdf";
  return "text";
}

async function parseForm(req: VercelRequest): Promise<{ fields: Fields; files: Files }> {
  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 12 * 1024 * 1024,
    multiples: false,
  });

  return await new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) reject(error);
      else resolve({ fields, files });
    });
  });
}

async function extractFile(file: File): Promise<{ html: string; text: string; kind: UploadedDocumentKind; sourceName: string }> {
  const sourceName = file.originalFilename ?? "Uploaded document";
  const kind = fileKind(sourceName);
  const buffer = await readFile(file.filepath);

  if (kind === "docx") {
    const extracted = await extractDocxHtml(buffer);
    return { ...extracted, kind, sourceName };
  }

  if (kind === "pdf") {
    const text = await extractPdfText(buffer);
    return { html: textToHtml(text), text, kind, sourceName };
  }

  const text = buffer.toString("utf8");
  return { html: textToHtml(text), text, kind, sourceName };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  try {
    const { fields, files } = await parseForm(req);
    const mode = firstField(fields, "mode") === "single-reference" ? "single-reference" : "document";
    const file = firstFile(files, "file");
    let html = firstField(fields, "html");
    let text = firstField(fields, "text");
    let inputKind: UploadedDocumentKind = "text";
    let sourceName = "Pasted text";

    if (file) {
      const extracted = await extractFile(file);
      html = extracted.html;
      text = extracted.text;
      inputKind = extracted.kind;
      sourceName = extracted.sourceName;
    }

    const result = analyzeDocument({
      html,
      text,
      inputKind,
      mode,
      sourceName,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Document check failed.",
    });
  }
}
