"use client";
import React, { useState, useEffect, useRef } from "react";
import { apiCall } from "@/lib/apiClient";

import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useToastStore } from "@/store/toastStore";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
  "Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

export function ProfileTab() {
  const { user } = useAuthStore();
  const username = user?.username;
  const { profile, updateProfile, fetchProfile } = useUserStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (username && !profile) {
      fetchProfile(username);
    }
  }, [username, profile, fetchProfile]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [occupation, setOccupation] = useState("");
  const [idType, setIdType] = useState("");
  const [idImage, setIdImage] = useState("");
  const [idImagePreview, setIdImagePreview] = useState("");
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [userReviews, setUserReviews] = useState<Array<{ rating: number; text: string; date: string }>>([
    { rating: 5, text: "Excellent clean technology fund! Fast withdrawals and premium dashboard experience.", date: "2 weeks ago" }
  ]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      
      let dob = profile.dateOfBirth || "";
      if (dob && String(dob).includes("T")) {
        dob = String(dob).split("T")[0];
      }
      setDateOfBirth(dob);
      
      setGender(profile.gender || "");
      setMaritalStatus(profile.maritalStatus || "");
      setPhoneNumber(profile.phoneNumber || "");
      setCountry(profile.country || "");
      setOccupation(profile.occupation || "");
      setIdType((profile as any).idType || "");
      if ((profile as any).idImage) {
        setIdImage((profile as any).idImage);
        setIdImagePreview((profile as any).idImage);
      }
    }
  }, [profile]);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Profile image must be under 2MB.", "warning");
      return;
    }

    setIsUploadingPic(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      if (username) {
        const result = await updateProfile({ username, profilePicture: base64String });
        if (result.success) {
          showToast("Profile picture updated successfully!");
        } else {
          showToast(result.error || "Failed to update profile picture.", "warning");
        }
      }
      setIsUploadingPic(false);
    };
    reader.onerror = () => {
      showToast("Error reading file.", "warning");
      setIsUploadingPic(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    if (!firstName || !lastName || !dateOfBirth || !gender || !maritalStatus || !phoneNumber || !country || !occupation || !idType || !idImage) {
      showToast("Please fill in all verification fields including ID type and ID document.", "warning");
      return;
    }

    const dob = new Date(dateOfBirth);
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      showToast("You must be at least 18 years old to verify your account.", "warning");
      return;
    }

    setIsSubmittingVerification(true);
    const result = await updateProfile({
      username,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      maritalStatus,
      phoneNumber,
      country,
      occupation,
      idType,
      idImage,
    } as any);

    if (result.success) {
      showToast("Verification submitted! Your details are under review.");
    } else {
      showToast(result.error || "Failed to submit verification details.", "warning");
    }
    setIsSubmittingVerification(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      showToast("Please write a review before submitting.", "warning");
      return;
    }

    try {
      const response = await apiCall<{ success: boolean; message: string; review: any }>("/api/reviews", {
        method: "POST",
        body: {
          username,
          content: reviewText,
          rating,
        },
      });

      if (response.success) {
        showToast(response.message || "Thank you! Your review is pending admin approval.");
        setReviewText("");
        
        const newReview = {
          rating,
          text: reviewText,
          date: "Pending Approval",
        };
        setUserReviews((prev) => [newReview, ...prev]);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to submit review.", "warning");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Card: Basic Info & Profile Pic Upload */}
        <div className="md:col-span-5 bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col items-center text-center gap-6 relative">
          <div className="relative group w-24 h-24 mt-2">
            <div className="w-full h-full rounded-full border-2 border-[#e4c126] overflow-hidden bg-neutral-950 flex items-center justify-center relative shadow-xl">
              {profile?.profilePicture ? (
                <img
                   src={profile.profilePicture}
                   alt="Profile"
                   className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-white uppercase">
                  {username?.substring(0, 2).toUpperCase() || "IV"}
                </span>
              )}
              {isUploadingPic && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm">
                  Uploading...
                </div>
              )}
            </div>

            {/* Upload Hover Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#528574] hover:bg-[#436e5f] text-white border border-neutral-950 transition-colors shadow-lg cursor-pointer flex items-center justify-center"
              title="Upload Profile Picture"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="text-base font-black text-white">@{username || "N/A"}</h4>
              {profile?.isVerified && (
                <span className="text-[#e4c126]" title="KYC Verified Account">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-sm text-neutral-400 font-light">
              {profile?.isVerified ? "Tier 1 Verified Investor" : "Tier 1 Basic Account"}
            </span>
          </div>

          <div className="w-full border-t border-neutral-900 pt-4 flex flex-col gap-4 text-sm text-left">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 uppercase tracking-wider font-extrabold text-sm">Email Address</span>
              <span className="text-white font-extrabold">{user?.email || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 uppercase tracking-wider font-extrabold text-sm">Account Stand</span>
              <span className="text-green-400 font-extrabold uppercase">{user?.status || "Active"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 uppercase tracking-wider font-extrabold text-sm">Platform Role</span>
              <span className="text-white font-extrabold uppercase">{user?.role || "User"}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Verification KYC Form */}
        <div className="md:col-span-7 bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-neutral-900 pb-4">
            <h4 className="text-base font-extrabold text-white tracking-wide">Account Verification & KYC</h4>
            <p className="text-sm text-neutral-400 font-light">Verify your Identity to unlock active energy deposits and dividend pathways.</p>
          </div>

          {profile?.isVerified ? (
            <div className="flex flex-col items-center text-center justify-center p-8 bg-[#528574]/5 border border-[#528574]/30 rounded-lg gap-3">
              <div className="w-12 h-12 rounded-full bg-[#528574]/20 text-[#528574] flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h5 className="text-white font-extrabold text-sm">KYC Profile fully Verified</h5>
              <p className="text-sm text-neutral-400 font-light max-w-sm">
                Thank you. Your personal details are completely validated. All platform dividend tranches and wallet configurations are fully active.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2 text-left w-full max-w-md bg-neutral-950/60 p-4 rounded border border-neutral-900/60 text-sm">
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">First Name</span><span className="text-white font-semibold">{profile.firstName}</span></div>
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">Last Name</span><span className="text-white font-semibold">{profile.lastName}</span></div>
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">Date of Birth</span><span className="text-white font-semibold">{profile.dateOfBirth}</span></div>
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">Gender</span><span className="text-white font-semibold">{profile.gender}</span></div>
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">Country</span><span className="text-white font-semibold">{profile.country}</span></div>
                <div><span className="text-neutral-500 block text-sm uppercase font-bold">Occupation</span><span className="text-white font-semibold">{profile.occupation}</span></div>
              </div>
            </div>
          ) : profile?.isVerifying ? (
            <div className="flex flex-col items-center text-center justify-center p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-lg gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/15 text-yellow-400 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
              </div>
              <h5 className="text-white font-extrabold text-sm">Verification Under Review</h5>
              <p className="text-sm text-neutral-400 font-light max-w-sm">
                Your KYC details have been submitted and are currently being reviewed. This typically takes up to 24 hours. You will be notified upon approval.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    required
                    max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split("T")[0]; })()}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Gender</label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Marital Status</label>
                  <select
                    required
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Country of Residence</label>
                  <select
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Occupation</label>
                  <input
                    type="text"
                    required
                    placeholder="Energy Infrastructure Architect"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">ID Type</label>
                <select
                  required
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium text-sm"
                >
                  <option value="">Select ID type...</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Voters Card">Voters Card</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">ID Document Photo</label>
                <div
                  onClick={() => document.getElementById("idImageInput")?.click()}
                  className="relative border-2 border-dashed border-neutral-800 hover:border-[#e4c126]/50 rounded p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-neutral-950 min-h-[120px]"
                >
                  {idImagePreview ? (
                    <img src={idImagePreview} alt="ID Preview" className="max-h-40 object-contain rounded" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-neutral-600 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-neutral-500 font-medium text-center">Click to upload your ID document<br/><span className="text-[11px] text-neutral-600">JPG, PNG — max 5MB</span></span>
                    </>
                  )}
                </div>
                <input
                  id="idImageInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      showToast("ID image must be under 5MB.", "warning");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      const b64 = reader.result as string;
                      setIdImage(b64);
                      setIdImagePreview(b64);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {idImagePreview && (
                  <button
                    type="button"
                    onClick={() => { setIdImage(""); setIdImagePreview(""); }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-bold self-start transition-colors cursor-pointer"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingVerification}
                className="mt-2 bg-[#528574] hover:bg-[#436e5f] text-white font-extrabold uppercase py-3 rounded tracking-wider transition-colors disabled:opacity-50 cursor-pointer text-center text-sm"
              >
                {isSubmittingVerification ? "Saving details..." : "Submit & Verify KYC"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Card: Rate & Review Form */}
      <div className="bg-[#0f1115] border border-neutral-900 p-6 rounded flex flex-col gap-6">
        <div className="flex flex-col gap-1 border-b border-neutral-900 pb-4">
          <h4 className="text-base font-extrabold text-white tracking-wide">Share Your Investment Experience</h4>
          <p className="text-sm text-neutral-400 font-light">Rate Capricorn Energy platform performance and let others know about clean energy pipelines yields.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Star Selection and Form */}
          <form onSubmit={handleReviewSubmit} className="lg:col-span-6 flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Overall Platform Rating</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="cursor-pointer transition-transform duration-100 hover:scale-110"
                  >
                    <svg
                      className={`w-7 h-7 fill-current ${
                        star <= (hoverRating ?? rating) ? "text-[#e4c126]" : "text-neutral-700"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-[#e4c126] font-bold text-sm ml-2">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Below Average" : "Poor"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm uppercase text-neutral-400 font-extrabold tracking-wider">Your Experience Review</label>
              <textarea
                required
                placeholder="Describe your yield tracking, certificate minting, or wallet speed..."
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="bg-neutral-950 border border-neutral-900 p-2.5 rounded text-white focus:outline-none focus:border-[#e4c126] font-medium resize-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-[#e4c126] hover:bg-[#c9a61b] text-neutral-950 font-extrabold uppercase py-3 rounded tracking-wider transition-colors cursor-pointer text-center text-sm"
            >
              Submit Platform Review
            </button>
          </form>

          {/* Verified Feedback Timeline */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <label className="text-sm uppercase text-neutral-500 font-extrabold tracking-wider">Community Platform Reviews</label>
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-1">
              {userReviews.map((rev, index) => (
                <div key={index} className="bg-neutral-950/40 p-4 rounded border border-neutral-900/60 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`w-3.5 h-3.5 fill-current ${
                            s <= rev.rating ? "text-[#e4c126]" : "text-neutral-800"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-500 font-light">{rev.date}</span>
                  </div>
                  <p className="text-sm text-neutral-300 italic font-light">
                    "{rev.text}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-black">
                      {username?.substring(0, 2).toUpperCase() || "IV"}
                    </div>
                    <span className="text-sm text-[#528574] font-bold">Verified Investor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
