"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSettingStore } from "@/store/settingStore";
import { apiCall } from "@/lib/apiClient";

interface Doc { name: string; url: string; }
interface PendingDoc { name: string; file: File; }

export default function AdminSettingsPage() {
  const {
    setting,
    isLoading: isStoreLoading,
    error: storeError,
    fetchSettings,
    updateSettings,
    clearError,
  } = useSettingStore();

  const [companyName, setCompanyName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showCurrency, setShowCurrency] = useState(false);
  const [registrationLink, setRegistrationLink] = useState("");
  const [mapEmbed, setMapEmbed] = useState("");
  const [savedDocs, setSavedDocs] = useState<Doc[]>([]);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const newDocFileRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const res = await fetchSettings();
      if (res.success && res.setting) {
        setCompanyName(res.setting.companyName);
        setDomainName(res.setting.domainName);
        setEmail(res.setting.email);
        setPhone(res.setting.phone);
        setAddress(res.setting.address);
        setDescription(res.setting.description || "");
        setShowCurrency(res.setting.showCurrency ?? false);
        setRegistrationLink(res.setting.registrationLink || "");
        setMapEmbed(res.setting.mapEmbed || "");
        setSavedDocs(res.setting.documents || []);
      }
    };
    loadSettings();
  }, [fetchSettings]);

  const handleAddDoc = () => {
    if (!newDocName.trim() || !newDocFile) return;
    setPendingDocs((prev) => [...prev, { name: newDocName.trim(), file: newDocFile }]);
    setNewDocName("");
    setNewDocFile(null);
    if (newDocFileRef.current) newDocFileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!companyName || !domainName || !email || !phone || !address || !description) {
      setFormError("Please fill out all required configuration fields.");
      return;
    }

    setIsSubmitting(true);

    // Upload pending documents one by one
    const uploadedDocs: Doc[] = [];
    for (const pending of pendingDocs) {
      const fd = new FormData();
      fd.append("file", pending.file);
      try {
        const res = await apiCall<{ success: boolean; url: string }>("/api/upload", {
          method: "POST",
          body: fd,
        });
        uploadedDocs.push({ name: pending.name, url: res.url });
      } catch {
        setFormError(`Failed to upload "${pending.name}". Please try again.`);
        setIsSubmitting(false);
        return;
      }
    }

    const allDocs = [...savedDocs, ...uploadedDocs];

    const result = await updateSettings({
      companyName: companyName.trim(),
      domainName: domainName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      description: description.trim(),
      showCurrency,
      registrationLink: registrationLink.trim(),
      mapEmbed: mapEmbed.trim(),
      documents: allDocs,
    } as any);

    setIsSubmitting(false);

    if (result.success) {
      setSavedDocs(allDocs);
      setPendingDocs([]);
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } else {
      setFormError(result.error || "Failed to update configurations.");
    }
  };

  const inputCls = "w-full bg-[#0d0e12] border border-neutral-800/80 rounded px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#e4c126]";

  return (
    <div className="p-[10px] md:p-8 flex flex-col gap-8 antialiased min-h-full bg-[#0d0e12] text-white">

      <div className="flex flex-col gap-1.5 bg-[#13151a] p-6 border border-neutral-800/80 rounded">
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-neutral-400 font-medium">
          Configure Capricorn General brand parameters, contact channels, and signup user onboarding rules.
        </p>
      </div>

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

      {formSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-3.5 rounded flex items-center gap-2.5 antialiased">
          <svg className="w-4.5 h-4.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-extrabold uppercase text-[10px] tracking-wider">System Settings successfully deployed to cloud!</span>
        </div>
      )}

      {isStoreLoading && !setting ? (
        <div className="py-20 flex flex-col gap-3 items-center justify-center bg-[#13151a] border border-neutral-800 rounded">
          <div className="w-8 h-8 rounded-full border-2 border-[#e4c126] border-t-transparent animate-spin" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Loading system settings...</span>
        </div>
      ) : (
        <div className="w-full bg-[#13151a] border border-neutral-800 rounded shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Corporate Branding */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#e4c126] pb-2 border-b border-neutral-800/80">Corporate Branding & Support Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Company Name *</label>
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} placeholder="Capricorn Energy" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Domain Name *</label>
                  <input type="text" required value={domainName} onChange={(e) => setDomainName(e.target.value)} className={inputCls} placeholder="capricorn.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Support Email Address *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="support@capricorn.com" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Contact Phone Line *</label>
                  <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1234567890" />
                </div>
                <div className="flex flex-col gap-1.5 lg:col-span-2">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Physical Address *</label>
                  <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="123 Solar Street, Green City" />
                </div>
                <div className="flex flex-col gap-1.5 lg:col-span-3">
                  <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Company Small Description *</label>
                  <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} resize-none`} placeholder="Capricorn Energy is a global leader in clean-energy investments..." />
                </div>
              </div>
            </div>

            {/* Registration Currency Toggle */}
            <div className="flex flex-col gap-4 border-t border-neutral-800 pt-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#e4c126]">User Registration Settings</h3>
              <div className="flex items-center justify-between p-4 bg-[#0d0e12] border border-neutral-800 rounded">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white">Show Currency Wallets on Signup</span>
                  <span className="text-xs text-neutral-500 font-medium max-w-lg">
                    When enabled, users will see wallet address fields during registration and their wallets will be created automatically on account creation.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCurrency(!showCurrency)}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ml-6 ${showCurrency ? "bg-[#528574]" : "bg-neutral-700"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${showCurrency ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
            </div>

            {/* Company Registration & Documents */}
            <div className="flex flex-col gap-5 border-t border-neutral-800 pt-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#e4c126]">Company Registration & Documents</h3>

              {/* Registration Link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Company Registration Link</label>
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className={inputCls}
                  placeholder="https://companyregistrar.gov/verify/capricorn-energy-ltd"
                />
                <p className="text-[10px] text-neutral-500">Paste a URL to your official company registration record. Clients will see a clickable link on the About page.</p>
              </div>

              {/* Google Maps Embed */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Google Maps Embed Code</label>
                <textarea
                  rows={4}
                  value={mapEmbed}
                  onChange={(e) => setMapEmbed(e.target.value)}
                  className={`${inputCls} resize-none font-mono text-xs`}
                  placeholder={`<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`}
                />
                <p className="text-[10px] text-neutral-500">Paste the full &lt;iframe&gt; embed code from Google Maps Share → Embed a map. The map will display below the contact form when valid.</p>
              </div>

              {/* Add Document Row */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider">Upload Documents</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Document name (e.g. Certificate of Incorporation)"
                    className={`${inputCls} flex-1`}
                  />
                  <label className="flex items-center gap-2 bg-[#0d0e12] border border-neutral-800/80 rounded px-4 py-2.5 text-sm text-neutral-400 hover:border-[#e4c126] cursor-pointer transition-colors flex-shrink-0">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-xs font-semibold truncate max-w-[140px]">{newDocFile ? newDocFile.name : "Choose file"}</span>
                    <input
                      ref={newDocFileRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    disabled={!newDocName.trim() || !newDocFile}
                    className="flex-shrink-0 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">Accepted formats: images (JPG, PNG, WEBP) and PDF. Max 5 MB per file.</p>
              </div>

              {/* Pending Docs (staged, not yet uploaded) */}
              {pendingDocs.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Staged — will upload on save</span>
                  {pendingDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0d0e12] border border-[#e4c126]/20 rounded px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-[#e4c126] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{doc.name}</span>
                          <span className="text-[10px] text-neutral-500">{doc.file.name}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setPendingDocs((prev) => prev.filter((_, j) => j !== i))} className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer ml-3 text-lg font-bold leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved Docs (already in DB) */}
              {savedDocs.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Saved Documents</span>
                  {savedDocs.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0d0e12] border border-neutral-800 rounded px-4 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{doc.name}</span>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#e4c126] hover:underline truncate">{doc.url}</a>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSavedDocs((prev) => prev.filter((_, j) => j !== i))} className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer ml-3 text-lg font-bold leading-none shrink-0">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="border-t border-neutral-800 pt-6 flex justify-end gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded text-xs font-black uppercase tracking-wider bg-[#e4c126] text-neutral-900 hover:bg-[#c9a71b] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-neutral-950 border-t-transparent animate-spin" />
                    {pendingDocs.length > 0 ? "Uploading & Saving..." : "Saving Changes..."}
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
