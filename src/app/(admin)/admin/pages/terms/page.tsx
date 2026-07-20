"use client";

import React, { useEffect, useState } from "react";
import { useTermStore, TermData } from "@/store/termStore";

const emptyForm: TermData = { category: "terms", content: "" };

const CATEGORY_LABELS: Record<string, string> = {
  terms: "Terms & Conditions",
  policy: "Privacy Policy",
};

export default function AdminTermsPage() {
  const { terms, isLoading, fetchTerms, createTerm, updateTerm, deleteTerm } = useTermStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TermData | null>(null);
  const [form, setForm] = useState<TermData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TermData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg); setToastType(type);
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => { fetchTerms(); }, []);

  const openCreate = () => {
    setEditTarget(null); setForm(emptyForm); setFormError(null); setModalOpen(true);
  };
  const openEdit = (term: TermData) => {
    setEditTarget(term);
    setForm({ category: term.category, content: term.content });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.content) return setFormError("All fields are required.");
    setSubmitting(true); setFormError(null);
    const res = editTarget?._id
      ? await updateTerm(editTarget._id, form)
      : await createTerm(form);
    setSubmitting(false);
    if (res.success) {
      showToast(editTarget ? "Term updated." : "Term created.");
      setModalOpen(false);
    } else {
      setFormError(res.error || "Failed to save.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    const res = await deleteTerm(deleteTarget._id);
    setDeleting(false);
    if (res.success) showToast("Term deleted."); else showToast(res.error || "Failed to delete.", "error");
    setDeleteTarget(null);
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 w-full min-h-screen">

      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[9999] px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 ${toastType === "success" ? "bg-[#10141a]/95 border-[#528574] text-[#528574]" : "bg-[#10141a]/95 border-red-500/50 text-red-500"}`}>
          {toastType === "success" ? "✓" : "✗"} {toastMsg}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Term</h4>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">Delete this entry? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 text-xs font-bold uppercase cursor-pointer">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-5 py-2 rounded text-xs font-black uppercase cursor-pointer bg-red-600 hover:bg-red-500 text-white disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 flex-shrink-0">
              <h3 className="text-base font-black text-white">{editTarget ? "Edit Term" : "Add Term"}</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6 overflow-y-auto">
              {formError && <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-xs text-red-400 font-bold">{formError}</div>}

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as "terms" | "policy" }))}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded text-sm text-white focus:outline-none focus:border-[#e4c126]"
                >
                  <option value="terms">Terms &amp; Conditions</option>
                  <option value="policy">Privacy Policy</option>
                </select>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">Content *</label>
                <textarea
                  required
                  rows={12}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] resize-y"
                  placeholder="Enter the full text content for this section..."
                />
              </div>

              <button type="submit" disabled={submitting} className="w-full py-3 bg-[#e4c126] hover:bg-[#d8b520] disabled:bg-neutral-700 disabled:cursor-not-allowed text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer">
                {submitting ? "Saving..." : editTarget ? "Save Changes" : "Add Term"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Terms &amp; Policies</h1>
          <p className="text-xs text-neutral-400 font-medium">Manage the Terms &amp; Conditions and Privacy Policy content shown on the site.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#e4c126] text-neutral-900 px-5 py-3 rounded text-xs font-black uppercase tracking-wider hover:bg-[#c9a71b] transition-colors cursor-pointer self-start">
          <svg className="w-4 h-4 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Term
        </button>
      </div>

      {/* Table */}
      {isLoading && terms.length === 0 ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading terms...</span>
        </div>
      ) : terms.length === 0 ? (
        <div className="py-24 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-neutral-500 gap-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">No terms yet</span>
          <button onClick={openCreate} className="mt-2 px-4 py-2 bg-[#e4c126] hover:bg-[#d8b520] text-neutral-900 text-xs font-black uppercase tracking-wider rounded cursor-pointer">Add First Term</button>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-[#13151a]/30 border border-neutral-800/40 rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6 w-44">Category</th>
                  <th className="py-4 px-6">Content Preview</th>
                  <th className="py-4 px-6 w-40">Added</th>
                  <th className="py-4 px-6 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {terms.map((term) => (
                  <tr key={term._id} className="hover:bg-neutral-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded whitespace-nowrap ${
                        term.category === "terms"
                          ? "bg-[#e4c126]/10 border border-[#e4c126]/20 text-[#e4c126]"
                          : "bg-[#528574]/10 border border-[#528574]/20 text-[#528574]"
                      }`}>
                        {CATEGORY_LABELS[term.category] ?? term.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-400 text-sm max-w-md">
                      <span className="line-clamp-2">{term.content}</span>
                    </td>
                    <td className="py-4 px-6 text-neutral-500 text-xs font-mono whitespace-nowrap">
                      {term.createdAt ? new Date(term.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2.5 justify-end">
                        <button onClick={() => openEdit(term)} title="Edit" className="p-2 rounded bg-neutral-900 hover:bg-[#e4c126]/10 border border-neutral-800 hover:border-[#e4c126]/30 text-neutral-400 hover:text-[#e4c126] transition-all cursor-pointer">
                          <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(term)} title="Delete" className="p-2 rounded bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 text-red-400 hover:text-red-300 transition-all cursor-pointer">
                          <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-neutral-800/40 text-[11px] text-neutral-500 font-bold">
            {terms.length} entr{terms.length !== 1 ? "ies" : "y"}
          </div>
        </div>
      )}
    </div>
  );
}
