import { supabase } from '../../lib/supabase';

export interface WhitelistEntry {
  id: string;
  email: string;
  sapId?: string;
  fullName?: string;
  branch?: string;
  batch?: string;
  addedBy: string;
  addedAt: string;
  isUsed: boolean;
  usedAt?: string;
  notes?: string;
}

const mapRow = (r: any): WhitelistEntry => ({
  id: r.id,
  email: r.email,
  sapId: r.sap_id || '',
  fullName: r.full_name || '',
  branch: r.branch || '',
  batch: r.batch || '',
  addedBy: r.added_by,
  addedAt: r.added_at,
  isUsed: r.is_used === true,
  usedAt: r.used_at || '',
  notes: r.notes || '',
});

export const whitelistService = {
  async getAll(): Promise<WhitelistEntry[]> {
    const { data, error } = await supabase
      .from('student_whitelist')
      .select('*')
      .order('added_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  async addEntry(entry: Omit<WhitelistEntry, 'id' | 'addedAt' | 'isUsed' | 'usedAt'>, adminEmail: string): Promise<void> {
    const { error } = await supabase
      .from('student_whitelist')
      .insert({
        email: entry.email.trim().toLowerCase(),
        sap_id: entry.sapId?.trim() || null,
        full_name: entry.fullName?.trim() || null,
        branch: entry.branch?.trim() || null,
        batch: entry.batch?.trim() || null,
        added_by: adminEmail,
        notes: entry.notes?.trim() || null,
      });
    if (error) {
      if (error.code === '23505') throw new Error(`Email "${entry.email}" is already in the whitelist.`);
      throw error;
    }
  },

  // Bulk add from CSV-style text (one email per line, or email,sapId,name)
  async bulkAdd(rawText: string, adminEmail: string): Promise<{ added: number; skipped: number; errors: string[] }> {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      const email = parts[0]?.toLowerCase();
      if (!email || !email.includes('@')) {
        errors.push(`Skipped invalid line: "${line}"`);
        skipped++;
        continue;
      }
      try {
        await supabase.from('student_whitelist').insert({
          email,
          sap_id: parts[1] || null,
          full_name: parts[2] || null,
          branch: parts[3] || null,
          batch: parts[4] || null,
          added_by: adminEmail,
        });
        added++;
      } catch (err: any) {
        if (err.code === '23505') {
          skipped++;
        } else {
          errors.push(`Failed for "${email}": ${err.message}`);
        }
      }
    }
    return { added, skipped, errors };
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('student_whitelist')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async resetUsed(id: string): Promise<void> {
    const { error } = await supabase
      .from('student_whitelist')
      .update({ is_used: false, used_at: null })
      .eq('id', id);
    if (error) throw error;
  },
};
