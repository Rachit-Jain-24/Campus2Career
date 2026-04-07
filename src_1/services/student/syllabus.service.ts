import { supabase } from "../../lib/supabase";
import { syllabusDb } from "../db/database.service";

export interface SyllabusRecord {
  downloadUrl: string;
  semester: number;
  uploadedAt: string;
  fileName: string;
}

/**
 * Uploads a syllabus PDF to Supabase Storage and writes metadata to the database.
 * Requirements: 3.1, 3.2, 3.5
 */
export async function uploadSyllabusPDF(
  sapId: string,
  semester: number,
  file: File,
  onProgress?: (pct: number) => void
): Promise<SyllabusRecord> {
  const storagePath = `syllabi/${sapId}/semester_${semester}.pdf`;
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('syllabi')
    .upload(storagePath, file, {
      upsert: true,
      contentType: 'application/pdf'
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Simulate progress (Supabase doesn't have built-in progress tracking like Firebase)
  onProgress?.(50);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('syllabi')
    .getPublicUrl(storagePath);

  onProgress?.(100);

  const uploadedAt = new Date().toISOString();

  const record: SyllabusRecord = {
    downloadUrl: publicUrl,
    semester,
    uploadedAt,
    fileName: file.name,
  };

  // Save metadata to database
  await syllabusDb.saveSyllabusRecord(sapId, semester, record);

  return record;
}

/**
 * Reads a syllabus record from the active database.
 * Returns null if no record exists for the given sapId and semester.
 * Requirements: 3.3
 */
export async function getSyllabusRecord(
  sapId: string,
  semester: number
): Promise<SyllabusRecord | null> {
  return await syllabusDb.getSyllabusRecord(sapId, semester);
}
