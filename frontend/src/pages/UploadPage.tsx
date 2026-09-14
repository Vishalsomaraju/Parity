import React, { useState } from 'react';
import { DocumentType, Document } from '@parity/shared';
import { apiUrl } from '../config';

interface UploadPageProps {
  onDocumentProcessed: (doc: Document) => void;
  onLoadSample: (sampleKey: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onDocumentProcessed, onLoadSample }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.FreelanceServices);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['.pdf', '.docx', '.txt'];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(ext)) {
        setError('Please select a PDF, DOCX, or TXT file.');
        setFile(null);
        return;
      }

      setError(null);
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setStatusMessage('Uploading and extracting text...');
    setProgressPercent(15);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', docType);

      // Use sync=true so it completes deterministically in the request
      const res = await fetch(apiUrl('/api/documents?sync=true'), {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Upload failed with status ${res.status}`);
      }

      const uploadResult = await res.json();
      setProgressPercent(80);
      setStatusMessage('Finalizing document intelligence...');

      // Fetch completed document
      const docRes = await fetch(apiUrl(`/api/documents/${uploadResult.id}`));
      if (!docRes.ok) {
        throw new Error('Failed to retrieve processed document.');
      }
      const completedDoc: Document = await docRes.json();

      setProgressPercent(100);
      setStatusMessage('Analysis complete!');
      setTimeout(() => {
        onDocumentProcessed(completedDoc);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during processing.');
      setUploading(false);
    }
  };

  return (
    <main style={{ maxWidth: '880px', margin: '36px auto', padding: '0 24px 64px' }}>
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="badge badge-demo" style={{ fontSize: '12px', padding: '6px 14px' }}>
            § AI for Legal Assistance & Access
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            marginBottom: '12px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Upload Legal Document
        </h1>
        <p
          style={{
            color: 'var(--text-secondary-dark)',
            fontSize: '16px',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Know where you stand before you sign. Upload a contract (PDF, DOCX, or TXT) to translate fine print, highlight hidden risks, extract obligations, and map timelines.
        </p>
      </header>

      {/* Upload Form Box */}
      <section
        className="inspector-card"
        style={{
          padding: '36px',
          marginBottom: '36px',
          backgroundColor: 'var(--bg-surface-dark)',
          border: '1px solid var(--border-dark)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="doc-type-select"
            style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}
          >
            DOCUMENT CATEGORY:
          </label>
          <select
            id="doc-type-select"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-dark)',
              borderRadius: '4px',
              padding: '12px 14px',
              color: '#fff',
              fontSize: '14px',
            }}
            disabled={uploading}
          >
            <option value={DocumentType.FreelanceServices}>Freelance / Contractor Services Agreement</option>
            <option value={DocumentType.ResidentialLease}>Residential Lease Agreement</option>
            <option value={DocumentType.PolicyToS}>Terms of Service / Privacy Policy</option>
          </select>
        </div>

        {/* Drag & Drop Input */}
        <div
          style={{
            border: '2px dashed var(--border-dark)',
            borderRadius: '6px',
            padding: '36px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-app)',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
          <input
            type="file"
            id="file-input"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          <label
            htmlFor="file-input"
            className="nav-btn"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-dark)',
              color: '#fff',
              cursor: uploading ? 'not-allowed' : 'pointer',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {file ? file.name : 'Choose PDF, DOCX, or TXT File'}
          </label>
          {file ? (
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--accent-gold)' }}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </div>
          ) : (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted-dark)' }}>
              Max file size 15 MB · In-memory ephemeral processing · Zero persistent storage
            </div>
          )}
        </div>

        {/* Progress Bar if Uploading */}
        {uploading && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{statusMessage}</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>{progressPercent}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-gold)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid #dc2626',
              padding: '12px 16px',
              borderRadius: '4px',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <button
          className="cta-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Analyzing Document Intelligence...' : 'Start Document Analysis →'}
        </button>
      </section>

      {/* Instant Demo Samples Selector */}
      <section style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'var(--text-muted-dark)',
            marginBottom: '16px',
          }}
        >
          Or Inspect Pre-Analyzed Sample Contracts Immediately (No Upload Required)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <button
            className="inspector-card"
            style={{
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
              border: '1px solid var(--border-dark)',
              backgroundColor: 'var(--bg-surface-dark)',
              transition: 'border-color 0.2s ease',
            }}
            onClick={() => onLoadSample('demo_freelance_standard')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <span className="badge badge-fair" style={{ fontSize: '11px' }}>Fair Baseline</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Freelance Agreement
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary-dark)', lineHeight: 1.4 }}>
              Net-30 payment, reciprocal indemnity, IP transferred upon payment.
            </div>
          </button>

          <button
            className="inspector-card"
            style={{
              padding: '18px',
              textAlign: 'left',
              cursor: 'pointer',
              border: '1px solid var(--border-dark)',
              backgroundColor: 'var(--bg-surface-dark)',
              transition: 'border-color 0.2s ease',
            }}
            onClick={() => onLoadSample('demo_freelance_aggressive')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span className="badge badge-flag" style={{ fontSize: '11px' }}>Red Flags</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Omnicorp Contractor SOW
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary-dark)', lineHeight: 1.4 }}>
              Net-90 payment, unlimited liability, 2-year non-compete clause.
            </div>
          </button>
        </div>
      </section>
    </main>
  );
};
