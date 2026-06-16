import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  ListChecks,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { checklistItems, practicePrompts, ruleCards, sourceTypeLabels } from "./data/rules";
import { fieldDefinitions, sourceExamples, sourceTypeConfigs } from "./data/sourceExamples";
import { buildCitation } from "./lib/citation";
import { formatApaTextForDisplay } from "./lib/displayFormatting";
import { enhanceCitationWithLlm, isLlmConfigured, testLlmConnection } from "./lib/llmFeedbackProvider";
import type {
  CheckIssue,
  DocumentCheckResultV14,
  FormattedReferencePart,
  LlmCheckResult,
  LlmProviderConfig,
  RuleTopic,
  SourceInput,
  SourceType,
} from "./types";

type Tab = "build" | "document" | "learn" | "review";
type DocumentMode = "document" | "single-reference";

const publicBasePath = import.meta.env.BASE_URL;

const sampleCheck =
  "Smith, J. The Article Title. Journal of Student Writing, 12(2).";
const sampleMla =
  'Smith, John. "Learning APA Style in First-Year Psychology." Journal of Student Writing, vol. 12, no. 2, 2024, pp. 45-61.';
const llmStorageKey = "apa-coach-v1.4-llm-config";
const sampleDocumentText = `APA Practice Paper

Students need structured APA feedback when they practice citations (Lacy, 2024). Citation tools should explain uncertainty instead of acting like final validators (Smith, 2023).

References
Lacy, J.T. (2024). Learning APA Style In First-Year Psychology. Journal of Student Writing, 12(2), 45-61. doi:10.1037/example
Brown, T. (2021). Research writing for psychology students. Academic Press.`;
const sampleDocumentHtml = `<p>APA Practice Paper</p>
<p>Students need structured APA feedback when they practice citations (Lacy, 2024). Citation tools should explain uncertainty instead of acting like final validators (Smith, 2023).</p>
<p>References<br>Lacy, J.T. (2024). Learning APA Style In First-Year Psychology. <em>Journal of Student Writing</em>, <em>12</em>(2), 45-61. doi:10.1037/example<br>Brown, T. (2021). <em>Research writing for psychology students.</em> Academic Press.</p>`;

const defaultLlmConfig: LlmProviderConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "",
  compatibilityMode: "openaiChatCompletions",
};

const topicFilters: Array<"All" | RuleTopic> = [
  "All",
  "In-text citations",
  "References",
  "Paper setup",
  "Document check",
  "AI citation/disclosure",
  "Citation style differences",
];

function loadStoredLlmConfig(): LlmProviderConfig {
  try {
    const raw = window.sessionStorage.getItem(llmStorageKey);
    if (!raw) return defaultLlmConfig;
    const parsed = JSON.parse(raw) as Partial<LlmProviderConfig>;
    return {
      baseUrl: parsed.baseUrl ?? defaultLlmConfig.baseUrl,
      apiKey: parsed.apiKey ?? "",
      model: parsed.model ?? "",
      compatibilityMode: "openaiChatCompletions",
    };
  } catch {
    return defaultLlmConfig;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [sourceInput, setSourceInput] = useState<SourceInput>(sourceExamples[0].input);
  const [copied, setCopied] = useState<string | null>(null);
  const [llmConfig, setLlmConfig] = useState<LlmProviderConfig>(loadStoredLlmConfig);
  const [llmResult, setLlmResult] = useState<LlmCheckResult | null>(null);
  const [llmStatus, setLlmStatus] = useState<"idle" | "testing" | "enhancing">("idle");
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmMessage, setLlmMessage] = useState<string | null>(null);
  const [llmPrivacyAccepted, setLlmPrivacyAccepted] = useState(false);
  const [documentText, setDocumentText] = useState(sampleDocumentText);
  const [documentHtml, setDocumentHtml] = useState(sampleDocumentHtml);
  const [documentMode, setDocumentMode] = useState<DocumentMode>("document");
  const [documentResult, setDocumentResult] = useState<DocumentCheckResultV14 | null>(null);
  const [documentStatus, setDocumentStatus] = useState<"idle" | "checking">("idle");
  const [documentError, setDocumentError] = useState<string | null>(null);

  const citation = useMemo(() => buildCitation(sourceInput), [sourceInput]);

  useEffect(() => {
    window.sessionStorage.setItem(llmStorageKey, JSON.stringify(llmConfig));
  }, [llmConfig]);

  const updateField = (key: keyof SourceInput, value: string) => {
    setSourceInput((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const runLlmEnhancement = async () => {
    setLlmStatus("enhancing");
    setLlmError(null);
    setLlmMessage(null);
    try {
      const result = await enhanceCitationWithLlm(documentText, llmConfig);
      setLlmResult(result);
    } catch (error) {
      setLlmResult(null);
      setLlmError(error instanceof Error ? error.message : "LLM enhancement failed.");
    } finally {
      setLlmStatus("idle");
    }
  };

  const runLlmConnectionTest = async () => {
    setLlmStatus("testing");
    setLlmError(null);
    setLlmMessage(null);
    try {
      const message = await testLlmConnection(llmConfig);
      setLlmMessage(message);
    } catch (error) {
      setLlmError(error instanceof Error ? error.message : "Connection test failed.");
    } finally {
      setLlmStatus("idle");
    }
  };

  const submitDocumentCheck = async (file?: File) => {
    setDocumentStatus("checking");
    setDocumentError(null);
    const formData = new FormData();
    formData.set("mode", documentMode);
    if (file) {
      formData.set("file", file);
    } else {
      formData.set("html", documentHtml);
      formData.set("text", documentText);
    }

    try {
      const response = await fetch("/api/document-check", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as DocumentCheckResultV14 | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "Document check failed.");
      }
      const result = payload as DocumentCheckResultV14;
      setDocumentResult(result);
      setDocumentText(result.plainText);
      setDocumentHtml(result.documentHtml);
    } catch (error) {
      setDocumentResult(null);
      setDocumentError(error instanceof Error ? error.message : "Document check failed.");
    } finally {
      setDocumentStatus("idle");
    }
  };

  const copyValue = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="sidebar" aria-label="APA Coach navigation">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="eyebrow">v1.4 review build</p>
              <h1>APA Coach</h1>
            </div>
          </div>

          <nav className="tab-list" aria-label="Main tools">
            <button
              className={activeTab === "build" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("build")}
              type="button"
            >
              <BookOpen size={18} />
              Build
            </button>
            <button
              className={activeTab === "document" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("document")}
              type="button"
            >
              <FileText size={18} />
              Document Check
            </button>
            <button
              className={activeTab === "learn" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("learn")}
              type="button"
            >
              <Sparkles size={18} />
              Learn
            </button>
            <button
              className={activeTab === "review" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("review")}
              type="button"
            >
              <Rocket size={18} />
              Faculty Review
            </button>
          </nav>

          <div className="integrity-panel">
            <ShieldCheck size={20} />
            <div>
              <strong>Learning boundary</strong>
              <p>This coach explains APA choices, flags uncertainty, and avoids writing the paper for the student.</p>
            </div>
          </div>
        </aside>

        <section className="tool-surface">
          {activeTab === "build" && (
            <BuildView
              citation={citation}
              copied={copied}
              copyValue={copyValue}
              sourceInput={sourceInput}
              updateField={updateField}
            />
          )}
          {activeTab === "learn" && <LearnView />}
          {activeTab === "document" && (
            <DocumentCheckView
              documentError={documentError}
              documentResult={documentResult}
              documentStatus={documentStatus}
              documentText={documentText}
              documentHtml={documentHtml}
              documentMode={documentMode}
              llmConfig={llmConfig}
              llmError={llmError}
              llmMessage={llmMessage}
              llmPrivacyAccepted={llmPrivacyAccepted}
              llmResult={llmResult}
              llmStatus={llmStatus}
              runDocumentCheck={submitDocumentCheck}
              runLlmConnectionTest={runLlmConnectionTest}
              runLlmEnhancement={runLlmEnhancement}
              setDocumentHtml={setDocumentHtml}
              setDocumentMode={setDocumentMode}
              setDocumentText={setDocumentText}
              setLlmConfig={setLlmConfig}
              setLlmPrivacyAccepted={setLlmPrivacyAccepted}
            />
          )}
          {activeTab === "review" && <ReviewView />}
        </section>
      </section>
    </main>
  );
}

function FormattedReference({ parts }: { parts: FormattedReferencePart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.italic ? (
          <em key={`${part.text}-${index}`}>{part.text}</em>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        ),
      )}
    </>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeInlineStyle(element: HTMLElement): string {
  const styles: string[] = [];
  const fontFamily = element.style.fontFamily.replace(/[<>"']/g, "").trim();
  const fontSize = element.style.fontSize.trim();
  const fontStyle = element.style.fontStyle.trim();
  const fontWeight = element.style.fontWeight.trim();

  if (fontFamily) styles.push(`font-family:${fontFamily}`);
  if (/^\d+(?:\.\d+)?(?:px|pt|em|rem|%)$/.test(fontSize)) styles.push(`font-size:${fontSize}`);
  if (/^(italic|normal)$/.test(fontStyle)) styles.push(`font-style:${fontStyle}`);
  if (/^(bold|normal|[1-9]00)$/.test(fontWeight)) styles.push(`font-weight:${fontWeight}`);
  return styles.length > 0 ? ` style="${styles.join(";")}"` : "";
}

function sanitizeRichPaste(html: string): string {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  const renderNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? "");
    }

    if (!(node instanceof HTMLElement)) {
      return "";
    }

    const children = Array.from(node.childNodes).map(renderNode).join("");
    const tagName = node.tagName.toLowerCase();
    const style = safeInlineStyle(node);

    if (tagName === "br") return "<br>";
    if (tagName === "em" || tagName === "i") return `<em${style}>${children}</em>`;
    if (tagName === "strong" || tagName === "b") return `<strong${style}>${children}</strong>`;
    if (tagName === "u") return `<u${style}>${children}</u>`;
    if (tagName === "span" || tagName === "font") return style ? `<span${style}>${children}</span>` : children;
    if (tagName === "p" || tagName === "div") return `<div${style}>${children || "<br>"}</div>`;
    if (style) return `<span${style}>${children}</span>`;
    return children;
  };

  return Array.from(parsed.body.childNodes).map(renderNode).join("");
}

function RichTextCheckInput({
  value,
  htmlValue,
  label = "Citation or reference",
  minHeight,
  onHtmlChange,
  onTextChange,
}: {
  value: string;
  htmlValue?: string;
  label?: string;
  minHeight?: number;
  onHtmlChange?: (value: string) => void;
  onTextChange: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (htmlValue !== undefined) {
      if (editor.innerHTML !== htmlValue) {
        editor.innerHTML = htmlValue;
      }
      return;
    }
    if (editor.innerText.replace(/\u00a0/g, " ").trim() !== value.trim()) {
      editor.innerHTML = escapeHtml(value).replace(/\n/g, "<br>");
    }
  }, [htmlValue, value]);

  const syncText = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onTextChange(editor.innerText.replace(/\u00a0/g, " "));
    onHtmlChange?.(editor.innerHTML);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    const content = html ? sanitizeRichPaste(html) : escapeHtml(text).replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, content);
    syncText();
  };

  return (
    <div
      aria-label={label}
      className="rich-text-input reference-display"
      contentEditable
      onInput={syncText}
      onPaste={handlePaste}
      ref={editorRef}
      role="textbox"
      style={minHeight ? { minHeight } : undefined}
      suppressContentEditableWarning
    />
  );
}

function BuildView({
  citation,
  copied,
  copyValue,
  sourceInput,
  updateField,
}: {
  citation: ReturnType<typeof buildCitation>;
  copied: string | null;
  copyValue: (label: string, value: string) => Promise<void>;
  sourceInput: SourceInput;
  updateField: (key: keyof SourceInput, value: string) => void;
}) {
  const config = sourceTypeConfigs[sourceInput.sourceType];
  const visibleFields = [...config.requiredFields, ...config.optionalFields];
  const fields = fieldDefinitions.filter((field) => visibleFields.includes(field.field));
  const selectedExampleId =
    sourceExamples.find((example) => JSON.stringify(example.input) === JSON.stringify(sourceInput))?.id ?? "";
  const fieldIssues = new Map(citation.validationIssues.map((issue) => [issue.field, issue]));

  return (
    <div className="view-grid">
      <section className="editor-column">
        <div className="section-heading">
          <p className="eyebrow">Build</p>
          <h2>Create a citation pair</h2>
          <p>Choose a source type or curated example, then complete the required fields before copying a citation.</p>
        </div>

        <label className="field-block">
          <span>Curated example</span>
          <select
            value={selectedExampleId}
            onChange={(event) => {
              const example = sourceExamples.find((item) => item.id === event.target.value);
              if (example) {
                Object.entries(example.input).forEach(([key, value]) => updateField(key as keyof SourceInput, value));
              }
            }}
          >
            <option value="">Custom source</option>
            {sourceExamples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.label}
              </option>
            ))}
          </select>
          <small>Select a complete or intentionally incomplete practice example.</small>
        </label>

        <label className="field-block">
          <span>Source type</span>
          <select
            value={sourceInput.sourceType}
            onChange={(event) => updateField("sourceType", event.target.value as SourceType)}
          >
            {Object.entries(sourceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="form-grid">
          {fields.map((field) => (
            <label className={fieldIssues.has(field.field) ? "field-block has-issue" : "field-block"} key={field.field}>
              <span>
                {field.label}
                {config.requiredFields.includes(field.field) ? " *" : ""}
              </span>
              <input
                value={sourceInput[field.field]}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.field, event.target.value)}
              />
              <small>{field.helper}</small>
              {fieldIssues.has(field.field) && <small className="field-error">{fieldIssues.get(field.field)?.studentAction}</small>}
            </label>
          ))}
        </div>
      </section>

      <section className="result-column" aria-live="polite">
        <div className="result-block">
          <div className="result-header">
            <h3>Reference entry</h3>
            <button type="button" className="icon-button" onClick={() => copyValue("reference", citation.reference)}>
              <Copy size={16} />
              <span>{copied === "reference" ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className={citation.status === "incomplete" ? "status-pill incomplete" : "status-pill complete"}>
            {citation.status === "incomplete" ? "Incomplete citation" : "Ready to review"}
          </p>
          <p className="citation-output hanging">
            <FormattedReference parts={citation.formattedReferenceParts} />
          </p>
        </div>

        <div className="result-pair">
          <div className="result-block">
            <h3>Parenthetical</h3>
            <p className="citation-output">{citation.parenthetical}</p>
          </div>
          <div className="result-block">
            <h3>Narrative</h3>
            <p className="citation-output">{citation.narrative}</p>
          </div>
        </div>

        {citation.validationIssues.length > 0 && (
          <div className="warning-list">
            {citation.validationIssues.map((issue) => (
              <p key={`${issue.field}-${issue.message}`}>
                <strong>{issue.severity.toUpperCase()}:</strong> {issue.message} {issue.studentAction}
              </p>
            ))}
          </div>
        )}

        <div className="parts-list">
          <h3>Citation parts</h3>
          {citation.parts.map((part) => (
            <div className="part-row" key={part.label}>
              <strong>{part.label}</strong>
              <span>{part.value}</span>
              <p>{part.explanation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DocumentCheckView({
  documentError,
  documentHtml,
  documentMode,
  documentResult,
  documentStatus,
  documentText,
  llmConfig,
  llmError,
  llmMessage,
  llmPrivacyAccepted,
  llmResult,
  llmStatus,
  runDocumentCheck,
  runLlmConnectionTest,
  runLlmEnhancement,
  setDocumentHtml,
  setDocumentMode,
  setDocumentText,
  setLlmConfig,
  setLlmPrivacyAccepted,
}: {
  documentError: string | null;
  documentHtml: string;
  documentMode: DocumentMode;
  documentResult: DocumentCheckResultV14 | null;
  documentStatus: "idle" | "checking";
  documentText: string;
  llmConfig: LlmProviderConfig;
  llmError: string | null;
  llmMessage: string | null;
  llmPrivacyAccepted: boolean;
  llmResult: LlmCheckResult | null;
  llmStatus: "idle" | "testing" | "enhancing";
  runDocumentCheck: (file?: File) => Promise<void>;
  runLlmConnectionTest: () => Promise<void>;
  runLlmEnhancement: () => Promise<void>;
  setDocumentHtml: (value: string) => void;
  setDocumentMode: (value: DocumentMode) => void;
  setDocumentText: (value: string) => void;
  setLlmConfig: React.Dispatch<React.SetStateAction<LlmProviderConfig>>;
  setLlmPrivacyAccepted: (value: boolean) => void;
}) {
  const llmReady = isLlmConfigured(llmConfig);

  return (
    <div className="view-grid">
      <section className="editor-column">
        <div className="section-heading">
          <p className="eyebrow">Document Check</p>
          <h2>Review APA references and documents</h2>
          <p>Upload DOCX/PDF/TXT, paste rich text, or check one reference. v1.4 uses a Vercel API for document parsing.</p>
        </div>

        <div className="choice-row" role="group" aria-label="Document check mode">
          <button
            className={documentMode === "document" ? "choice-button selected" : "choice-button"}
            onClick={() => setDocumentMode("document")}
            type="button"
          >
            Full document
          </button>
          <button
            className={documentMode === "single-reference" ? "choice-button selected" : "choice-button"}
            onClick={() => setDocumentMode("single-reference")}
            type="button"
          >
            Single reference / excerpt
          </button>
        </div>

        <label className="field-block">
          <span>Upload exported document</span>
          <input
            accept=".docx,.pdf,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={documentStatus !== "idle"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void runDocumentCheck(file);
              event.currentTarget.value = "";
            }}
            type="file"
          />
          <small>For Google Docs, use File &gt; Download, then choose Microsoft Word (.docx) or PDF. Files are parsed for this request only.</small>
        </label>

        <label className="field-block">
          <span>{documentMode === "document" ? "Extracted or pasted document" : "Reference or excerpt"}</span>
          <RichTextCheckInput
            htmlValue={documentHtml}
            label={documentMode === "document" ? "Extracted or pasted document" : "Reference or excerpt"}
            minHeight={360}
            onHtmlChange={setDocumentHtml}
            onTextChange={setDocumentText}
            value={documentText}
          />
          <small>Rich text pasted from Word or Google Docs stays visible. PDF layout checks remain lower confidence.</small>
        </label>

        <div className="button-row">
          <button className="primary-button" disabled={documentStatus !== "idle"} type="button" onClick={() => runDocumentCheck()}>
            <FileText size={18} />
            {documentStatus === "checking" ? "Checking..." : documentMode === "document" ? "Check document" : "Check reference"}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setDocumentText(sampleDocumentText);
              setDocumentHtml(sampleDocumentHtml);
            }}
          >
            Use sample
          </button>
        </div>

        <p className="settings-note">
          Privacy boundary: v1.4 parses files through the Vercel API for the current request only. It does not store uploads or connect to Google Docs.
        </p>
        {documentError && <p className="error-note">{documentError}</p>}

        <section className="settings-panel" aria-label="LLM Settings">
          <div className="section-heading compact">
            <p className="eyebrow">Optional BYOK</p>
            <h3>LLM Settings</h3>
            <p>Document Check uses rules by default. Use your own OpenAI-compatible API only when you manually enhance feedback.</p>
          </div>
          <label className="field-block">
            <span>Base URL</span>
            <input
              value={llmConfig.baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  baseUrl: event.target.value,
                }))
              }
            />
            <small>Use an OpenAI-compatible endpoint that allows browser requests.</small>
          </label>
          <label className="field-block">
            <span>API key</span>
            <input
              type="password"
              value={llmConfig.apiKey}
              placeholder="Session-only key"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  apiKey: event.target.value,
                }))
              }
            />
            <small>The key is stored in sessionStorage, not in this repository or a database.</small>
          </label>
          <label className="field-block">
            <span>Model</span>
            <input
              value={llmConfig.model}
              placeholder="Enter your model name"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  model: event.target.value,
                }))
              }
            />
            <small>Use the model name required by your provider.</small>
          </label>
          <label className="privacy-check">
            <input
              checked={llmPrivacyAccepted}
              onChange={(event) => setLlmPrivacyAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>I understand student text will be sent to my configured provider when I use LLM enhancement.</span>
          </label>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={!llmReady || llmStatus !== "idle"}
              onClick={runLlmConnectionTest}
              type="button"
            >
              Test connection
            </button>
            <button
              className="primary-button"
              disabled={!llmReady || !llmPrivacyAccepted || !documentText.trim() || llmStatus !== "idle"}
              onClick={runLlmEnhancement}
              type="button"
            >
              {llmStatus === "enhancing" ? "Enhancing..." : "Enhance with my LLM"}
            </button>
          </div>
          {!llmReady && <p className="settings-note">Add a base URL, API key, and model to enable LLM enhancement.</p>}
          {llmMessage && <p className="success-note">{llmMessage}</p>}
          {llmError && <p className="error-note">{llmError}</p>}
        </section>
      </section>

      <section className="result-column" aria-live="polite">
        <div className="section-heading compact">
          <p className="eyebrow">Document feedback</p>
          <h2>Teaching review</h2>
        </div>

        {!documentResult ? (
          <div className="empty-state">
            <FileText size={32} />
            <p>Run a document check to see APA draft-level feedback and manual review reminders.</p>
          </div>
        ) : (
          <>
            <div className="result-block">
              <h3>{documentResult.sourceName}</h3>
              <p className="rule-source">
                {documentResult.inputKind.toUpperCase()} / {documentResult.mode} / {documentResult.wordCount} words / {documentResult.characterCount} characters
              </p>
              <p>{documentResult.privacyNote}</p>
            </div>

            <div className="compact-list">
              <h3>Detected APA signals</h3>
              <ul>
                <li>{documentResult.citations.length} in-text citation candidate(s)</li>
                <li>{documentResult.references.length} reference entry candidate(s)</li>
                <li>{documentResult.hasReferencesSection ? "References heading detected" : "No clear References heading detected"}</li>
              </ul>
            </div>

            {documentResult.references.length > 0 && (
              <div className="compact-list">
                <h3>Parsed references</h3>
                <ul>
                  {documentResult.references.map((reference, index) => (
                    <li key={`${reference.originalText}-${index}`}>
                      <strong>{reference.sourceTypeGuess}</strong> ({reference.confidence}): {reference.originalText}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="issue-list">
              {documentResult.issues.map((issue, index) => (
                <article className={`issue-card ${issue.severity}`} key={`${issue.ruleId}-${index}`}>
                  <div className="issue-topline">
                    <span>{issue.severity} / {issue.category}</span>
                    <small>{issue.confidence} confidence</small>
                  </div>
                  <h3>{issue.message}</h3>
                  <p><strong>Why it matters:</strong> {issue.whyItMatters}</p>
                  <p><strong>Student action:</strong> {issue.studentAction}</p>
                  {issue.evidence && <p className="rule-source">Evidence: {issue.evidence}</p>}
                </article>
              ))}
            </div>

            {documentResult.corrections.length > 0 && (
              <div className="issue-list">
                {documentResult.corrections.map((correction, index) => (
                  <article className="issue-card check" key={`${correction.originalText}-${index}`}>
                    <div className="issue-topline">
                      <span>correction / {correction.sourceTypeGuess}</span>
                      <small>{correction.confidence} confidence</small>
                    </div>
                    <h3>{correction.correctedHtml ? "Best-effort corrected reference" : "Cannot generate a reliable correction yet"}</h3>
                    <p className="rule-source">Original: {correction.originalText}</p>
                    {correction.correctedHtml ? (
                      <p
                        className="suggestion reference-display"
                        dangerouslySetInnerHTML={{ __html: correction.correctedHtml }}
                      />
                    ) : (
                      <p><strong>Missing fields:</strong> {correction.missingFields.join(", ")}</p>
                    )}
                    <p><strong>Student action:</strong> {correction.note}</p>
                    <details>
                      <summary>Confirm metadata</summary>
                      <dl className="metadata-list">
                        <dt>Author</dt>
                        <dd>{correction.editableFields.authors || "Needs confirmation"}</dd>
                        <dt>Year</dt>
                        <dd>{correction.editableFields.year || "Needs confirmation"}</dd>
                        <dt>Title</dt>
                        <dd>{correction.editableFields.title || "Needs confirmation"}</dd>
                        <dt>Source / publisher</dt>
                        <dd>{correction.editableFields.source || correction.editableFields.publisher || "Needs confirmation"}</dd>
                        <dt>DOI / URL</dt>
                        <dd>{correction.editableFields.doiOrUrl || "Optional or needs confirmation"}</dd>
                      </dl>
                    </details>
                  </article>
                ))}
              </div>
            )}

            <div className="compact-list">
              <h3>Needs manual review</h3>
              <ul>
                {documentResult.manualReviewItems.map((issue) => (
                  <li key={issue.ruleId}>
                    <strong>{issue.category}:</strong> {issue.studentAction}
                  </li>
                ))}
              </ul>
            </div>

            {llmResult && (
              <section className="llm-result-panel">
                <div className="issue-topline">
                  <span>LLM enhancement</span>
                  <small>{llmResult.confidence} confidence</small>
                </div>
                <h3>{llmResult.summary}</h3>
                <p className="rule-source">Detected style: {llmResult.styleGuess.toUpperCase()}</p>
                <div className="issue-list">
                  {llmResult.issues.map((issue, index) => (
                    <article className={`issue-card ${issue.severity}`} key={`${issue.ruleId}-${index}`}>
                      <div className="issue-topline">
                        <span>{issue.severity} / llm</span>
                        <small>{issue.confidence} confidence</small>
                      </div>
                      <h3>{issue.message}</h3>
                      <p><strong>Why it matters:</strong> {issue.whyItMatters}</p>
                      <p>{issue.hint}</p>
                      <p><strong>Student action:</strong> {issue.studentAction}</p>
                      {issue.evidence && <p className="rule-source">Evidence: {issue.evidence}</p>}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CheckView({
  checkText,
  issues,
  llmConfig,
  llmError,
  llmMessage,
  llmPrivacyAccepted,
  llmResult,
  llmStatus,
  revealed,
  runLlmConnectionTest,
  runLlmEnhancement,
  runCheck,
  setLlmConfig,
  setLlmPrivacyAccepted,
  setCheckText,
  setRevealed,
}: {
  checkText: string;
  issues: CheckIssue[];
  llmConfig: LlmProviderConfig;
  llmError: string | null;
  llmMessage: string | null;
  llmPrivacyAccepted: boolean;
  llmResult: LlmCheckResult | null;
  llmStatus: "idle" | "testing" | "enhancing";
  revealed: Record<number, boolean>;
  runLlmConnectionTest: () => Promise<void>;
  runLlmEnhancement: () => Promise<void>;
  runCheck: () => Promise<void>;
  setLlmConfig: React.Dispatch<React.SetStateAction<LlmProviderConfig>>;
  setLlmPrivacyAccepted: (value: boolean) => void;
  setCheckText: (value: string) => void;
  setRevealed: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
  const llmReady = isLlmConfigured(llmConfig);

  return (
    <div className="view-grid">
      <section className="editor-column">
        <div className="section-heading">
          <p className="eyebrow">Check</p>
          <h2>Diagnose a citation attempt</h2>
          <p>Feedback starts with hints. A suggested correction appears only after the student chooses to reveal it.</p>
        </div>
        <label className="field-block">
          <span>Citation or reference</span>
          <RichTextCheckInput value={checkText} onTextChange={setCheckText} />
          <small>Rich text pasted from Word or Google Docs stays visible here; diagnosis uses the text content.</small>
        </label>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={runCheck}>
            <ClipboardCheck size={18} />
            Check citation
          </button>
          <button className="secondary-button" type="button" onClick={() => setCheckText(sampleCheck)}>
            Use sample
          </button>
          <button className="secondary-button" type="button" onClick={() => setCheckText(sampleMla)}>
            Use MLA sample
          </button>
        </div>

        <section className="settings-panel" aria-label="LLM Settings">
          <div className="section-heading compact">
            <p className="eyebrow">Optional BYOK</p>
            <h3>LLM Settings</h3>
            <p>Use your own OpenAI-compatible API only when you choose to enhance feedback.</p>
          </div>
          <label className="field-block">
            <span>Base URL</span>
            <input
              value={llmConfig.baseUrl}
              placeholder="https://api.openai.com/v1"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  baseUrl: event.target.value,
                }))
              }
            />
            <small>Use an OpenAI-compatible endpoint that allows browser requests.</small>
          </label>
          <label className="field-block">
            <span>API key</span>
            <input
              type="password"
              value={llmConfig.apiKey}
              placeholder="Session-only key"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  apiKey: event.target.value,
                }))
              }
            />
            <small>The key is stored in sessionStorage, not in this repository or a database.</small>
          </label>
          <label className="field-block">
            <span>Model</span>
            <input
              value={llmConfig.model}
              placeholder="Enter your model name"
              onChange={(event) =>
                setLlmConfig((current) => ({
                  ...current,
                  model: event.target.value,
                }))
              }
            />
            <small>Use the model name required by your provider.</small>
          </label>
          <label className="privacy-check">
            <input
              checked={llmPrivacyAccepted}
              onChange={(event) => setLlmPrivacyAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>I understand student text will be sent to my configured provider when I use LLM enhancement.</span>
          </label>
          <div className="button-row">
            <button
              className="secondary-button"
              disabled={!llmReady || llmStatus !== "idle"}
              onClick={runLlmConnectionTest}
              type="button"
            >
              Test connection
            </button>
            <button
              className="primary-button"
              disabled={!llmReady || !llmPrivacyAccepted || !checkText.trim() || llmStatus !== "idle"}
              onClick={runLlmEnhancement}
              type="button"
            >
              {llmStatus === "enhancing" ? "Enhancing..." : "Enhance with my LLM"}
            </button>
          </div>
          {!llmReady && <p className="settings-note">Add a base URL, API key, and model to enable LLM enhancement.</p>}
          {llmMessage && <p className="success-note">{llmMessage}</p>}
          {llmError && <p className="error-note">{llmError}</p>}
        </section>
      </section>

      <section className="result-column" aria-live="polite">
        <div className="section-heading compact">
          <p className="eyebrow">Feedback</p>
          <h2>Issues and hints</h2>
        </div>

        {issues.length === 0 ? (
          <div className="empty-state">
            <ListChecks size={32} />
            <p>Run a check to see likely APA issues, rule explanations, and uncertainty flags.</p>
          </div>
        ) : (
          <div className="issue-list">
            {issues.map((issue, index) => (
              <article className={`issue-card ${issue.severity}`} key={`${issue.ruleId}-${issue.message}`}>
                <div className="issue-topline">
                  <span>{issue.severity} / {issue.source}</span>
                  <small>{issue.confidence} confidence</small>
                </div>
                <h3>{issue.message}</h3>
                <p><strong>Why it matters:</strong> {issue.whyItMatters}</p>
                <p>{issue.hint}</p>
                <p><strong>Student action:</strong> {issue.studentAction}</p>
                <p className="rule-source">Rule source: {issue.ruleSource}</p>
                {issue.styleFamily && <p className="rule-source">Detected style: {issue.styleFamily.toUpperCase()}</p>}
                {issue.evidence && <p className="rule-source">Evidence: {issue.evidence}</p>}
                {issue.needsInstructorReview && <p className="review-needed">Instructor or source review needed before using this as final APA guidance.</p>}
                <button
                  className="reveal-button"
                  type="button"
                  onClick={() =>
                    setRevealed((current) => ({
                      ...current,
                      [index]: !current[index],
                    }))
                  }
                >
                  {revealed[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                  {revealed[index] ? "Hide correction" : "Reveal correction"}
                </button>
                {revealed[index] && (
                  <p className="suggestion reference-display">
                    <FormattedReference parts={formatApaTextForDisplay(issue.suggestedCorrection)} />
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {llmResult && (
          <section className="llm-result-panel">
            <div className="issue-topline">
              <span>LLM enhancement</span>
              <small>{llmResult.confidence} confidence</small>
            </div>
            <h3>{llmResult.summary}</h3>
            <p className="rule-source">Detected style: {llmResult.styleGuess.toUpperCase()}</p>
            <div className="issue-list">
              {llmResult.issues.map((issue, index) => (
                <article className={`issue-card ${issue.severity}`} key={`${issue.ruleId}-${index}`}>
                  <div className="issue-topline">
                    <span>{issue.severity} / llm</span>
                    <small>{issue.confidence} confidence</small>
                  </div>
                  <h3>{issue.message}</h3>
                  <p><strong>Why it matters:</strong> {issue.whyItMatters}</p>
                  <p>{issue.hint}</p>
                  <p><strong>Student action:</strong> {issue.studentAction}</p>
                  {issue.evidence && <p className="rule-source">Evidence: {issue.evidence}</p>}
                </article>
              ))}
            </div>
            {llmResult.nextSteps.length > 0 && (
              <div className="compact-list">
                <h3>Next steps</h3>
                <ul>
                  {llmResult.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
            {llmResult.safetyNotes.length > 0 && (
              <div className="warning-list">
                {llmResult.safetyNotes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </div>
  );
}

function LearnView() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [topicFilter, setTopicFilter] = useState<"All" | RuleTopic>("All");
  const visibleRuleCards = topicFilter === "All" ? ruleCards : ruleCards.filter((rule) => rule.topic === topicFilter);

  return (
    <div className="learn-stack">
      <div className="section-heading">
        <p className="eyebrow">Learn</p>
        <h2>APA rule cards and practice</h2>
        <p>Use these cards to connect each correction to a rule, example, and instructor check point.</p>
      </div>

      <div className="choice-row" role="group" aria-label="Rule topic filters">
        {topicFilters.map((topic) => (
          <button
            className={topicFilter === topic ? "choice-button selected" : "choice-button"}
            key={topic}
            type="button"
            onClick={() => setTopicFilter(topic)}
          >
            {topic}
          </button>
        ))}
      </div>

      <section className="rule-grid">
        {visibleRuleCards.map((rule) => (
          <article className="rule-card" key={rule.id}>
            <p className="eyebrow">{rule.topic}</p>
            <h3>{rule.title}</h3>
            <p>{rule.plainLanguageRule}</p>
            <div className="example-box reference-display">
              <FormattedReference parts={formatApaTextForDisplay(rule.example)} />
            </div>
            <p><strong>Common mistake:</strong> {rule.commonMistake}</p>
            <p><strong>Student action:</strong> {rule.studentAction}</p>
            <p><strong>Ask instructor when:</strong> {rule.askInstructorWhen}</p>
            <a href={rule.officialLink} target="_blank" rel="noreferrer">
              Open source
            </a>
          </article>
        ))}
      </section>

      <section className="learn-panels">
        <div className="checklist-panel">
          <div className="panel-title">
            <CheckCircle2 size={20} />
            <h3>Paper setup checklist</h3>
          </div>
          <ul>
            {checklistItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="practice-panel">
          <div className="panel-title">
            <Sparkles size={20} />
            <h3>Practice prompts</h3>
          </div>
          {practicePrompts.map((item, index) => (
            <div className="practice-item" key={item.prompt}>
              <p>{item.prompt}</p>
              <div className="choice-row">
                {item.choices.map((choice) => {
                  const selected = selectedAnswers[index] === choice.value;
                  const correct = selected && choice.value === item.answer;
                  return (
                    <button
                      className={correct ? "choice-button correct" : selected ? "choice-button selected" : "choice-button"}
                      key={choice.value}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [index]: choice.value,
                        }))
                      }
                    >
                      {choice.value}
                    </button>
                  );
                })}
              </div>
              {selectedAnswers[index] && (
                <div className="feedback-box">
                  <strong>{selectedAnswers[index] === item.answer ? "Correct:" : "Try again:"}</strong>{" "}
                  {item.choices.find((choice) => choice.value === selectedAnswers[index])?.feedback}
                  <p>{item.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewView() {
  const readinessItems = [
    "Vercel API route added for DOCX/PDF/TXT parsing",
    "No login, database, Google account connection, or persistent student document storage in v1.4",
    "Optional BYOK LLM enhancement is client-side, manual, and session-only",
    "Rule-based diagnosis remains available without any LLM configuration",
    "Document Check now handles full documents, rich-text paste, and single-reference review",
    "English-only student-facing interface",
    "Faculty-facing handoff, deployment guide, test report, and v1.4 upgrade notes included in the repository",
  ];

  const reviewQuestions = [
    "Does the tool feel like a tutor instead of an answer generator?",
    "Are the academic integrity boundaries clear enough for students?",
    "Are the APA examples and warnings appropriate for psychology coursework?",
    "Does Document Check respond to full-paper review needs without overstating automated layout accuracy?",
    "Should any course-specific policies be added before a student pilot?",
  ];

  const facultyChecklist = [
    "Pedagogy fit: feedback teaches the reason for a correction",
    "Academic integrity fit: the tool does not draft papers or invent source data",
    "APA accuracy concerns: source examples and corrections need faculty review",
    "Privacy concerns: LLM enhancement sends text only after manual user action and never stores it in this app",
    "Document privacy concerns: uploaded DOCX/PDF files are parsed only for the current Vercel API request and are not stored by the app",
    "Pilot readiness: do not use public student BYOK until faculty policy approves it",
  ];

  const walkthroughSteps = [
    "Open Build and choose Journal article with DOI to review the complete citation flow",
    "Choose Missing author practice to confirm the tool blocks incomplete references",
    "Open Document Check, use Full document mode, and review automatic issues plus manual review reminders",
    "Switch Document Check to Single reference / excerpt mode and review the generated correction",
    "Upload an exported DOCX and confirm italic/bold text remains visible in the extracted rich-text area",
    "Review LLM Settings without entering a real key unless you intend to test your own provider",
    "Open Learn, filter to AI citation/disclosure, and answer one practice prompt",
    "Return to this page and review the pilot-readiness checklist before sharing with students",
  ];

  const notPilotReadyUntil = [
    "Faculty approve the curated examples and source-type guidance",
    "Course policy language is reviewed for AI disclosure expectations",
    "Faculty approve the Document Check limitation language before any full-paper student pilot",
    "Known citation, DOCX extraction, and correction test cases pass in CI",
    "BYOK key handling and provider CORS limits are explained to reviewers",
    "Students are told this is a coach, not a final APA validator",
  ];

  return (
    <div className="learn-stack">
      <div className="section-heading">
        <p className="eyebrow">Faculty Review</p>
        <h2>Ready for a professor-facing v1.4 review</h2>
        <p>
          This v1.4 build moves the main review link to Vercel so Document Check can parse
          DOCX/PDF/TXT files through a light API route.
          It is still a review build, not a public student pilot.
        </p>
      </div>

      <section className="review-hero">
        <div>
          <p className="eyebrow">Shareable version</p>
          <h3>APA Coach v1.4</h3>
          <p>
            A learning-first APA support tool for building citations, checking
            full documents or single references, and practicing APA
            rules without replacing student authorship.
          </p>
        </div>
        <div className="review-actions">
          <a href={`${publicBasePath}docs/professor-handoff.md`} target="_blank" rel="noreferrer">
            Handoff notes
            <ExternalLink size={16} />
          </a>
          <a href={`${publicBasePath}docs/deployment-guide.md`} target="_blank" rel="noreferrer">
            Deployment guide
            <ExternalLink size={16} />
          </a>
          <a href={`${publicBasePath}docs/v1.0-functional-test-report.md`} target="_blank" rel="noreferrer">
            Test report
            <ExternalLink size={16} />
          </a>
          <a href={`${publicBasePath}docs/v1.1-upgrade-plan.md`} target="_blank" rel="noreferrer">
            v1.1 plan
            <ExternalLink size={16} />
          </a>
          <a href={`${publicBasePath}docs/v1.2-llm-byok-guide.md`} target="_blank" rel="noreferrer">
            v1.2 BYOK guide
            <ExternalLink size={16} />
          </a>
          <a href={`${publicBasePath}docs/v1.4-upgrade-notes.md`} target="_blank" rel="noreferrer">
            v1.4 notes
            <ExternalLink size={16} />
          </a>
        </div>
      </section>

      <section className="learn-panels">
        <div className="checklist-panel">
          <div className="panel-title">
            <CheckCircle2 size={20} />
            <h3>Delivery readiness</h3>
          </div>
          <ul>
            {readinessItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="practice-panel">
          <div className="panel-title">
            <ShieldCheck size={20} />
            <h3>Suggested review questions</h3>
          </div>
          <div className="review-question-list">
            {reviewQuestions.map((question) => (
              <p key={question}>{question}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="learn-panels">
        <div className="checklist-panel">
          <div className="panel-title">
            <ListChecks size={20} />
            <h3>Sample walkthrough</h3>
          </div>
          <ol>
            {walkthroughSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div className="checklist-panel">
          <div className="panel-title">
            <ClipboardCheck size={20} />
            <h3>Faculty review checklist</h3>
          </div>
          <ul>
            {facultyChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="checklist-panel">
          <div className="panel-title">
            <ShieldCheck size={20} />
            <h3>Not pilot-ready until</h3>
          </div>
          <ul>
            {notPilotReadyUntil.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default App;
