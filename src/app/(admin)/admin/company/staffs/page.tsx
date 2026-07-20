"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiCall } from "@/lib/apiClient";

interface StaffMember {
  _id: string;
  name: string;
  position: string;
  description: string;
  picture: string;
  createdAt: string;
}

const emptyForm = { name: "", position: "", description: "", picture: "" };

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiCall<{ success: boolean; staff: StaffMember[] }>("/api/staff");
      setStaff(res.staff || []);
    } catch {
      showToast("Failed to load staff.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditTarget(member);
    setForm({
      name: member.name,
      position: member.position,
      description: member.description,
      picture: member.picture,
    });
    setImageFile(null);
    setImagePreview(member.picture || "");
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.picture;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      return data.url || form.picture;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim() || !form.description.trim()) {
      return showToast("Name, position, and description are required.", "error");
    }
    setSubmitting(true);
    try {
      const pictureUrl = await uploadImage();
      const payload = { ...form, picture: pictureUrl };

      if (editTarget) {
        const res = await apiCall<{ success: boolean; staff: StaffMember }>(`/api/staff/${editTarget._id}`, {
          method: "PUT",
          body: payload,
        });
        setStaff((prev) => prev.map((s) => (s._id === editTarget._id ? res.staff : s)));
        showToast("Staff member updated.");
      } else {
        const res = await apiCall<{ success: boolean; staff: StaffMember }>("/api/staff", {
          method: "POST",
          body: payload,
        });
        setStaff((prev) => [res.staff, ...prev]);
        showToast("Staff member created.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save staff member.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiCall(`/api/staff/${deleteTarget._id}`, { method: "DELETE" });
      setStaff((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      showToast("Staff member deleted.");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-6 w-full min-h-screen">

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-bold flex items-center gap-2 ${
          toastType === "success" ? "bg-[#10141a]/95 border-[#528574] text-[#528574]" : "bg-[#10141a]/95 border-red-500/50 text-red-500"
        }`}>
          {toastType === "success" ? "✓" : "✗"} {toastMsg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Staff</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">{deleteTarget.name}</span>? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 flex-shrink-0">
              <h3 className="text-base font-black text-white">{editTarget ? "Edit Staff Member" : "Add Staff Member"}</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-6 overflow-y-auto flex-1 min-h-0">
              {/* Picture upload */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-neutral-600 fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white rounded transition-colors cursor-pointer"
                    >
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    <span className="text-[10px] text-neutral-600">JPG, PNG or WebP</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="e.g. John Carter"
                />
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Position / Title *</label>
                <input
                  type="text"
                  required
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="e.g. Chief Investment Officer"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 px-4 py-2.5 rounded text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] resize-none"
                  placeholder="Brief bio or role description..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-3 bg-[#e4c126] hover:bg-[#d8b520] disabled:bg-neutral-700 disabled:cursor-not-allowed text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {(submitting || uploading) && <div className="w-3.5 h-3.5 border-2 border-neutral-900/40 border-t-neutral-900 rounded-full animate-spin" />}
                {uploading ? "Uploading..." : submitting ? "Saving..." : editTarget ? "Save Changes" : "Add Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">Staff Members</h1>
          <p className="text-xs text-neutral-400 font-medium">Manage the team members shown on the platform.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#e4c126] hover:bg-[#d8b520] text-neutral-900 text-xs font-black uppercase tracking-wider rounded transition-colors cursor-pointer self-start"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-0">
        <div className="bg-[#13151a]/30 border border-neutral-800/40 rounded-lg overflow-x-auto w-full">
          {loading ? (
            <div className="py-20 flex flex-col gap-3 items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading staff...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-3">
              <svg className="w-10 h-10 opacity-30 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="text-sm font-bold">No staff members yet.</span>
              <button onClick={openCreate} className="mt-1 px-4 py-2 bg-[#e4c126] hover:bg-[#d8b520] text-neutral-900 text-xs font-black uppercase tracking-wider rounded transition-colors cursor-pointer">
                Add First Staff Member
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 text-sm text-neutral-400 font-semibold">
                  <th className="px-6 py-4">S/N</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40 text-sm">
                {staff.map((member, index) => (
                  <tr key={member._id} className="hover:bg-neutral-800/10 transition-colors">
                    <td className="px-6 py-4 text-neutral-500 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-neutral-700 bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {member.picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.picture} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-black text-neutral-500">{member.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-extrabold text-white">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#e4c126] font-bold">{member.position}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 max-w-xs">
                      <p className="line-clamp-2 leading-relaxed">{member.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-4 items-center justify-end">
                        <button
                          onClick={() => openEdit(member)}
                          title="Edit"
                          className="text-neutral-400 hover:text-[#e4c126] transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          title="Delete"
                          className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
