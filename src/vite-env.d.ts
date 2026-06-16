/// <reference types="vite/client" />

declare module "mammoth/mammoth.browser" {
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<{ value: string; messages: unknown[] }>;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export function getDocument(input: Record<string, unknown>): {
    promise: Promise<{
      numPages: number;
      getPage(pageNumber: number): Promise<{
        getTextContent(): Promise<{
          items: Array<{ str?: string }>;
        }>;
      }>;
    }>;
  };
}
