"use client";

import React, { useEffect, useState } from "react";
import { useNotificationTemplateStore, NotificationTemplateData } from "@/store/notificationTemplateStore";
import { apiCall } from "@/lib/apiClient";

export default function AdminNotificationTemplatesPage() {
  const {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    clearError,
  } = useNotificationTemplateStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplateId(null);
    setName("");
    setTitle("");
    setContent("");
    setFormError(null);
    setFormSuccess(false);
    clearError();
  };

  const handleCreateClick = () => {
    handleCloseModal();
    setIsModalOpen(true);
  };

  const handleEditClick = (tpl: NotificationTemplateData) => {
    setEditingTemplateId(tpl.id || tpl._id || null);
    setName(tpl.name);
    setTitle(tpl.title);
    setContent(tpl.content);
    setFormError(null);
    setFormSuccess(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ id });
  };

  const proceedDeleteTemplate = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      const res = await deleteTemplate(id);
      if (!res.success) showToast(res.error || "Failed to delete template.");
    } catch (err: any) {
      showToast(err.message || "Failed to delete template.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!name || !title || !content) {
      setFormError("Please fill out all required parameters.");
      return;
    }

    setIsSubmitting(true);
    const payload: NotificationTemplateData = {
      name: name.trim(),
      title: title.trim(),
      content: content.trim(),
    };

    let result;
    if (editingTemplateId) {
      result = await updateTemplate(editingTemplateId, payload);
    } else {
      result = await createTemplate(payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setFormSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } else {
      setFormError(result.error || `Failed to ${editingTemplateId ? "update" : "create"} template.`);
    }
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 w-full text-left min-h-screen pb-32 animate-fade-in">

      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 bg-[#10141a]/95 border-red-500/50 text-red-500">
          ✗ {toastMsg}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Template</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you sure you want to delete this notification template? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={proceedDeleteTemplate} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white">
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Notification Templates
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Draft, customize, and configure live system notification alert templates.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-[#e4c126] text-neutral-900 px-5 py-3 rounded text-xs font-black uppercase tracking-wider hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#e4c126]/10"
        >
          <svg className="w-4 h-4 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Template
        </button>
      </div>

      {/* Tabulated Template Register List */}
      {isLoading && templates.length === 0 ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading templates...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 flex items-center justify-between">
          <span className="text-xs text-red-400 font-bold">{error}</span>
          <button
            onClick={fetchTemplates}
            className="text-[10px] bg-red-500/20 text-red-300 font-bold px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors"
          >
            Retry Query
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="py-24 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-neutral-500 gap-3">
          <svg className="w-10 h-10 opacity-30 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">No Notification Templates Configured</span>
          <p className="text-[11px] text-neutral-500 max-w-sm text-center">
            Create templates that can be dispatched dynamically upon user activities.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden bg-[#13151a]/30 border border-neutral-800/40 rounded-lg shadow-md">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">System Identifier Name</th>
                  <th className="py-4 px-6">Subject / Title</th>
                  <th className="py-4 px-6">Body Content Preview</th>
                  <th className="py-4 px-6">Date Deployed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {templates.map((tpl) => (
                  <tr
                    key={tpl.id || tpl._id}
                    className="hover:bg-neutral-800/20 transition-colors group text-[14px] font-medium text-neutral-300"
                  >
                    {/* Identifier Name (No capitalization transform, exactly as created) */}
                    <td className="py-4 px-6 text-[14px]">
                      <span className="bg-[#e4c126]/10 border border-[#e4c126]/20 text-[#e4c126] text-[13px] font-black px-2.5 py-1 rounded inline-block">
                        {tpl.name}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-6 font-bold text-white group-hover:text-[#e4c126] transition-colors max-w-xs truncate text-[14px]">
                      {tpl.title}
                    </td>

                    {/* Content Preview */}
                    <td className="py-4 px-6 text-neutral-400 max-w-md truncate font-semibold leading-relaxed text-[14px]">
                      {tpl.content}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-neutral-500 text-[14px]">
                      {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "System Default"}
                    </td>

                    {/* Actions with premium icons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-2.5 justify-end">
                        <button
                          onClick={() => handleEditClick(tpl)}
                          title="Edit Template"
                          className="p-2 rounded bg-neutral-900 hover:bg-[#e4c126]/10 border border-neutral-800 hover:border-[#e4c126]/30 text-neutral-400 hover:text-[#e4c126] transition-all cursor-pointer"
                        >
                          <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tpl.id || tpl._id || "")}
                          title="Delete Template"
                          className="p-2 rounded bg-red-950/10 hover:bg-red-950/30 border border-red-900/20 hover:border-red-900/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                        >
                          <svg className="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-lg w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#13151a]">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-white">
                  {editingTemplateId ? "Modify Notification Template" : "Compose Notification Template"}
                </h2>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  Configure alert parameters and system variables
                </span>
              </div>
              <button onClick={handleCloseModal} className="text-neutral-400 hover:text-white cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-4 text-xs text-red-400 font-bold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded p-4 text-xs text-green-400 font-bold">
                  ✓ Template saved successfully! Refreshed directory...
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">System Identifier Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="e.g. deposit_approval"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Subject Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="e.g. Deposit Transferred Successfully"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Content Body *</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] resize-none"
                  placeholder="Draft the body content. Supports dynamic context tags."
                />
              </div>

              <div className="border-t border-neutral-800 pt-5 flex justify-end gap-3 bg-[#0f1115]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded text-xs font-extrabold uppercase tracking-wider bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-950 border-t-transparent animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingTemplateId ? "Save Changes" : "Deploy Template"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
