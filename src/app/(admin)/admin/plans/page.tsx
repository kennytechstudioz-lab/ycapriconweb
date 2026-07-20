"use client";

import React, { useEffect, useState } from "react";
import { usePlanStore, PlanData } from "@/store/planStore";
import { apiCall } from "@/lib/apiClient";

export default function AdminPlansPage() {
  const { plans, isLoading, error, fetchPlans, createPlan, updatePlan, deletePlan, clearError } = usePlanStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [percent, setPercent] = useState("");
  const [duration, setDuration] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [referralPercent, setReferralPercent] = useState("");
  const [picture, setPicture] = useState("");
  const [description, setDescription] = useState("");
  
  // Custom benefits list tags
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlanId(null);
    setName("");
    setPercent("");
    setDuration("");
    setMin("");
    setMax("");
    setReferralPercent("");
    setPicture("");
    setDescription("");
    setBenefits([]);
    setNewBenefit("");
    setFormError(null);
    setFormSuccess(false);
    clearError();
  };

  const handleCreateClick = () => {
    handleCloseModal();
    setIsModalOpen(true);
  };

  const handleEditClick = (plan: PlanData) => {
    setEditingPlanId(plan.id || plan._id || null);
    setName(plan.name);
    setPercent(String(plan.percent));
    setDuration(String(plan.duration));
    setMin(String(plan.min));
    setMax(String(plan.max));
    setReferralPercent(String(plan.referralPercent));
    setPicture(plan.picture || "");
    setDescription(plan.description);
    setBenefits(plan.benefits || []);
    setNewBenefit("");
    setFormError(null);
    setFormSuccess(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ id });
  };

  const proceedDeletePlan = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      const res = await deletePlan(id);
      if (!res.success) showToast(res.error || "Failed to delete investment plan.");
    } catch (err: any) {
      showToast(err.message || "Failed to delete investment plan.");
    }
  };

  // Handles multipart file selection and uploads to AWS S3 bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // apiCall supports FormData out of the box
      const response = await apiCall<{ success: boolean; url: string }>("/api/upload", {
        method: "POST",
        body: formData,
      });

      setPicture(response.url);
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image to AWS S3.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (indexToRemove: number) => {
    setBenefits(benefits.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!name || !percent || !duration || !min || !max || !referralPercent || !description) {
      setFormError("Please fill out all required parameters.");
      return;
    }

    const numMax = Number(max);
    const numMin = Number(min);
    if (numMax !== 0 && numMin >= numMax) {
      setFormError("The minimum deposit limit must be strictly less than the maximum limit.");
      return;
    }

    setIsSubmitting(true);
    const planPayload: PlanData = {
      name: name.trim(),
      percent: Number(percent),
      duration: Number(duration),
      min: Number(min),
      max: Number(max),
      referralPercent: Number(referralPercent),
      picture: picture.trim() || "",
      benefits,
      description: description.trim(),
    };

    let result;
    if (editingPlanId) {
      result = await updatePlan(editingPlanId, planPayload);
    } else {
      result = await createPlan(planPayload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setFormSuccess(true);
      
      // Hide modal after a brief duration
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } else {
      setFormError(result.error || `Failed to ${editingPlanId ? "update" : "create"} plan. Please try again.`);
    }
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 w-full max-w-7xl mx-auto">

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
              <h4 className="text-lg font-black text-white uppercase tracking-wider">Delete Plan</h4>
            </div>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              Are you sure you want to delete this investment plan? This action is irreversible and will remove the plan from the platform immediately.
            </p>
            <div className="flex items-center justify-end gap-3.5">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded border border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/60 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={proceedDeletePlan} className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer bg-red-600 hover:bg-red-500 text-white">
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Investment Portfolio Plans
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Design, deploy, and manage different yield levels for investor pools.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="bg-[#e4c126] text-neutral-900 px-5 py-3 rounded text-xs font-black uppercase tracking-wider hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#e4c126]/10"
        >
          <svg className="w-4 h-4 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Investment Plan
        </button>
      </div>

      {/* Plans List Grid */}
      {isLoading && plans.length === 0 ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hydrating plans board...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4 flex items-center justify-between">
          <span className="text-xs text-red-400 font-bold">{error}</span>
          <button
            onClick={fetchPlans}
            className="text-[10px] bg-red-500/20 text-red-300 font-bold px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors"
          >
            Retry Query
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-24 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-neutral-500 gap-3">
          <svg className="w-10 h-10 opacity-30 stroke-current stroke-[1.5]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400">No Investment Plans Configured</span>
          <p className="text-[11px] text-neutral-500 max-w-sm text-center">
            Deploy your first structured yield level to let users deposit clean energy capital.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id || plan._id}
              className="bg-[#13151a]/30 border border-neutral-800/40 rounded-lg flex flex-col justify-between overflow-hidden hover:border-neutral-700/60 transition-all duration-300 hover:translate-y-[-2px] shadow-md group relative"
            >
              {/* Floating Edit and Delete Actions */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={() => handleEditClick(plan)}
                  title="Edit Investment Plan"
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-[#e4c126] text-white hover:text-neutral-900 flex items-center justify-center border border-white/10 hover:border-[#e4c126] transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer"
                >
                  <svg className="w-4 h-4 stroke-[2] stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(plan.id || plan._id || "")}
                  title="Delete Investment Plan"
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center border border-white/10 hover:border-red-500 transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer"
                >
                  <svg className="w-4 h-4 stroke-[2] stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>

              {plan.picture && (
                <div className="relative h-44 w-full overflow-hidden bg-neutral-900 border-b border-neutral-800/40">
                  <img
                    src={plan.picture}
                    alt={plan.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col gap-5">
                {/* Name & Badge */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3
                      onClick={() => handleEditClick(plan)}
                      className="text-lg font-black text-white hover:text-[#e4c126] hover:underline cursor-pointer transition-colors"
                    >
                      {plan.name}
                    </h3>
                    <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">
                      Structured Pool
                    </span>
                  </div>
                  
                  <div className="bg-[#528574]/15 border border-[#528574]/30 text-[#528574] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.percent}% Yield
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  {plan.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 border-y border-neutral-800/60 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Min Deposit</span>
                    <span className="text-sm font-black text-white">${plan.min.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Max Deposit</span>
                    <span className="text-sm font-black text-white">
                      {plan.max === 0 ? "Unlimited" : `$${plan.max.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Duration</span>
                    <span className="text-sm font-black text-[#e4c126]">{plan.duration} Days</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Ref Commission</span>
                    <span className="text-sm font-black text-white">{plan.referralPercent}% Commission</span>
                  </div>
                </div>

                {/* Benefits */}
                {plan.benefits.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest">Benefits Included</span>
                    <ul className="flex flex-col gap-1">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                          <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="bg-[#13151a]/60 px-6 py-4 border-t border-neutral-800/40 flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <span>Active Status</span>
                <span className="text-green-400 font-black">Live Pool</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1115] border border-neutral-800 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#13151a]">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-white">
                  {editingPlanId ? "Edit Plan Details" : "Create Structured Investment Tiers"}
                </h2>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {editingPlanId ? "Update existing plan portfolio yields" : "Configure custom yield structures"}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Messages */}
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-4 text-xs text-red-400 font-bold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded p-4 text-xs text-green-400 font-bold">
                  ✓ Investment Plan configured successfully! Hydrating dashboards...
                </div>
              )}

              {/* Grid 1: Name, Percent, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. Solar Wind Premium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Yield Percentage (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={percent}
                    onChange={(e) => setPercent(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. 12.5"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {/* Grid 2: Min, Max, Referral */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Min Threshold ($) *</label>
                  <input
                    type="number"
                    required
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. 1000"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Max Threshold ($) *</label>
                  <input
                    type="number"
                    required
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Referral Reward (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={referralPercent}
                    onChange={(e) => setReferralPercent(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="e.g. 5.0"
                  />
                </div>
              </div>

              {/* Picture Upload Dropzone */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">
                  Pool Representative Picture (S3 Upload) *
                </label>
                
                {picture ? (
                  /* Image preview state after successful upload */
                  <div className="bg-[#13151a] border border-neutral-800 rounded p-4 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative w-12 h-12 rounded bg-neutral-900 border border-neutral-850 overflow-hidden flex-shrink-0">
                        <img
                          src={picture}
                          alt="Uploaded Plan Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[10px] text-green-400 font-extrabold uppercase tracking-wider">
                          ✓ Uploaded to AWS S3
                        </span>
                        <p className="text-[11px] text-neutral-400 truncate max-w-sm font-medium">
                          {picture}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        const originalUrl = picture;
                        setPicture(""); // Reactively clear UI state instantly for beautiful UX
                        try {
                          await apiCall("/api/upload", {
                            method: "DELETE",
                            body: { url: originalUrl },
                          });
                        } catch (err: any) {
                          console.error("Failed to delete S3 asset on cancel: ", err);
                        }
                      }}
                      className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/20 transition-all font-black uppercase tracking-wider cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : isUploading ? (
                  /* Loading upload progression */
                  <div className="border border-dashed border-neutral-800 bg-[#13151a]/40 rounded-lg p-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
                      Pulsing media file to Amazon S3...
                    </span>
                  </div>
                ) : (
                  /* Input upload trigger zone */
                  <label
                    htmlFor="plan-image-upload"
                    className="border-2 border-dashed border-neutral-800 hover:border-neutral-700/60 bg-[#13151a]/20 hover:bg-[#13151a]/40 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                  >
                    <input
                      type="file"
                      id="plan-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <svg className="w-7 h-7 text-neutral-500 group-hover:text-[#e4c126] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>

                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs text-neutral-300 font-bold group-hover:text-white transition-colors">
                        Select pool photo or drag-and-drop
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        Supports PNG, JPEG, WebP or GIF (Max 5MB)
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Benefits tag builder */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Plan Benefits List</label>
                
                {/* Input + Add button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    className="flex-1 bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="Type benefit (e.g. 24/7 Energy Auditing) and click Add"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="bg-[#528574] text-white text-xs font-black px-4 rounded hover:bg-[#3d6558] transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Benefits tag tags */}
                {benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 bg-[#13151a]/40 border border-neutral-800/40 p-3 rounded">
                    {benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#528574]/20 border border-[#528574]/40 text-neutral-200 text-[10px] font-bold pl-3 pr-2 py-1 rounded"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="text-red-400 hover:text-red-300 font-black cursor-pointer text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Plan Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] resize-none"
                  placeholder="Enter detailed description of the structured solar energy yields pool..."
                />
              </div>

              {/* Submit panel buttons */}
              <div className="border-t border-neutral-800 pt-6 flex justify-end gap-3 bg-[#0f1115]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-3 rounded text-xs font-extrabold uppercase tracking-wider bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-950 border-t-transparent animate-spin" />
                      Saving Plan...
                    </>
                  ) : (
                    editingPlanId ? "Save Changes" : "Deploy Yield Plan"
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
