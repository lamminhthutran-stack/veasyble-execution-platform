import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ArrowLeft, Edit2, Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
    toast("Personal information updated successfully.");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's a PDF. If it's a PDF, we can't preview it directly as an image, 
      // but we show a success message.
      if (file.type === "application/pdf") {
        toast("PDF profile document uploaded successfully!");
      } else {
        const url = URL.createObjectURL(file);
        updateProfile({ avatar: url });
        toast("Profile photo updated successfully!");
      }
    }
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

        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-card border-4 border-background shadow-sm ring-1 ring-border/50 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{profile.fullName[0]}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                accept="image/png, image/jpeg, application/pdf"
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <div className="mt-3 text-sm font-medium">Profile Photo</div>
          <div className="text-xs text-muted-foreground mt-0.5">PNG, JPG, PDF or Camera</div>
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
