import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class ExtractionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ExtractionError';
    this.statusCode = statusCode;
  }
}

export interface ExtractedDocumentData {
  text: string;
  pageCount: number;
  pages: Array<{ pageNumber: number; text: string }>;
}

/**
 * Maximum document length limit: 500,000 characters (~100 single-spaced legal pages)
 * Protects server memory, worker CPU, and AI token limits from unbounded/pathological payloads.
 */
export const MAX_DOCUMENT_CHARACTERS = 500_000;

/**
 * Extract clean, normalized text from PDF, DOCX, or TXT buffer or filepath.
 * Strictly validates document structure and rejects malformed binary content without pretending it is text.
 */
export async function extractTextFromFile(
  filePathOrBuffer: string | Buffer,
  mimeType: string
): Promise<ExtractedDocumentData> {
  const buffer = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer
    : fs.readFileSync(filePathOrBuffer);

  if (!buffer || buffer.length === 0) {
    throw new ExtractionError('Uploaded file is empty (0 bytes).', 400);
  }

  const lowerMime = (mimeType || '').toLowerCase();
  let extracted: ExtractedDocumentData;

  if (lowerMime.includes('pdf')) {
    extracted = await extractPdf(buffer);
  } else if (
    lowerMime.includes('wordprocessingml') ||
    lowerMime.includes('docx') ||
    lowerMime.includes('msword')
  ) {
    extracted = await extractDocx(buffer);
  } else if (lowerMime.includes('text') || lowerMime === 'application/octet-stream' || lowerMime === '') {
    extracted = extractPlainText(buffer);
  } else {
    throw new ExtractionError(`Unsupported document MIME type: ${mimeType}. Only PDF, DOCX, and TXT are supported.`, 400);
  }

  // Enforce document content limits (Section 9 & 10)
  const trimmedText = extracted.text.trim();
  if (trimmedText.length === 0) {
    throw new ExtractionError('Document contains no readable text or is empty.', 422);
  }

  if (trimmedText.length > MAX_DOCUMENT_CHARACTERS) {
    throw new ExtractionError(
      `Document text exceeds maximum allowable limit of ${MAX_DOCUMENT_CHARACTERS.toLocaleString()} characters.`,
      422
    );
  }

  return {
    ...extracted,
    text: trimmedText,
  };
}

async function extractPdf(buffer: Buffer): Promise<ExtractedDocumentData> {
  // Verify PDF magic bytes '%PDF'
  if (buffer.length < 5 || !buffer.slice(0, 5).toString('ascii').startsWith('%PDF')) {
    throw new ExtractionError('Invalid PDF file: Missing %PDF magic header.', 400);
  }

  try {
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    const pageCount = data.numpages || 1;

    // Split pages roughly by form-feed or newline chunks if available
    const rawPages = text.split(/\f/g);
    const pages: Array<{ pageNumber: number; text: string }> = [];

    if (rawPages.length > 1) {
      for (let i = 0; i < rawPages.length; i++) {
        const pageText = rawPages[i].trim();
        if (pageText) {
          pages.push({ pageNumber: i + 1, text: pageText });
        }
      }
    } else {
      pages.push({ pageNumber: 1, text });
    }

    return {
      text,
      pageCount: Math.max(pageCount, pages.length),
      pages,
    };
  } catch (err: any) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError('Failed to parse PDF document. File may be malformed, corrupted, or password-protected.', 400);
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractedDocumentData> {
  // Verify ZIP magic bytes 'PK' (0x50, 0x4B)
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    throw new ExtractionError('Invalid DOCX document: File is missing ZIP container header.', 400);
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || '').trim();
    return {
      text,
      pageCount: 1,
      pages: [{ pageNumber: 1, text }],
    };
  } catch (err: any) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError('Failed to parse DOCX document. File may be corrupted or not a valid Word document.', 400);
  }
}

function extractPlainText(buffer: Buffer): ExtractedDocumentData {
  // Reject binary files pretending to be text by inspecting for null bytes in initial chunk
  const checkLength = Math.min(buffer.length, 1024);
  for (let i = 0; i < checkLength; i++) {
    if (buffer[i] === 0) {
      throw new ExtractionError('Binary file rejected: Plain text documents cannot contain binary null bytes.', 400);
    }
  }

  const text = buffer.toString('utf8').trim();

  // Detect explicit PAGE X markers if present
  const pageMatches = text.split(/(?:---+\s*Page\s+\d+\s*---+|\f)/i);
  const pages: Array<{ pageNumber: number; text: string }> = [];

  if (pageMatches.length > 1) {
    pageMatches.forEach((p, idx) => {
      const trimmed = p.trim();
      if (trimmed) {
        pages.push({ pageNumber: idx + 1, text: trimmed });
      }
    });
  } else {
    pages.push({ pageNumber: 1, text });
  }

  return {
    text,
    pageCount: Math.max(1, pages.length),
    pages,
  };
}
