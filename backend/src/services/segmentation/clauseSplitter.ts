import { z } from 'zod';
import { ClauseType, DocumentType } from '@parity/shared';
import { executeStructuredAI } from '../ai/aiOrchestrator';

export interface SplitClause {
  clauseIndex: number;
  clauseType: ClauseType;
  sectionTitle?: string;
  clauseText: string;
}

/**
 * Keyword-to-ClauseType mapping for the 20 canonical types
 */
const KEYWORD_MAP: Array<{ keywords: string[]; type: ClauseType }> = [
  { keywords: ['payment', 'compensation', 'fee', 'rent', 'billing', 'invoice', 'rates'], type: ClauseType.PaymentTerms },
  { keywords: ['scope of work', 'statement of work', 'sow', 'services', 'deliverables', 'tasks'], type: ClauseType.ScopeOfWork },
  { keywords: ['intellectual property', 'ip rights', 'work product', 'patent', 'copyright', 'ownership of content', 'inventions'], type: ClauseType.IntellectualProperty },
  { keywords: ['confidential', 'nda', 'non-disclosure', 'trade secret', 'proprietary information'], type: ClauseType.Confidentiality },
  { keywords: ['indemn', 'hold harmless', 'defense of claims'], type: ClauseType.Indemnification },
  { keywords: ['limitation of liability', 'liability', 'damages cap', 'waiver of consequential', 'indirect damages'], type: ClauseType.LimitationOfLiability },
  { keywords: ['terminat', 'cancellation', 'expiration', 'cure period'], type: ClauseType.Termination },
  { keywords: ['dispute', 'arbitrat', 'mediat', 'informal resolution', 'jurisdiction and venue'], type: ClauseType.DisputeResolution },
  { keywords: ['governing law', 'applicable law', 'choice of law'], type: ClauseType.GoverningLaw },
  { keywords: ['non-compete', 'noncompete', 'non-solicit', 'nonsolicitation', 'restrictive covenant'], type: ClauseType.NonCompeteNonSolicitation },
  { keywords: ['insurance', 'coverage', 'commercial general liability'], type: ClauseType.Insurance },
  { keywords: ['amendment', 'modification', 'entire agreement', 'merger clause'], type: ClauseType.Amendments },
  { keywords: ['force majeure', 'acts of god', 'unforeseen events'], type: ClauseType.ForceMajeure },
  { keywords: ['warrant', 'representation', 'habitability', 'as-is'], type: ClauseType.WarrantyRepresentations },
  { keywords: ['assign', 'sublet', 'sublease', 'transfer'], type: ClauseType.Assignment },
  { keywords: ['notice', 'notification', 'written notice', 'entry'], type: ClauseType.Notice },
  { keywords: ['data use', 'privacy', 'telemetry', 'personal data', 'cookies', 'gdpr'], type: ClauseType.DataUsePrivacy },
  { keywords: ['auto-renewal', 'automatic renewal', 'renewal term', 'cancel-by-mail'], type: ClauseType.AutoRenewal },
  { keywords: ['fee', 'refund', 'deposit', 'penalt', 'late charge'], type: ClauseType.FeesRefunds },
];

/**
 * Regex patterns matching standard legal section headings
 */
const BOUNDARY_REGEXES = [
  /^(?:SECTION|Section)\s+\d+[\.:\-]\s*(.+)$/m,
  /^(?:ARTICLE|Article)\s+[IVXLCDM\d]+[\.:\-]?\s*(.*)$/m,
  /^(\d+(?:\.\d+)*)\s*[\.\)]\s*(.+)$/m,
  /^([A-Z][A-Z0-9\s\/\-&,]{3,}[A-Z0-9])[\.:]?\s*$/m,
  /^([A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|of|and|or|the|for|in|to|by))*)\.\s/m,
];

/**
 * Split document text into clauses:
 * 1. Regex-based deterministic parsing
 * 2. If < 3 sections found, trigger LLM Boundary Finder fallback
 */
export async function splitDocumentIntoClauses(
  documentText: string,
  documentType: DocumentType
): Promise<SplitClause[]> {
  const deterministicClauses = splitByRegex(documentText);

  if (deterministicClauses.length >= 3) {
    return deterministicClauses;
  }

  // Fewer than 3 sections found: trigger LLM fallback boundary finder
  console.log('[Segmentation] Deterministic parse found < 3 sections. Triggering LLM boundary fallback...');
  return runLLMBoundaryFinder(documentText, documentType, deterministicClauses);
}

/**
 * Deterministic regex pass
 */
export function splitByRegex(text: string): SplitClause[] {
  const lines = text.split(/\r?\n/);
  const headings: Array<{ lineIndex: number; title: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    for (const pattern of BOUNDARY_REGEXES) {
      const match = line.match(pattern);
      if (match) {
        const title = (match[2] || match[1] || match[0]).trim();
        // Discard trivial matches
        if (title.length > 2 && !/^\d+$/.test(title) && title.length < 80) {
          headings.push({ lineIndex: i, title });
          break;
        }
      }
    }
  }

  if (headings.length === 0) {
    // If no headings match, break by paragraph blocks of >= 120 chars
    return splitByParagraphs(text);
  }

  const clauses: SplitClause[] = [];
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].lineIndex;
    const end = i + 1 < headings.length ? headings[i + 1].lineIndex : lines.length;
    const clauseLines = lines.slice(start, end);
    const clauseText = clauseLines.join('\n').trim();

    if (clauseText.length < 20) continue;

    const clauseType = classifyHeading(headings[i].title, clauseText);

    clauses.push({
      clauseIndex: clauses.length + 1,
      clauseType,
      sectionTitle: headings[i].title,
      clauseText,
    });
  }

  return clauses;
}

/**
 * Fallback paragraph splitter when no clear headings exist
 */
function splitByParagraphs(text: string): SplitClause[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length >= 40);

  if (paragraphs.length === 0) {
    return [
      {
        clauseIndex: 1,
        clauseType: ClauseType.General,
        sectionTitle: 'Full Agreement',
        clauseText: text.trim(),
      },
    ];
  }

  return paragraphs.map((p, idx) => ({
    clauseIndex: idx + 1,
    clauseType: classifyHeading(p.slice(0, 40), p),
    sectionTitle: `Section ${idx + 1}`,
    clauseText: p,
  }));
}

/**
 * Classify a heading or clause excerpt into a canonical ClauseType
 */
export function classifyHeading(heading: string, bodyText = ''): ClauseType {
  const combined = `${heading} ${bodyText}`.toLowerCase();

  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (combined.includes(kw)) {
        return entry.type;
      }
    }
  }

  return ClauseType.General;
}

/**
 * LLM Boundary Finder Fallback (Section 15 specification)
 */
async function runLLMBoundaryFinder(
  text: string,
  documentType: DocumentType,
  fallbackClauses: SplitClause[]
): Promise<SplitClause[]> {
  const systemPrompt = `You are Parity's document-structure reader. Find where one clause or section ends and the next begins in a legal document, and label what each one covers.

Work only from the text given — never invent content that isn't there. Identify every distinct section, even short ones; don't skip anything as unimportant, and don't merge two different topics into one section just because they're adjacent. Respond with valid JSON only, no markdown formatting.`;

  const userPrompt = `DOCUMENT TYPE: ${documentType}

TEXT:
${text.slice(0, 7000)}

Return a JSON object:
{
  "sections": [
    {
      "clauseType": "one of the canonical clause types",
      "clauseText": "the complete text of this section, exactly as written"
    }
  ]
}`;

  const LLMBoundarySchema = z.object({
    sections: z.array(
      z.object({
        clauseType: z.string(),
        clauseText: z.string(),
      })
    ),
  });

  const result = await executeStructuredAI({
    systemPrompt,
    userPrompt,
    schema: LLMBoundarySchema,
    deterministicFallback: () => ({
      sections: fallbackClauses.map((c) => ({
        clauseType: c.clauseType,
        clauseText: c.clauseText,
      })),
    }),
  });

  const parsed = result.data.sections;
  if (!parsed || parsed.length === 0) {
    return fallbackClauses;
  }

  return parsed.map((item, idx) => {
    const matchedType = classifyHeading(item.clauseType, item.clauseText);
    return {
      clauseIndex: idx + 1,
      clauseType: matchedType,
      sectionTitle: `Section ${idx + 1}: ${matchedType}`,
      clauseText: item.clauseText,
    };
  });
}
