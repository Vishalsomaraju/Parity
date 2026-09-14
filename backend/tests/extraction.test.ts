import { extractTextFromFile, ExtractionError, MAX_DOCUMENT_CHARACTERS } from '../src/services/extraction/textExtractor';

describe('Text Extraction Module', () => {
  it('extracts plain text and detects page count', async () => {
    const text = 'Simple agreement text for testing.';
    const data = await extractTextFromFile(Buffer.from(text), 'text/plain');
    expect(data.text).toBe(text);
    expect(data.pageCount).toBe(1);
    expect(data.pages.length).toBe(1);
  });

  it('detects page separators in plain text', async () => {
    const multiPage = `
Page 1 Content
--- Page 2 ---
Page 2 Content
--- Page 3 ---
Page 3 Content
    `.trim();

    const data = await extractTextFromFile(Buffer.from(multiPage), 'text/plain');
    expect(data.pageCount).toBe(3);
    expect(data.pages.length).toBe(3);
  });

  it('rejects empty file buffer with 400', async () => {
    await expect(extractTextFromFile(Buffer.from(''), 'text/plain'))
      .rejects.toThrow(ExtractionError);
    await expect(extractTextFromFile(Buffer.from(''), 'text/plain'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects empty whitespace-only text with 422', async () => {
    await expect(extractTextFromFile(Buffer.from('   \n\n\t  '), 'text/plain'))
      .rejects.toThrow(ExtractionError);
    await expect(extractTextFromFile(Buffer.from('   \n\n\t  '), 'text/plain'))
      .rejects.toMatchObject({ statusCode: 422 });
  });

  it('rejects binary file disguised as text (null bytes) with 400', async () => {
    const binaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x00, 0x6f]); // "Hell\0o"
    await expect(extractTextFromFile(binaryData, 'text/plain'))
      .rejects.toThrow('Binary file rejected');
    await expect(extractTextFromFile(binaryData, 'text/plain'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects malformed PDF missing %PDF header with 400', async () => {
    const invalidPdf = Buffer.from('Not a real PDF file header');
    await expect(extractTextFromFile(invalidPdf, 'application/pdf'))
      .rejects.toThrow('Missing %PDF magic header');
    await expect(extractTextFromFile(invalidPdf, 'application/pdf'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects malformed DOCX missing PK magic bytes with 400', async () => {
    const invalidDocx = Buffer.from('Not a real DOCX file header');
    await expect(extractTextFromFile(invalidDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
      .rejects.toThrow('missing ZIP container header');
    await expect(extractTextFromFile(invalidDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects unsupported MIME types with 400', async () => {
    await expect(extractTextFromFile(Buffer.from('some data'), 'image/png'))
      .rejects.toThrow('Unsupported document MIME type');
    await expect(extractTextFromFile(Buffer.from('some data'), 'application/zip'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects documents exceeding maximum character limit with 422', async () => {
    // Generate text slightly exceeding 500,000 characters
    const hugeText = 'A'.repeat(MAX_DOCUMENT_CHARACTERS + 100);
    await expect(extractTextFromFile(Buffer.from(hugeText), 'text/plain'))
      .rejects.toThrow('exceeds maximum allowable limit');
    await expect(extractTextFromFile(Buffer.from(hugeText), 'text/plain'))
      .rejects.toMatchObject({ statusCode: 422 });
  });
});
