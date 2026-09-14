import { query, loadBenchmarkSeeds, closePool, isDegradedMode } from './connection';

export async function seedBenchmarks(): Promise<void> {
  console.log('[DB] Seeding benchmark corpus...');
  const seeds = loadBenchmarkSeeds();

  if (isDegradedMode()) {
    console.log(`[DB] Degraded session mode: ${seeds.length} benchmarks active in memory.`);
    return;
  }

  try {
    for (let i = 0; i < seeds.length; i++) {
      const b = seeds[i];
      const id = `benchmark-${b.documentType}-${i + 1}`;
      await query(
        `INSERT INTO benchmark_clauses (
          id, document_type, clause_type, reference_text, plain_language_meaning,
          common_risk_patterns, source_attribution
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          reference_text = EXCLUDED.reference_text,
          plain_language_meaning = EXCLUDED.plain_language_meaning,
          common_risk_patterns = EXCLUDED.common_risk_patterns,
          source_attribution = EXCLUDED.source_attribution`,
        [
          id,
          b.documentType,
          b.clauseType,
          b.referenceText,
          b.plainLanguageMeaning,
          JSON.stringify(b.commonRiskPatterns || []),
          b.sourceAttribution,
        ]
      );
    }
    console.log(`[DB] Successfully seeded ${seeds.length} benchmark clauses into database.`);
  } catch (err: any) {
    console.warn('[DB] Seeding note:', err.message);
  }
}

if (require.main === module) {
  seedBenchmarks()
    .catch((err) => console.error('[DB] Seeding error:', err))
    .finally(() => closePool());
}
