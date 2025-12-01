// src/lib/table-context.ts
import { cookies } from 'next/headers';
import 'server-only';

export async function getTableIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get('table_ctx')?.value;
  if (!raw) return null;
  try {
    const { tableId } = JSON.parse(raw);
    return typeof tableId === 'string' ? tableId : null;
  } catch {
    return null;
  }
}
