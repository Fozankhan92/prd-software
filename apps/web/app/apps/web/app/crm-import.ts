import { createWebRecord, type WebCrmRecord } from './web-store';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseDelimited(text: string): Array<Record<string, string>> {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const split = (line: string) => line.match(/("(?:[^"]|"")*"|[^,\t]+)/g)?.map((cell) => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const values = split(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

export function importCrmText(text: string, format: 'csv' | 'tsv' | 'json'): WebCrmRecord[] {
  const rows: Array<Record<string, unknown>> = format === 'json' ? JSON.parse(text) : parseDelimited(text.replace(/\t/g, format === 'tsv' ? ',' : '\t'));
  return rows.map((row) => {
    const values = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalize(key), String(value ?? '').trim()]));
    const kind = (values.type || values.recordtype || values.kind || 'contact') as WebCrmRecord['kind'];
    const name = values.name || values.recordname || values.contact || values.customer || 'Imported CRM record';
    const status = values.status || values.stage || 'New';
    const relationships = [values.relatedrecord || values.relatedto || values.organization || values.account].filter(Boolean);
    const fields = { ...values, owner: values.owner || values.ownerteam || '', amount: values.amount || values.expectedvalue || '', followUpDate: values.followupdate || values.date || '', relatedRecord: relationships[0] || '' };
    const detail = values.details || values.notes || values.description || `Imported from ${format.toUpperCase()}`;
    return createWebRecord(kind, name, detail, status, fields, relationships);
  });
}
