import React, { useState } from 'react';
import { QAResponse, EvidenceStatus } from '@parity/shared';
import { apiUrl } from '../../config';

interface ContextualChatProps {
  documentId: string;
  isDemo: boolean;
  onJumpToClauseById: (clauseId: string) => void;
  demoQAMap?: Record<string, QAResponse>;
}

export const ContextualChat: React.FC<ContextualChatProps> = ({
  documentId,
  isDemo,
  onJumpToClauseById,
  demoQAMap = {},
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAResponse[]>([]);

  const handleAsk = async (customQ?: string) => {
    const q = customQ || question;
    if (!q.trim()) return;

    setLoading(true);
    try {
      // If in demo mode and precomputed answers exist, return instant fixture
      if (isDemo && Object.keys(demoQAMap).length > 0) {
        const lower = q.toLowerCase();
        let demoMatch: QAResponse | null = null;

        for (const [key, val] of Object.entries(demoQAMap)) {
          if (lower.includes(key)) {
            demoMatch = val;
            break;
          }
        }

        if (demoMatch) {
          setHistory((prev) => [demoMatch!, ...prev]);
          setQuestion('');
          setLoading(false);
          return;
        }
      }

      // Live API call
      const res = await fetch(apiUrl(`/api/documents/${documentId}/questions`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: QAResponse = await res.json();
      setHistory((prev) => [data, ...prev]);
      setQuestion('');
    } catch (err: any) {
      setHistory((prev) => [
        {
          question: q,
          answer: "I couldn't establish an answer from the document text at this time.",
          status: EvidenceStatus.InsufficientEvidence,
          supportingClauseId: null,
          limitationNote: err.message,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'When do I get paid, and what happens if there is an invoice dispute?',
    'Can the client terminate immediately without paying me for completed work?',
    'Do I lose ownership of my pre-existing code and design tools?',
    'Can I work with other clients or competitors while doing this contract?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="inspector-card-label">Contextual Document Q&A</div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary-dark)' }}>
        Ask any specific question about your rights, payment, or exit terms. Answers are strictly grounded in document text.
      </p>

      {/* Suggested Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted-dark)', fontWeight: 700 }}>
          COMMON QUESTIONS
        </span>
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            className="nav-btn"
            style={{
              textAlign: 'left',
              fontSize: '12px',
              padding: '6px 10px',
              borderColor: 'var(--border-dark)',
              whiteSpace: 'normal',
            }}
            onClick={() => handleAsk(sq)}
          >
            ↳ {sq}
          </button>
        ))}
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this contract..."
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-dark)',
            borderRadius: '4px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
          }}
          disabled={loading}
        />
        <button
          type="submit"
          className="cta-btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Ask'}
        </button>
      </form>

      {/* Responses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
        {history.map((item, idx) => {
          const isGrounded = item.status === EvidenceStatus.Grounded;

          return (
            <div
              key={idx}
              className="inspector-card"
              style={{
                borderLeft: `4px solid ${isGrounded ? 'var(--risk-fair)' : 'var(--risk-caution)'}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff', marginBottom: '6px' }}>
                Q: {item.question}
              </div>

              <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '10px' }}>
                {item.answer}
              </div>

              {isGrounded && item.supportingClauseId && (
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-dark-subtle)',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                      Source: {item.supportingClauseType || 'Cited Clause'} (Page {item.pageNumber || 1})
                    </span>
                    <button
                      onClick={() => onJumpToClauseById(item.supportingClauseId!)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Jump to text →
                    </button>
                  </div>
                  {item.verbatimQuote && (
                    <blockquote
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: '#cbd5e1',
                        borderLeft: '2px solid var(--accent-gold)',
                        paddingLeft: '8px',
                        marginTop: '6px',
                        fontStyle: 'italic',
                      }}
                    >
                      "{item.verbatimQuote}"
                    </blockquote>
                  )}
                </div>
              )}

              {!isGrounded && (
                <div style={{ fontSize: '11px', color: '#fbbf24', fontStyle: 'italic' }}>
                  ℹ Insufficient Evidence: The document does not explicitly provide facts answering this question.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
