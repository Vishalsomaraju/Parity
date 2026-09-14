import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedDocumentData {
  text: string;
  pageCount: number;
  pages: Array<{ pageNumber: number; text: string }>;
}

/**
 * Extract clean, normalized text from PDF, DOCX, or TXT buffer or filepath.
 */
export async function extractTextFromFile(
  filePathOrBuffer: string | Buffer,
  mimeType: string
): Promise<ExtractedDocumentData> {
  const buffer = Buffer.isBuffer(filePathOrBuffer)
    ? filePathOrBuffer
    : fs.readFileSync(filePathOrBuffer);

  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.includes('pdf')) {
    return extractPdf(buffer);
  }

  if (
    lowerMime.includes('wordprocessingml') ||
    lowerMime.includes('docx') ||
    lowerMime.includes('msword')
  ) {
    return extractDocx(buffer);
  }

  // Fallback to plain text
  return extractPlainText(buffer);
}

async function extractPdf(buffer: Buffer): Promise<ExtractedDocumentData> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || '';
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
      pages.push({ pageNumber: 1, text: text.trim() });
    }

    return {
      text: text.trim(),
      pageCount: Math.max(pageCount, pages.length),
      pages,
    };
  } catch (err: any) {
    console.warn('[Extraction] PDF parsing error, falling back to plain string:', err.message);
    const rawText = buffer.toString('utf8');
    return {
      text: rawText.trim(),
      pageCount: 1,
      pages: [{ pageNumber: 1, text: rawText.trim() }],
    };
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractedDocumentData> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';
    return {
      text: text.trim(),
      pageCount: 1,
      pages: [{ pageNumber: 1, text: text.trim() }],
    };
  } catch (err: any) {
    console.warn('[Extraction] DOCX error:', err.message);
    const rawText = buffer.toString('utf8');
    return {
      text: rawText.trim(),
      pageCount: 1,
      pages: [{ pageNumber: 1, text: rawText.trim() }],
    };
  }
}

function extractPlainText(buffer: Buffer): ExtractedDocumentData {
  const text = buffer.toString('utf8');
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
    pages.push({ pageNumber: 1, text: text.trim() });
  }

  return {
    text: text.trim(),
    pageCount: Math.max(1, pages.length),
    pages,
  };
}
