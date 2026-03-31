import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { syllabusDb } from "../db/database.service";

export interface SyllabusRecord {
  downloadUrl: string;
  semester: number;
  uploadedAt: string;
  fileName: string;
}

/**
 * Uploads a syllabus PDF to Firebase Storage and writes metadata to the active database.
 * Requirements: 3.1, 3.2, 3.5
 */
export async function uploadSyllabusPDF(
  sapId: string,
  semester: number,
  file: File,
  onProgress?: (pct: number) => void
): Promise<SyllabusRecord> {
  const storagePath = `syllabi/${sapId}/semester_${semester}.pdf`;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(pct);
      },
      reject,
      resolve
    );
  });

  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
  const uploadedAt = new Date().toISOString();

  const record: SyllabusRecord = {
    downloadUrl,
    semester,
    uploadedAt,
    fileName: file.name,
  };

  // Use the database-agnostic service layer
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
