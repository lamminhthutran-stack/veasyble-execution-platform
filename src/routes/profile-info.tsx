import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile-info")({
  head: () => ({
    meta: [{ title: "Personal Information — Veasyble Executor" }],
  }),
  component: ProfileInfo,
});

function ProfileInfo() {
  const { profile, updateProfile } = useStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.personalEmail);
  const [address, setAddress] = useState(profile.address);

  function handleSave() {
    updateProfile({ phone, personalEmail: email, address });
    setIsEditing(false);
  }

  return (
    <AppShell title="Personal Information">
      <div className="px-5 pt-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate({ to: "/profile" })} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </button>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:text-foreground">
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Full name</label>
            <div className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.fullName}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Phone</label>
            {isEditing ? (
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.phone}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Personal email</label>
            {isEditing ? (
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.personalEmail}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Address</label>
            {isEditing ? (
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="w-full bg-card border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.address}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">ID number</label>
            <div className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.idNumber}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Bank account</label>
            <div className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-2.5 text-sm">{profile.bank}</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center px-2">
          For Full Name, ID Number, Bank Account, please contact Veasyble Admin to request change.
        </p>

        {isEditing && (
          <button onClick={handleSave} className="w-full mt-6 bg-primary text-primary-foreground font-semibold rounded-[4px] py-3.5 shadow-sm">
            Save Changes
          </button>
        )}
      </div>
    </AppShell>
  );
}
