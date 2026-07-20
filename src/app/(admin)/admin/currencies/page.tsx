"use client";

import React, { useEffect, useState } from "react";
import { useCurrencyStore, CurrencyData } from "@/store/currencyStore";
import { apiCall } from "@/lib/apiClient";

export default function CurrenciesAdminPage() {
  const {
    currencies,
    isLoading: isStoreLoading,
    error: storeError,
    fetchCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    clearError,
  } = useCurrencyStore();

  // Modal visual and editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);

  // Custom confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Form parameters
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");

  // Media uploading tracking
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form submission tracking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Hydrate data board
  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  // Clean form states
  const resetForm = () => {
    setName("");
    setSymbol("");
    setImage("");
    setAddress("");
    setBalance("0");
    setFormError(null);
    setFormSuccess(false);
    setUploadError(null);
  };

  // Open modal in create mode
  const handleCreateClick = () => {
    resetForm();
    setEditingCurrencyId(null);
    setIsModalOpen(true);
  };

  // Open modal in edit mode with loaded attributes
  const handleEditClick = (curr: CurrencyData) => {
    resetForm();
    setEditingCurrencyId(curr.id || curr._id || null);
    setName(curr.name);
    setSymbol(curr.symbol);
    setImage(curr.image || "");
    setAddress(curr.address);
    setBalance(curr.balance.toString());
    setIsModalOpen(true);
  };

  // Close and clean
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingCurrencyId(null);
  };

  // Image uploader handler (identical s3 upload pattern to plans page)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("HTTP connection error uploading currency icon.");
      }

      const result = await response.json();
      if (result.success && result.url) {
        setImage(result.url);
      } else {
        throw new Error(result.error || "Failed to receive S3 image address.");
      }
    } catch (err: any) {
      console.error("✗ S3 Image Upload Error:", err);
      setUploadError(err.message || "Failed to upload logo to AWS S3 bucket.");
    } finally {
      setIsUploading(false);
    }
  };

  // S3 Image purge helper
  const handleRemoveImage = async () => {
    if (!image) return;

    try {
      await apiCall("/api/upload", {
        method: "DELETE",
        body: { imageUrl: image },
      });
      setImage("");
    } catch (err: any) {
      console.error("✗ S3 Image Purge Error:", err);
      // Clean locally regardless
      setImage("");
    }
  };

  // S3 Image purge confirm click trigger
  const handleRemoveImageClick = () => {
    setConfirmTitle("Permanently Remove Logo");
    setConfirmDescription("Are you sure you want to purge this image logo from your Amazon S3 bucket? This will delete the active media object immediately.");
    setConfirmAction(() => async () => {
      await handleRemoveImage();
    });
    setIsConfirmOpen(true);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!name || !symbol || !address) {
      setFormError("Please fill out all required parameters.");
      return;
    }

    setIsSubmitting(true);
    const currencyPayload: CurrencyData = {
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      image: image.trim() || "",
      address: address.trim(),
      balance: Number(balance) || 0,
    };

    let result;
    if (editingCurrencyId) {
      result = await updateCurrency(editingCurrencyId, currencyPayload);
    } else {
      result = await createCurrency(currencyPayload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setFormSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } else {
      setFormError(result.error || "Operation failed. Please verify configurations.");
    }
  };

  // Delete trigger using premium confirmation dialog modal
  const handleDeleteClick = (currId: string, currName: string) => {
    setConfirmTitle("Permanently Delete Currency");
    setConfirmDescription(`Are you sure you want to permanently delete "${currName}"? This action is irreversible and will remove this cryptocurrency from all payment options.`);
    setConfirmAction(() => async () => {
      await deleteCurrency(currId);
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 antialiased min-h-full bg-[#0d0e12] text-white">
      
      {/* Upper Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#13151a] p-6 border border-neutral-800/80 rounded">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Accepted Currencies</h1>
          <p className="text-xs text-neutral-400 font-medium">
            Manage supported deposit cryptocurrencies, wallet addresses, S3 logos, and aggregate balances.
          </p>
        </div>
        
        <button
          onClick={handleCreateClick}
          className="px-5 py-3 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
        >
          <svg className="w-4 h-4 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Currency
        </button>
      </div>

      {/* Red banner store level errors */}
      {(storeError || formError) && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded flex items-start gap-2.5 antialiased animate-shake">
          <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold uppercase text-[10px] tracking-wider text-red-400">System Telemetry Alert</span>
            <span className="leading-normal">{storeError || formError}</span>
          </div>
          <button onClick={() => { clearError(); setFormError(null); }} className="ml-auto text-red-400 hover:text-red-200 cursor-pointer font-extrabold">×</button>
        </div>
      )}

      {/* Core Currencies Overview Grid/Table */}
      {isStoreLoading && currencies.length === 0 ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center bg-[#13151a] border border-neutral-800 rounded">
          <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading system ledger...</span>
        </div>
      ) : currencies.length === 0 ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center bg-[#13151a] border border-neutral-800 rounded">
          <svg className="w-10 h-10 text-neutral-600 stroke-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879-.659c1.546-1.16 3.7-1.16 5.244 0l.879.66M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">No active currencies registered.</span>
        </div>
      ) : (
        <div className="w-full bg-[#13151a] border border-neutral-800 rounded overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/50 text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  <th className="py-4 px-6">SN</th>
                  <th className="py-4 px-6">Currency</th>
                  <th className="py-4 px-6">Symbol</th>
                  <th className="py-4 px-6">Wallet Address</th>
                  <th className="py-4 px-6">Balance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm font-medium">
                {currencies.map((curr, index) => {
                  const currId = curr.id || curr._id || "";
                  return (
                    <tr key={currId} className="hover:bg-neutral-900/35 transition-colors">
                      <td className="py-4 px-6 text-xs text-neutral-500 font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          {curr.image ? (
                            <img
                              src={curr.image}
                              alt={curr.name}
                              className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-black text-neutral-400 font-mono">
                              {curr.symbol}
                            </div>
                          )}
                          <span
                            onClick={() => handleEditClick(curr)}
                            className="font-bold text-white hover:text-[#e4c126] transition-colors cursor-pointer border-b border-dashed border-neutral-700 hover:border-[#e4c126]"
                          >
                            {curr.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
                          {curr.symbol}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-neutral-400 break-all select-all">
                        {curr.address}
                      </td>
                      <td className="py-4 px-6 font-mono text-neutral-200">
                        {curr.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} <span className="text-neutral-500 text-[10px] font-extrabold">{curr.symbol}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Edit Action Icon */}
                          <button
                            onClick={() => handleEditClick(curr)}
                            className="p-2 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                            title="Edit Currency details"
                          >
                            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>

                          {/* Delete Action Icon */}
                          <button
                            onClick={() => handleDeleteClick(currId, curr.name)}
                            className="p-2 rounded text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete Currency"
                          >
                            <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation/Editing Modal Panel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#0f1115] border border-neutral-800 rounded shadow-2xl flex flex-col max-h-[90vh] overflow-hidden antialiased">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-[#13151a]">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-white">
                  {editingCurrencyId ? "Edit Currency Parameter" : "Configure Supported Currency"}
                </h2>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                  {editingCurrencyId ? "Modify existing active accepted parameters" : "Initialize new dynamic payout cryptocurrency"}
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              
              {/* Alert Success Banner */}
              {formSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-3.5 rounded flex items-center gap-2.5 antialiased">
                  <svg className="w-4.5 h-4.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-extrabold uppercase text-[10px] tracking-wider">Currency Details Successfully Deployed!</span>
                </div>
              )}

              {/* Currency Name & Symbol Input group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Currency Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                    placeholder="Bitcoin"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Symbol (Ticker) *</label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126] uppercase"
                    placeholder="BTC"
                  />
                </div>
              </div>

              {/* Balance */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Aggregate Balance</label>
                <input
                  type="number"
                  step="any"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="0.00"
                />
              </div>

              {/* Wallet Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Secure Deposit Wallet Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#13151a] border border-neutral-800/80 rounded px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]"
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                />
              </div>

              {/* S3 Image Logo Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Currency Logo Image</label>
                
                {image ? (
                  <div className="relative w-full h-32 rounded border border-neutral-800 bg-[#13151a] overflow-hidden flex items-center justify-center group">
                    <img
                      src={image}
                      alt="Uploaded Logo"
                      className="max-h-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImageClick}
                      className="absolute top-2 right-2 bg-red-950/80 hover:bg-red-950 text-red-400 border border-red-500/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded border border-dashed border-neutral-800 bg-[#13151a]/40 hover:bg-[#13151a]/60 hover:border-neutral-700/60 transition-all flex flex-col items-center justify-center gap-2.5 relative">
                    {isUploading ? (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
                        <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider">Pushing media to AWS S3 bucket...</span>
                      </>
                    ) : (
                      <>
                        {/* Upload SVG */}
                        <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Upload Custom Currency Logo</span>
                        <span className="text-[9px] text-neutral-500 font-medium font-sans">PNG, JPG, SVG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </>
                    )}
                  </div>
                )}
                {uploadError && (
                  <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-wider mt-1 block">✗ {uploadError}</span>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-neutral-800 pt-6 flex justify-end gap-3 bg-[#0f1115] mt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-3 rounded text-xs font-extrabold uppercase tracking-wider bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-3 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-950 border-t-transparent animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    editingCurrencyId ? "Save Changes" : "Deploy Currency"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Premium Custom Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#13151a] border border-neutral-800 rounded shadow-2xl p-6 flex flex-col gap-5 antialiased">
            
            {/* Modal Body & Warning Icon */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                <svg className="w-6 h-6 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-black text-white tracking-tight">{confirmTitle}</h3>
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                  {confirmDescription}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-neutral-800/80 pt-4 mt-1">
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2.5 rounded text-xs font-extrabold uppercase tracking-wider bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={async () => {
                  if (confirmAction) {
                    setIsConfirmLoading(true);
                    try {
                      await confirmAction();
                    } catch (err) {
                      console.error("✗ Confirmation action failed:", err);
                    } finally {
                      setIsConfirmLoading(false);
                      setIsConfirmOpen(false);
                    }
                  }
                }}
                className="px-4 py-2.5 rounded text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-neutral-950 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isConfirmLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-neutral-950 border-t-transparent animate-spin" />
                    Executing...
                  </>
                ) : (
                  "Confirm Action"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
