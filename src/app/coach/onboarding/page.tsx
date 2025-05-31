"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storage, db } from "@/lib/firebase/firebase-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase"; // Uncomment and use for Firestore save

const steps = [
  "Personal Info",
  "Business Info",
  "Branding",
  "Review & Complete"
];

export default function CoachOnboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    brandColor: "#6366f1",
    logo: null as File | null,
    profilePhoto: null as File | null,
    profilePhotoUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user && user.email) {
        setForm((prev) => ({ ...prev, email: user.email }));
      }
      console.log('[DEBUG] onAuthStateChanged user:', user);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, profilePhoto: file, profilePhotoUrl: URL.createObjectURL(file) }));
    }
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const user = firebaseUser;
      console.log('[DEBUG] handleSubmit user:', user);
      if (!user) throw new Error("Not authenticated");
      let profilePhotoUrl = "";
      let logoUrl = "";
      // Upload profile photo if present
      if (form.profilePhoto) {
        const photoRef = ref(storage, `coaches/${user.uid}/profilePhoto/${form.profilePhoto.name}`);
        await uploadBytes(photoRef, form.profilePhoto);
        profilePhotoUrl = await getDownloadURL(photoRef);
      }
      // Upload logo if present
      if (form.logo) {
        const logoRef = ref(storage, `coaches/${user.uid}/logo/${form.logo.name}`);
        await uploadBytes(logoRef, form.logo);
        logoUrl = await getDownloadURL(logoRef);
      }
      // Save profile/org data to Firestore
      await setDoc(doc(db, "coaches", user.uid), {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        businessAddress: form.businessAddress,
        brandColor: form.brandColor,
        profilePhotoUrl,
        logoUrl,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setCompleted(true);
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-lg flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-center text-indigo-800 dark:text-white mb-2">Welcome to Checkin.io, Coach!</h1>
        {/* Debug info */}
        <div className="text-xs text-gray-400 mb-2">
          <div>[DEBUG] authLoading: {String(authLoading)}</div>
          <div>[DEBUG] firebaseUser: {firebaseUser ? `${firebaseUser.email} (${firebaseUser.uid})` : 'null'}</div>
        </div>
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <div className="text-indigo-500 font-semibold">Loading your account...</div>
          </div>
        ) : (
          <>
            <div className="w-full flex items-center justify-center gap-2 mb-4">
              {steps.map((label, idx) => (
                <div key={label} className={`flex-1 h-2 rounded-full ${idx <= step ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              ))}
            </div>
            {!completed ? (
              <>
                {step === 0 && (
                  <div className="w-full space-y-4">
                    <h2 className="text-lg font-semibold mb-2">1. Personal Info</h2>
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <input name="email" value={form.email} readOnly disabled placeholder="Email" className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed" />
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                )}
                {step === 1 && (
                  <div className="w-full space-y-4">
                    <h2 className="text-lg font-semibold mb-2">2. Business Info</h2>
                    <input name="businessName" value={form.businessName} onChange={handleChange} placeholder="Business/Organization Name" className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                    <textarea name="businessAddress" value={form.businessAddress} onChange={handleChange} placeholder="Business Address" className="w-full px-4 py-2 rounded border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                  </div>
                )}
                {step === 2 && (
                  <div className="w-full space-y-6">
                    <h2 className="text-lg font-semibold mb-2">3. Branding</h2>
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-200 mb-1">Brand Color</label>
                      <input type="color" name="brandColor" value={form.brandColor} onChange={handleChange} className="w-16 h-10 p-0 border-none bg-transparent" />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-200 mb-1">Logo (optional)</label>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full" />
                      {form.logo && (
                        <div className="flex items-center gap-2 mt-2">
                          <img src={URL.createObjectURL(form.logo)} alt="Logo Preview" className="w-16 h-16 object-contain rounded bg-white border border-gray-300" />
                          <span className="text-xs text-gray-400">{form.logo.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-200 mb-1">Profile Photo (optional)</label>
                      <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="w-full" />
                      {form.profilePhotoUrl && (
                        <div className="flex justify-center mt-2">
                          <img src={form.profilePhotoUrl} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="w-full space-y-4">
                    <h2 className="text-lg font-semibold mb-2">4. Review & Complete</h2>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      <div><b>Name:</b> {form.fullName}</div>
                      <div><b>Email:</b> {form.email}</div>
                      <div><b>Phone:</b> {form.phone}</div>
                      <div><b>Business:</b> {form.businessName}</div>
                      <div><b>Address:</b> {form.businessAddress}</div>
                      <div><b>Brand Color:</b> <span style={{ background: form.brandColor, padding: '0 10px', borderRadius: 4 }}>{form.brandColor}</span></div>
                      {form.logo && <div><b>Logo:</b> {form.logo.name}</div>}
                      {form.profilePhotoUrl && (
                        <div className="flex items-center gap-2 mt-2">
                          <b>Profile Photo:</b>
                          <img src={form.profilePhotoUrl} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500" />
                        </div>
                      )}
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button onClick={handleSubmit} disabled={saving} className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                      {saving ? "Saving..." : "Finish Setup"}
                    </button>
                  </div>
                )}
                <div className="w-full flex justify-between mt-6">
                  <button onClick={handleBack} disabled={step === 0} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Back</button>
                  {step < steps.length - 1 && (
                    <button onClick={handleNext} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Next</button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-green-600 text-lg font-semibold mb-4">Profile setup complete!</div>
                <Link href="/coach/templates/new" className="w-full">
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all mb-2">
                    2. Create your first check-in template
                  </button>
                </Link>
                <Link href="/coach/clients/new" className="w-full">
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-blue-600 transition-all mb-2">
                    3. Add your first client
                  </button>
                </Link>
                <Link href="/coach/assignments" className="w-full">
                  <button className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-600 hover:to-pink-600 transition-all">
                    4. Assign a template to a client
                  </button>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 