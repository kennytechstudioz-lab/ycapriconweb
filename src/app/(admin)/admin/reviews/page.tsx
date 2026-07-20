"use client";

import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/lib/apiClient";
import { countries } from "@/lib/countries";

interface AdminReview {
  _id: string;
  userId: string;
  fullName: string;
  content: string;
  rating: number;
  country?: string;
  countryFlag?: string;
  userPicture?: string;
  isApproved: boolean;
  createdAt: string;
}

const defaultForm = {
  fullName: "",
  content: "",
  rating: 5,
  country: "",
  countryFlag: "",
  userPicture: "",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Edit modal state
  const [editReview, setEditReview] = useState<AdminReview | null>(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editCountrySearch, setEditCountrySearch] = useState("");
  const [showEditCountryDropdown, setShowEditCountryDropdown] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editCountryDropdownRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiCall<{ success: boolean; reviews: AdminReview[] }>("/api/reviews/admin");
      if (response.success) setReviews(response.reviews || []);
    } catch (err: any) {
      showToast(err.message || "Failed to retrieve user reviews.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close edit country dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (editCountryDropdownRef.current && !editCountryDropdownRef.current.contains(e.target as Node)) {
        setShowEditCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const targetStatus = !currentStatus;
      const response = await apiCall<{ success: boolean; review: AdminReview }>(
        `/api/reviews/${id}/approve`,
        { method: "PATCH", body: { isApproved: targetStatus } }
      );
      if (response.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isApproved: targetStatus } : r))
        );
        showToast(`Review by ${response.review.fullName} is now ${targetStatus ? "approved & live" : "unapproved & hidden"}!`);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update review status.", "error");
    }
  };

  const handleDeleteReview = (id: string) => {
    setDeleteConfirm({ id });
  };

  const proceedDeleteReview = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      const response = await apiCall<{ success: boolean; message: string }>(`/api/reviews/${id}`, { method: "DELETE" });
      if (response.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
        showToast("Review deleted successfully.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete review.", "error");
    }
  };

  const openEditReview = (rev: AdminReview) => {
    setEditReview(rev);
    setEditForm({
      fullName: rev.fullName,
      content: rev.content,
      rating: rev.rating,
      country: rev.country || "",
      countryFlag: rev.countryFlag || "",
      userPicture: rev.userPicture || "",
    });
    setEditImagePreview(rev.userPicture || "");
    setEditImageFile(null);
    setEditCountrySearch("");
    setShowEditCountryDropdown(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReview) return;
    if (!editForm.fullName.trim()) return showToast("Reviewer name is required.", "error");
    if (!editForm.content.trim()) return showToast("Review content is required.", "error");

    setEditSubmitting(true);
    try {
      let pictureUrl = editForm.userPicture;
      if (editImageFile) {
        setEditUploading(true);
        const fd = new FormData();
        fd.append("file", editImageFile);
        const uploadRes = await apiCall<{ success: boolean; url: string }>("/api/upload", {
          method: "POST",
          body: fd,
        });
        pictureUrl = uploadRes.url;
        setEditUploading(false);
      }

      const response = await apiCall<{ success: boolean; review: AdminReview }>(`/api/reviews/${editReview._id}`, {
        method: "PUT",
        body: { ...editForm, userPicture: pictureUrl },
      });

      if (response.success) {
        setReviews((prev) => prev.map((r) => (r._id === editReview._id ? response.review : r)));
        showToast("Review updated successfully.");
        setEditReview(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update review.", "error");
    } finally {
      setEditSubmitting(false);
      setEditUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const selectCountry = (name: string, flag: string) => {
    setForm((f) => ({ ...f, country: name, countryFlag: flag }));
    setCountrySearch("");
    setShowCountryDropdown(false);
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return showToast("Reviewer name is required.", "error");
    if (!form.content.trim()) return showToast("Review content is required.", "error");

    setSubmitting(true);
    try {
      let pictureUrl = form.userPicture;

      // Upload image to S3 if a file was selected
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", imageFile);
        const uploadRes = await apiCall<{ success: boolean; url: string }>("/api/upload", {
          method: "POST",
          body: fd,
        });
        pictureUrl = uploadRes.url;
        setUploading(false);
      }

      const response = await apiCall<{ success: boolean; review: AdminReview }>("/api/reviews/admin", {
        method: "POST",
        body: { ...form, userPicture: pictureUrl },
      });

      if (response.success) {
        setReviews((prev) => [response.review, ...prev]);
        showToast("Review created and published successfully.");
        setShowCreate(false);
        setForm(defaultForm);
        setImageFile(null);
        setImagePreview("");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to create review.", "error");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      rev.fullName.toLowerCase().includes(q) ||
      rev.content.toLowerCase().includes(q) ||
      (rev.country && rev.country.toLowerCase().includes(q));
    const matchesRating = ratingFilter === "all" ? true : rev.rating === Number(ratingFilter);
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "approved" ? rev.isApproved : !rev.isApproved;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const FlagDisplay = ({ flag, country }: { flag?: string; country?: string }) => {
    if (!flag) return <span className="text-[10px] text-neutral-400">{country || "Unknown"}</span>;
    if (flag.startsWith("http")) {
      return <img src={flag} alt={country} className="w-5 h-3.5 object-cover rounded-sm inline-block" />;
    }
    return <span>{flag}</span>;
  };

  return (
    <div className="flex flex-col gap-6 w-full p-[10px] md:p-6 text-white min-h-screen">

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
          toastType === "success"
            ? "bg-[#10141a]/95 border-[#528574] text-[#528574]"
            : "bg-[#10141a]/95 border-red-500/50 text-red-500"
        }`}>
          {toastType === "success" ? "✓" : "✗"} {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-white">User Reviews Console</h1>
          <p className="text-xs text-neutral-400 font-light">
            Moderate, approve, and manage customer experiences published on the platform homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-neutral-900 border border-neutral-800 text-xs font-extrabold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#e4c126] hover:bg-[#d8b520] text-neutral-900 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Review
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0f1115] border border-neutral-900 p-4 rounded-lg">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Search Keywords</label>
          <input
            type="text"
            placeholder="Search by name, content, country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-xs w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Rating Score</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-xs w-full"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Approval Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-xs w-full"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved & Live</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-[#0f1115] border border-neutral-900 rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center items-center w-full">
            <div className="w-10 h-10 rounded-full border-2 border-neutral-800 border-t-[#e4c126] animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-24 text-center flex flex-col gap-2 items-center w-full">
            <span className="text-neutral-500 text-sm font-light">No user reviews match your filter parameters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-[#050608]/80 border-b border-neutral-900 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                  <th className="py-3.5 px-5">Reviewer</th>
                  <th className="py-3.5 px-5">Country</th>
                  <th className="py-3.5 px-5">Rating</th>
                  <th className="py-3.5 px-5">Content</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900/50">
                {filteredReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-neutral-900/20 transition-colors">

                    {/* Reviewer */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center flex-shrink-0">
                          {rev.userPicture ? (
                            <img src={rev.userPicture} alt={rev.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-white uppercase">
                              {rev.fullName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-extrabold text-white whitespace-nowrap">{rev.fullName}</span>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <FlagDisplay flag={rev.countryFlag} country={rev.country} />
                        <span className="text-xs font-medium text-neutral-300 whitespace-nowrap">{rev.country || "—"}</span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className={`w-3.5 h-3.5 fill-current ${s <= rev.rating ? "text-[#e4c126]" : "text-neutral-800"}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>

                    {/* Content */}
                    <td className="py-4 px-5 max-w-xs">
                      <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2 italic">
                        "{rev.content}"
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center">
                      {rev.isApproved ? (
                        <span className="px-2.5 py-1 rounded bg-[#528574]/15 border border-[#528574]/30 text-[#528574] text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                          Approved & Live
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-[#e4c126]/10 border border-[#e4c126]/20 text-[#e4c126] text-[9px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Approve / Unapprove icon */}
                        <button
                          onClick={() => handleToggleApproval(rev._id, rev.isApproved)}
                          title={rev.isApproved ? "Unapprove" : "Approve"}
                          className={`p-1.5 rounded border transition-colors cursor-pointer ${
                            rev.isApproved
                              ? "border-neutral-800 bg-neutral-900/30 text-neutral-500 hover:text-white hover:border-neutral-700"
                              : "border-[#528574]/40 bg-[#528574]/10 text-[#528574] hover:bg-[#528574] hover:text-white"
                          }`}
                        >
                          {rev.isApproved ? (
                            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        {/* Edit icon */}
                        <button
                          onClick={() => openEditReview(rev)}
                          title="Edit review"
                          className="p-1.5 rounded border border-neutral-800 bg-neutral-900/30 text-neutral-500 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        {/* Delete icon */}
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 rounded border border-red-950 bg-red-950/20 text-red-500 hover:bg-red-950 hover:text-white transition-colors cursor-pointer"
                          title="Delete review"
                        >
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
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
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border-2 border-red-500/60 rounded-xl max-w-md w-full p-6 md:p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#241315] text-[#f87171] border border-[#3d1e22]">
                <svg className="w-5 h-5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Review</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you sure you want to permanently delete this review? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={proceedDeleteReview} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white">
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {editReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col gap-0 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black text-white tracking-wide">Edit Review</h3>
                <p className="text-[11px] text-neutral-400 font-light mt-0.5">Update review details for {editReview.fullName}.</p>
              </div>
              <button
                onClick={() => setEditReview(null)}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5 px-6 py-6 overflow-y-auto max-h-[75vh]">
              {/* Reviewer Image */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Reviewer Photo</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-700 hover:border-[#e4c126] flex items-center justify-center overflow-hidden cursor-pointer transition-colors bg-neutral-900/50 flex-shrink-0"
                  >
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => editFileInputRef.current?.click()} className="text-xs font-bold text-[#e4c126] hover:text-white transition-colors cursor-pointer">
                      {editImagePreview ? "Change photo" : "Upload photo"}
                    </button>
                    <p className="text-[10px] text-neutral-500">JPG, PNG. Uploaded to S3.</p>
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Reviewer Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. James Anderson"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5" ref={editCountryDropdownRef}>
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Country</label>
                <div className="relative">
                  <div
                    onClick={() => setShowEditCountryDropdown((v) => !v)}
                    className="bg-neutral-950 border border-neutral-800 p-2.5 rounded flex items-center justify-between cursor-pointer hover:border-neutral-700 transition-colors"
                  >
                    {editForm.country ? (
                      <div className="flex items-center gap-2">
                        {editForm.countryFlag && <img src={editForm.countryFlag} alt={editForm.country} className="w-5 h-3.5 object-cover rounded-sm" />}
                        <span className="text-sm font-medium text-white">{editForm.country}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">Select a country...</span>
                    )}
                    <svg className="w-4 h-4 text-neutral-500 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  {showEditCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#13151a] border border-neutral-800 rounded-lg z-20 shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-neutral-800">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country..."
                          value={editCountrySearch}
                          onChange={(e) => setEditCountrySearch(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white text-xs focus:outline-none focus:border-[#e4c126] font-medium"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {countries.filter((c) => c.name.toLowerCase().includes(editCountrySearch.toLowerCase())).map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setEditForm((f) => ({ ...f, country: c.name, countryFlag: c.flag }));
                              setEditCountrySearch("");
                              setShowEditCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-800/60 transition-colors text-left cursor-pointer"
                          >
                            <img src={c.flag} alt={c.name} className="w-6 h-4 object-cover rounded-sm flex-shrink-0" />
                            <span className="text-sm font-medium text-neutral-200">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, rating: star }))}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <svg className={`w-7 h-7 fill-current transition-colors ${star <= editForm.rating ? "text-[#e4c126]" : "text-neutral-700"}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-400 ml-1">{editForm.rating} / 5</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Review Content *</label>
                <textarea
                  rows={4}
                  placeholder="Write the review content here..."
                  value={editForm.content}
                  onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={editSubmitting || editUploading}
                className="w-full py-3 bg-[#528574] hover:bg-[#436e5f] disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                {editSubmitting || editUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {editUploading ? "Uploading image..." : "Saving..."}
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Review Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-xl w-full max-w-lg flex flex-col gap-0 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black text-white tracking-wide">Create Review</h3>
                <p className="text-[11px] text-neutral-400 font-light mt-0.5">Publish a review directly to the platform.</p>
              </div>
              <button
                onClick={() => { setShowCreate(false); setForm(defaultForm); setImageFile(null); setImagePreview(""); }}
                className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5 px-6 py-6 overflow-y-auto max-h-[75vh]">

              {/* Reviewer Image */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Reviewer Photo</label>
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-700 hover:border-[#e4c126] flex items-center justify-center overflow-hidden cursor-pointer transition-colors bg-neutral-900/50 flex-shrink-0"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-[#e4c126] hover:text-white transition-colors cursor-pointer"
                    >
                      {imagePreview ? "Change photo" : "Upload photo"}
                    </button>
                    <p className="text-[10px] text-neutral-500">JPG, PNG. Uploaded to S3.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Reviewer Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. James Anderson"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5" ref={countryDropdownRef}>
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Country</label>
                <div className="relative">
                  <div
                    onClick={() => setShowCountryDropdown((v) => !v)}
                    className="bg-neutral-950 border border-neutral-800 p-2.5 rounded flex items-center justify-between cursor-pointer hover:border-neutral-700 transition-colors"
                  >
                    {form.country ? (
                      <div className="flex items-center gap-2">
                        <img src={form.countryFlag} alt={form.country} className="w-5 h-3.5 object-cover rounded-sm" />
                        <span className="text-sm font-medium text-white">{form.country}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">Select a country...</span>
                    )}
                    <svg className="w-4 h-4 text-neutral-500 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#13151a] border border-neutral-800 rounded-lg z-20 shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-neutral-800">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-white text-xs focus:outline-none focus:border-[#e4c126] font-medium"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => selectCountry(c.name, c.flag)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-800/60 transition-colors text-left cursor-pointer"
                          >
                            <img src={c.flag} alt={c.name} className="w-6 h-4 object-cover rounded-sm flex-shrink-0" />
                            <span className="text-sm font-medium text-neutral-200">{c.name}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="text-xs text-neutral-500 text-center py-4">No countries found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: star }))}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <svg className={`w-7 h-7 fill-current transition-colors ${star <= form.rating ? "text-[#e4c126]" : "text-neutral-700"}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-neutral-400 ml-1">{form.rating} / 5</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase text-neutral-500 font-extrabold tracking-wider">Review Content *</label>
                <textarea
                  rows={4}
                  placeholder="Write the review content here..."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  className="bg-neutral-950 border border-neutral-800 p-2.5 rounded text-white text-sm focus:outline-none focus:border-[#e4c126] font-medium resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-3 bg-[#e4c126] hover:bg-[#d8b520] disabled:bg-neutral-700 disabled:cursor-not-allowed text-neutral-900 font-extrabold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                {submitting || uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {uploading ? "Uploading image..." : "Publishing..."}
                  </>
                ) : (
                  "Publish Review"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
