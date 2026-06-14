import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  ListChecks,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { checklistItems, practicePrompts, ruleCards, sourceTypeLabels } from "./data/rules";
import { aiFeedbackProvider } from "./lib/aiFeedbackProvider";
import { buildCitation } from "./lib/citation";
import type { CheckIssue, SourceInput, SourceType } from "./types";

type Tab = "build" | "check" | "learn" | "review";

const emptyInput: SourceInput = {
  sourceType: "journalArticle",
  author: "Smith, J.",
  date: "2024",
  title: "Learning APA style in first-year psychology",
  source: "Journal of Student Writing",
  publisher: "",
  doi: "10.1037/example",
  url: "",
  pages: "12(2), 45-61",
};

const sampleCheck =
  "Smith, J. The Article Title. Journal of Student Writing, 12(2).";

const fieldConfig: Array<{
  key: keyof SourceInput;
  label: string;
  placeholder: string;
  helper: string;
}> = [
  {
    key: "author",
    label: "Author",
    placeholder: "Smith, J.",
    helper: "Use the name exactly as the source gives it.",
  },
  {
    key: "date",
    label: "Date",
    placeholder: "2024",
    helper: "Use n.d. only when the source truly has no date.",
  },
  {
    key: "title",
    label: "Title",
    placeholder: "Learning APA style in first-year psychology",
    helper: "Article and webpage titles usually use sentence case.",
  },
  {
    key: "source",
    label: "Source",
    placeholder: "Journal, website, course, or platform",
    helper: "Name the container that helps a reader find the work.",
  },
  {
    key: "publisher",
    label: "Publisher or book title",
    placeholder: "Publisher or edited book title",
    helper: "Needed for books, chapters, reports, and some AI tools.",
  },
  {
    key: "pages",
    label: "Volume, issue, or pages",
    placeholder: "12(2), 45-61",
    helper: "Use page or article details when they are available.",
  },
  {
    key: "doi",
    label: "DOI",
    placeholder: "10.1037/example",
    helper: "A DOI is preferred when available.",
  },
  {
    key: "url",
    label: "URL",
    placeholder: "https://example.edu/source",
    helper: "Use a stable URL when a DOI is not available and retrieval is needed.",
  },
];

const visibleFields: Record<SourceType, Array<keyof SourceInput>> = {
  journalArticle: ["author", "date", "title", "source", "pages", "doi", "url"],
  book: ["author", "date", "title", "publisher", "doi", "url"],
  bookChapter: ["author", "date", "title", "source", "publisher", "pages", "doi", "url"],
  webpage: ["author", "date", "title", "source", "url"],
  report: ["author", "date", "title", "publisher", "doi", "url"],
  video: ["author", "date", "title", "source", "url"],
  courseMaterial: ["author", "date", "title", "source"],
  generativeAI: ["author", "date", "title", "source", "url"],
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [sourceInput, setSourceInput] = useState<SourceInput>(emptyInput);
  const [checkText, setCheckText] = useState(sampleCheck);
  const [issues, setIssues] = useState<CheckIssue[]>([]);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const citation = useMemo(() => buildCitation(sourceInput), [sourceInput]);

  const updateField = (key: keyof SourceInput, value: string) => {
    setSourceInput((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const runCheck = async () => {
    const nextIssues = await aiFeedbackProvider.diagnoseCitation(checkText);
    setIssues(nextIssues);
    setRevealed({});
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
              <p className="eyebrow">v1.0 review build</p>
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
              className={activeTab === "check" ? "tab-button active" : "tab-button"}
              onClick={() => setActiveTab("check")}
              type="button"
            >
              <ClipboardCheck size={18} />
              Check
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
          {activeTab === "check" && (
            <CheckView
              checkText={checkText}
              issues={issues}
              revealed={revealed}
              runCheck={runCheck}
              setCheckText={setCheckText}
              setRevealed={setRevealed}
            />
          )}
          {activeTab === "learn" && <LearnView />}
          {activeTab === "review" && <ReviewView />}
        </section>
      </section>
    </main>
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
  const fields = fieldConfig.filter((field) => visibleFields[sourceInput.sourceType].includes(field.key));

  return (
    <div className="view-grid">
      <section className="editor-column">
        <div className="section-heading">
          <p className="eyebrow">Build</p>
          <h2>Create a citation pair</h2>
          <p>Enter source details, then compare the reference entry with parenthetical and narrative in-text forms.</p>
        </div>

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
            <label className="field-block" key={field.key}>
              <span>{field.label}</span>
              <input
                value={sourceInput[field.key]}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.key, event.target.value)}
              />
              <small>{field.helper}</small>
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
          <p className="citation-output hanging">{citation.reference}</p>
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

        {citation.warnings.length > 0 && (
          <div className="warning-list">
            {citation.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
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

function CheckView({
  checkText,
  issues,
  revealed,
  runCheck,
  setCheckText,
  setRevealed,
}: {
  checkText: string;
  issues: CheckIssue[];
  revealed: Record<number, boolean>;
  runCheck: () => Promise<void>;
  setCheckText: (value: string) => void;
  setRevealed: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}) {
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
          <textarea
            value={checkText}
            onChange={(event) => setCheckText(event.target.value)}
            rows={10}
          />
        </label>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={runCheck}>
            <ClipboardCheck size={18} />
            Check citation
          </button>
          <button className="secondary-button" type="button" onClick={() => setCheckText(sampleCheck)}>
            Use sample
          </button>
        </div>
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
                  <span>{issue.severity}</span>
                  <small>{issue.confidence} confidence</small>
                </div>
                <h3>{issue.message}</h3>
                <p>{issue.hint}</p>
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
                {revealed[index] && <p className="suggestion">{issue.suggestedCorrection}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LearnView() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  return (
    <div className="learn-stack">
      <div className="section-heading">
        <p className="eyebrow">Learn</p>
        <h2>APA rule cards and practice</h2>
        <p>Use these cards to connect each correction to a rule, example, and instructor check point.</p>
      </div>

      <section className="rule-grid">
        {ruleCards.map((rule) => (
          <article className="rule-card" key={rule.id}>
            <h3>{rule.title}</h3>
            <p>{rule.plainLanguageRule}</p>
            <div className="example-box">{rule.example}</div>
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
                  const selected = selectedAnswers[index] === choice;
                  const correct = selected && choice === item.answer;
                  return (
                    <button
                      className={correct ? "choice-button correct" : selected ? "choice-button selected" : "choice-button"}
                      key={choice}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [index]: choice,
                        }))
                      }
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReviewView() {
  const readinessItems = [
    "Static Vite build ready for Vercel or another static host",
    "No login, database, or student text storage in v1.0",
    "No live AI API call in v1.0; feedback is rule-based with a future provider interface",
    "English-only student-facing interface",
    "Faculty-facing handoff and deployment documentation included in the repository",
  ];

  const reviewQuestions = [
    "Does the tool feel like a tutor instead of an answer generator?",
    "Are the academic integrity boundaries clear enough for students?",
    "Are the APA examples and warnings appropriate for psychology coursework?",
    "Should any course-specific policies be added before a student pilot?",
  ];

  return (
    <div className="learn-stack">
      <div className="section-heading">
        <p className="eyebrow">Faculty Review</p>
        <h2>Ready for a professor-facing review</h2>
        <p>
          This v1.0 build is prepared for online delivery as a static site. It
          keeps the learning boundary visible and makes the privacy posture easy
          to evaluate before any student pilot.
        </p>
      </div>

      <section className="review-hero">
        <div>
          <p className="eyebrow">Shareable version</p>
          <h3>APA Coach v1.0</h3>
          <p>
            A learning-first APA support tool for building citations, checking
            citation attempts, and practicing APA rules without replacing student
            authorship.
          </p>
        </div>
        <div className="review-actions">
          <a href="/docs/professor-handoff.md" target="_blank" rel="noreferrer">
            Handoff notes
            <ExternalLink size={16} />
          </a>
          <a href="/docs/deployment-guide.md" target="_blank" rel="noreferrer">
            Deployment guide
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
    </div>
  );
}

export default App;
