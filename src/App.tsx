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
import { fieldDefinitions, sourceExamples, sourceTypeConfigs } from "./data/sourceExamples";
import { aiFeedbackProvider } from "./lib/aiFeedbackProvider";
import { buildCitation } from "./lib/citation";
import type { CheckIssue, RuleTopic, SourceInput, SourceType } from "./types";

type Tab = "build" | "check" | "learn" | "review";

const publicBasePath = import.meta.env.BASE_URL;

const sampleCheck =
  "Smith, J. The Article Title. Journal of Student Writing, 12(2).";

const topicFilters: Array<"All" | RuleTopic> = [
  "All",
  "In-text citations",
  "References",
  "Paper setup",
  "AI citation/disclosure",
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [sourceInput, setSourceInput] = useState<SourceInput>(sourceExamples[0].input);
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
              <p className="eyebrow">v1.1 review build</p>
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
                <p><strong>Why it matters:</strong> {issue.whyItMatters}</p>
                <p>{issue.hint}</p>
                <p><strong>Student action:</strong> {issue.studentAction}</p>
                <p className="rule-source">Rule source: {issue.ruleSource}</p>
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
            <div className="example-box">{rule.example}</div>
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
    "Static Vite build ready for GitHub Pages",
    "No login, database, or student text storage in v1.1",
    "No live AI API call in v1.1; feedback is rule-based with a future provider interface",
    "English-only student-facing interface",
    "Faculty-facing handoff, test report, and v1.1 documentation included in the repository",
  ];

  const reviewQuestions = [
    "Does the tool feel like a tutor instead of an answer generator?",
    "Are the academic integrity boundaries clear enough for students?",
    "Are the APA examples and warnings appropriate for psychology coursework?",
    "Should any course-specific policies be added before a student pilot?",
  ];

  const facultyChecklist = [
    "Pedagogy fit: feedback teaches the reason for a correction",
    "Academic integrity fit: the tool does not draft papers or invent source data",
    "APA accuracy concerns: source examples and corrections need faculty review",
    "Privacy concerns: no student text is stored or sent to an API in this version",
    "Pilot readiness: use only after faculty approves examples and boundaries",
  ];

  const walkthroughSteps = [
    "Open Build and choose Journal article with DOI to review the complete citation flow",
    "Choose Missing author practice to confirm the tool blocks incomplete references",
    "Open Check, run the sample, and reveal one correction after reading the hint",
    "Open Learn, filter to AI citation/disclosure, and answer one practice prompt",
    "Return to this page and review the pilot-readiness checklist before sharing with students",
  ];

  const notPilotReadyUntil = [
    "Faculty approve the curated examples and source-type guidance",
    "Course policy language is reviewed for AI disclosure expectations",
    "Known citation test cases pass in CI",
    "Students are told this is a coach, not a final APA validator",
  ];

  return (
    <div className="learn-stack">
      <div className="section-heading">
        <p className="eyebrow">Faculty Review</p>
        <h2>Ready for a professor-facing v1.1 review</h2>
        <p>
          This v1.1 build is prepared for online delivery as a static site. It
          keeps the learning boundary visible and makes the privacy posture easy
          to evaluate before any student pilot.
        </p>
      </div>

      <section className="review-hero">
        <div>
          <p className="eyebrow">Shareable version</p>
          <h3>APA Coach v1.1</h3>
          <p>
            A learning-first APA support tool for building citations, checking
            citation attempts, and practicing APA rules without replacing student
            authorship.
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
