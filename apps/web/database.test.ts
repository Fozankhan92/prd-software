import { describe, expect, it } from 'vitest';
import { foundationMigrations, pendingMigrations } from './database';

describe('pendingMigrations', () => {
  it('returns all migrations for a fresh store', () => {
    expect(pendingMigrations({ schemaVersion: 0, appliedAt: [] })).toEqual(foundationMigrations);
  });

  it('returns only migrations newer than the current schema', () => {
    expect(pendingMigrations({ schemaVersion: 1, appliedAt: ['2026-01-01T00:00:00.000Z'] }).map((migration) => migration.version)).toEqual([2]);
  });

  it('returns none for an up-to-date store', () => {
    expect(pendingMigrations({ schemaVersion: 2, appliedAt: ['a', 'b'] })).toEqual([]);
  });
});
