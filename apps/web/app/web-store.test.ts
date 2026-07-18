import { describe, expect, it } from 'vitest';
import { bulkUpdateWebRecords, createWebRecord, duplicateWebRecord, mergeWebRecords } from './web-store';
import { importCrmText } from './crm-import';

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

  it('duplicates a record without sharing identity and preserves structured data', () => {
    const original = createWebRecord('customer', 'North region account', 'Account notes', 'Active', { owner: 'Sales team', amount: '45000' }, ['North region renewal']);
    const copy = duplicateWebRecord(original);

    expect(copy.id).not.toBe(original.id);
    expect(copy.name).toBe('North region account (Copy)');
    expect(copy.fields).toEqual(original.fields);
    expect(copy.relationships).toEqual(original.relationships);
    expect(copy.history?.at(-1)).toMatchObject({ action: 'Duplicated' });
  });

  it('bulk updates selected records and merges duplicate relationships safely', () => {
    const primary = createWebRecord('customer', 'Account', '', 'Active', { owner: 'Team A' }, ['Org']);
    const duplicate = createWebRecord('customer', 'Account copy', '', 'Active', { segment: 'Enterprise' }, ['Contact']);
    const updated = bulkUpdateWebRecords([primary, duplicate], [primary.id], { status: 'Needs attention' });
    const merged = mergeWebRecords(updated[0], duplicate);

    expect(updated[0].status).toBe('Needs attention');
    expect(merged.fields).toMatchObject({ owner: 'Team A', segment: 'Enterprise' });
    expect(merged.relationships).toEqual(['Org', 'Contact']);
    expect(merged.history?.at(-1)).toMatchObject({ action: 'Merged' });
  });

  it('imports structured CRM rows with relationships and searchable fields', () => {
    const records = importCrmText('Type,Name,Status,Owner,Amount,Related to\nopportunity,Renewal,Qualification,Sales team,45000,North account', 'csv');
    expect(records[0]).toMatchObject({ kind: 'opportunity', name: 'Renewal', status: 'Qualification' });
    expect(records[0].fields?.amount).toBe('45000');
    expect(records[0].relationships).toEqual(['North account']);
  });
});
