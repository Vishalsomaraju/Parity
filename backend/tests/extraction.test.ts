import { extractTextFromFile } from '../src/services/extraction/textExtractor';

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

  it('handles simulated docx or binary fallback gracefully', async () => {
    const fallbackBuffer = Buffer.from('Mock content simulating binary document stream');
    const data = await extractTextFromFile(fallbackBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    expect(data.text).toBeDefined();
    expect(data.pageCount).toBeGreaterThanOrEqual(1);
  });
});
