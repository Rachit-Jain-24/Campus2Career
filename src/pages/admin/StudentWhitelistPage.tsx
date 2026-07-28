import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck, Plus, Trash2, RefreshCw, Upload,
  CheckCircle2, Search, AlertCircle, Download,
  RotateCcw, Users, Mail, Hash, FileSpreadsheet,
  Eye, X, ChevronDown, ChevronUp, Info
} from "lucide-react";
import * as XLSX from "xlsx";
import { whitelistService, type WhitelistEntry } from "../../services/admin/whitelist.service";
import { useAuth } from "../../contexts/AuthContext";

const BRANCHES = [
  "", "B.Tech CSDS", "B.Tech CSE", "B.Tech IT", "B.Tech CSBS",
  "B.Tech AIML", "MBATech CSE", "MBATech IT"
];

// Column aliases accepted from Excel headers (case-insensitive)
const COL_ALIASES: Record<string, string> = {
  email: "email", "e-mail": "email", "email id": "email", "email address": "email",
  "sap id": "sapId", sapid: "sapId", sap: "sapId", "sap no": "sapId",
  "full name": "fullName", name: "fullName", "student name": "fullName", fullname: "fullName",
  branch: "branch", department: "branch", dept: "branch", program: "branch",
  batch: "batch", "batch year": "batch", year: "batch",
  notes: "notes", note: "notes", remarks: "notes",
};

interface ParsedRow {
  email: string;
  sapId: string;
  fullName: string;
  branch: string;
  batch: string;
  notes: string;
  _rowNum: number;
  _valid: boolean;
  _error: string;
}

function normaliseHeader(h: string): string {
  return (COL_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase());
}

function parseSheetRows(sheet: XLSX.WorkSheet): ParsedRow[] {
  const raw: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (raw.length < 2) return [];

  const headers = (raw[0] as string[]).map(normaliseHeader);
  const rows: ParsedRow[] = [];

  for (let i = 1; i < raw.length; i++) {
    const cells = raw[i] as any[];
    const obj: any = {};
    headers.forEach((h, idx) => { obj[h] = String(cells[idx] ?? "").trim(); });

    const email = (obj.email || "").toLowerCase();
    const valid = !!email && email.includes("@");
    rows.push({
      email,
      sapId: obj.sapId || "",
      fullName: obj.fullName || "",
      branch: obj.branch || "",
      batch: obj.batch || "",
      notes: obj.notes || "",
      _rowNum: i + 1,
      _valid: valid,
      _error: valid ? "" : "Missing or invalid email",
    });
  }
  return rows.filter(r => r.email !== "");
}

export const StudentWhitelistPage: React.FC = () => {
  const { user } = useAuth();
  const adminEmail = user?.email || "admin";

  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "registered">("all");

  // Panel state: "none" | "single" | "excel"
  const [activePanel, setActivePanel] = useState<"none" | "single" | "excel">("none");

  // Single add form
  const [form, setForm] = useState({ email: "", sapId: "", fullName: "", branch: "", batch: "", notes: "" });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Excel upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await whitelistService.getAll();
      setEntries(data);
    } catch (err: any) {
      setError(err.message || "Failed to load whitelist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  // ── Single add ────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.email.trim() || !form.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setIsSaving(true);
    try {
      await whitelistService.addEntry(form, adminEmail);
      setForm({ email: "", sapId: "", fullName: "", branch: "", batch: "", notes: "" });
      setActivePanel("none");
      flash(`${form.email} added to whitelist.`);
      await load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Excel / CSV parse ─────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportResult(null);
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = parseSheetRows(sheet);
        setParsedRows(rows);
        setShowPreview(true);
      } catch {
        setError("Could not parse the file. Make sure it is a valid .xlsx, .xls, or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const validRows = parsedRows.filter(r => r._valid);
  const invalidRows = parsedRows.filter(r => !r._valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsImporting(true);
    setImportResult(null);
    let added = 0, skipped = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      try {
        await whitelistService.addEntry(
          { email: row.email, sapId: row.sapId, fullName: row.fullName, branch: row.branch, batch: row.batch, notes: row.notes },
          adminEmail
        );
        added++;
      } catch (err: any) {
        if (err.message?.includes("already in the whitelist")) skipped++;
        else errors.push(`Row ${row._rowNum} (${row.email}): ${err.message}`);
      }
    }

    setImportResult({ added, skipped, errors });
    flash(`Import done: ${added} added, ${skipped} skipped.`);
    await load();
    setIsImporting(false);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["email", "sap_id", "full_name", "branch", "batch", "notes"],
      ["student1@nmims.edu.in", "70572200001", "Rahul Sharma", "B.Tech CSDS", "2022-2026", ""],
      ["student2@nmims.edu.in", "70572200002", "Priya Patel", "B.Tech AIML", "2022-2026", ""],
    ]);
    ws["!cols"] = [{ wch: 30 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_whitelist_template.xlsx");
  };

  // ── Delete / Reset ────────────────────────────────────────────────────────
  const handleDelete = async (entry: WhitelistEntry) => {
    if (!confirm(`Remove ${entry.email} from the whitelist?`)) return;
    try {
      await whitelistService.deleteEntry(entry.id);
      flash(`${entry.email} removed.`);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  const handleResetUsed = async (entry: WhitelistEntry) => {
    if (!confirm(`Reset "${entry.email}" so they can register again?`)) return;
    try {
      await whitelistService.resetUsed(entry.id);
      flash(`${entry.email} reset — they can register again.`);
      await load();
    } catch (err: any) { setError(err.message); }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ["Email", "SAP ID", "Full Name", "Branch", "Batch", "Added By", "Added At", "Registered"],
      ...entries.map(e => [
        e.email, e.sapId || "", e.fullName || "", e.branch || "",
        e.batch || "", e.addedBy,
        new Date(e.addedAt).toLocaleDateString(),
        e.isUsed ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_whitelist_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      e.email.toLowerCase().includes(q) ||
      (e.sapId || "").toLowerCase().includes(q) ||
      (e.fullName || "").toLowerCase().includes(q) ||
      (e.branch || "").toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "registered" && e.isUsed) ||
      (filterStatus === "pending" && !e.isUsed);
    return matchSearch && matchStatus;
  });

  const total = entries.length;
  const registered = entries.filter(e => e.isUsed).length;
  const pending = total - registered;

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            Student Registration Whitelist
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Only students whose email is listed here can create an account on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} disabled={entries.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={load} disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Whitelisted", value: total, icon: Users, color: "text-slate-700 bg-slate-50 border-slate-200" },
          { label: "Registered", value: registered, icon: CheckCircle2, color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Pending", value: pending, icon: Mail, color: "text-amber-700 bg-amber-50 border-amber-200" },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-4 p-4 rounded-xl border ${s.color}`}>
            <s.icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActivePanel(activePanel === "single" ? "none" : "single")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors shadow-sm ${
            activePanel === "single"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          <Plus className="w-4 h-4" /> Add Single Student
        </button>
        <button
          onClick={() => { setActivePanel(activePanel === "excel" ? "none" : "excel"); setImportResult(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-colors shadow-sm ${
            activePanel === "excel"
              ? "bg-slate-800/10 text-slate-800 border border-slate-300"
              : "bg-slate-800 text-white hover:bg-slate-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Upload Excel / CSV
        </button>
      </div>

      {/* ── Single Add Form ── */}
      {activePanel === "single" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Add Single Student</h3>
            <button onClick={() => setActivePanel("none")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required placeholder="student@nmims.edu.in"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">SAP ID</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="70572200001"
                    value={form.sapId} onChange={e => setForm(p => ({ ...p, sapId: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input type="text" placeholder="Student full name"
                  value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all">
                  {BRANCHES.map(b => <option key={b} value={b}>{b || "Select branch"}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</label>
                <input type="text" placeholder="e.g. 2022-2026"
                  value={form.batch} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                <input type="text" placeholder="Optional notes"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {formError}
              </p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSaving ? "Adding…" : "Add to Whitelist"}
              </button>
              <button type="button" onClick={() => setActivePanel("none")}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Excel Upload Panel ── */}
      {activePanel === "excel" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Upload Excel / CSV</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files.
                First row must be headers.
              </p>
            </div>
            <button onClick={() => setActivePanel("none")} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Column guide */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-bold">Accepted column headers (case-insensitive):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5 font-mono">
                <span>email <span className="text-blue-400 font-sans font-normal">*required</span></span>
                <span>sap_id / sap id</span>
                <span>full_name / name</span>
                <span>branch / department</span>
                <span>batch / year</span>
                <span>notes / remarks</span>
              </div>
              <p className="text-blue-500 font-sans">Column order does not matter — headers are matched by name.</p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <FileSpreadsheet className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            {fileName ? (
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{fileName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{parsedRows.length} rows detected — click to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-0.5">.xlsx, .xls, .csv — max 5 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Download template */}
          <button onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
            <Download className="w-3.5 h-3.5" /> Download sample template (.xlsx)
          </button>

          {/* Preview table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">
                    Preview — {parsedRows.length} rows
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      {invalidRows.length} invalid
                    </span>
                  )}
                  <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    {validRows.length} valid
                  </span>
                </div>
                <button onClick={() => setShowPreview(v => !v)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                  {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showPreview ? "Hide" : "Show"} preview
                </button>
              </div>

              {showPreview && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-3 py-2 w-8">#</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">SAP ID</th>
                          <th className="px-3 py-2">Full Name</th>
                          <th className="px-3 py-2">Branch</th>
                          <th className="px-3 py-2">Batch</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {parsedRows.map(row => (
                          <tr key={row._rowNum} className={row._valid ? "hover:bg-slate-50/50" : "bg-red-50/50"}>
                            <td className="px-3 py-2 text-slate-400 font-mono">{row._rowNum}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">{row.email || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="px-3 py-2 text-slate-500 font-mono">{row.sapId || "—"}</td>
                            <td className="px-3 py-2 text-slate-600">{row.fullName || "—"}</td>
                            <td className="px-3 py-2 text-slate-500">{row.branch || "—"}</td>
                            <td className="px-3 py-2 text-slate-500">{row.batch || "—"}</td>
                            <td className="px-3 py-2">
                              {row._valid ? (
                                <span className="text-green-600 font-bold">✓ OK</span>
                              ) : (
                                <span className="text-red-500 font-bold" title={row._error}>✗ {row._error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import result */}
              {importResult && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-green-700 font-bold text-sm">✓ {importResult.added} students added</p>
                  {importResult.skipped > 0 && (
                    <p className="text-amber-600 text-sm">⚠ {importResult.skipped} skipped (already whitelisted)</p>
                  )}
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-red-600 text-xs">✗ {e}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={isImporting || validRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {isImporting
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Importing…</>
                    : <><Upload className="w-4 h-4" /> Import {validRows.length} Student{validRows.length !== 1 ? "s" : ""}</>
                  }
                </button>
                <button
                  onClick={() => { setParsedRows([]); setFileName(""); setImportResult(null); }}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email, SAP ID, name, or branch…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-primary shadow-sm transition-all"
          />
        </div>
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
          {(["all", "pending", "registered"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filterStatus === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-3 border border-dashed border-slate-200 rounded-2xl">
          <ShieldCheck className="w-10 h-10 opacity-30" />
          <p className="text-sm font-medium">
            {search || filterStatus !== "all" ? "No entries match your filters." : "No students whitelisted yet. Add some above."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SAP ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Branch / Batch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{entry.email}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{entry.sapId || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.fullName || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {entry.branch || "—"}
                      {entry.batch && <span className="ml-1 text-slate-400">· {entry.batch}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {entry.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-200">
                          <Mail className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[120px]">{entry.addedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {entry.isUsed && (
                          <button onClick={() => handleResetUsed(entry)} title="Allow re-registration"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(entry)} title="Remove from whitelist"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {total} entries
          </div>
        </div>
      )}
    </div>
  );
};
