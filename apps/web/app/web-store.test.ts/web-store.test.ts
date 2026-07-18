import { describe, expect, it } from 'vitest';
import { createWebRecord } from './web-store';

describe('structured CRM records', () => {
  it('keeps searchable fields, relationships, and an initial audit event', () => {
    const record = createWebRecord('opportunity', 'North region renewal', 'Legacy detail', 'Qualification', {
      amount: '45000',
      probability: '60',
      closeDate: '2026-10-31',
      owner: 'Sales team',
    }, ['North region account']);

    expect(record.fields?.amount).toBe('45000');
    expect(record.relationships).toEqual(['North region account']);
    expect(record.history?.[0]).toMatchObject({ action: 'Created', summary: 'opportunity created' });
  });
});
