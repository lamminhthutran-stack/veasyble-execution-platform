import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { ArrowLeft, Camera, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile-info")({
  head: () => ({
    meta: [{ title: "Personal Information — Veasyble Executor" }],
  }),
  component: ProfileInfo,
});

const cities = ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho", "Hai Phong"];
const wards: Record<string, string[]> = {
  "Ho Chi Minh City": ["Ben Nghe, District 1", "Thao Dien, Thu Duc", "Tan Dinh, District 1", "Phu My Hung, District 7"],
  Hanoi: ["Hang Bac, Hoan Kiem", "Dich Vong, Cau Giay", "Linh Dam, Hoang Mai"],
  "Da Nang": ["Hai Chau 1, Hai Chau", "An Hai Bac, Son Tra"],
  "Can Tho": ["An Cu, Ninh Kieu", "Cai Khe, Ninh Kieu"],
  "Hai Phong": ["Minh Khai, Hong Bang", "Dang Giang, Ngo Quyen"],
};

function ProfileInfo() {
  const { profile, updateProfile } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile.phone);
  const [personalEmail, setPersonalEmail] = useState(profile.personalEmail);
  const [city, setCity] = useState(profile.city);
  const [wardDistrict, setWardDistrict] = useState(profile.wardDistrict);
  const [cityQuery, setCityQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");

  function handleSave() {
    updateProfile({ phone, personalEmail, city, wardDistrict, address: `${wardDistrict}, ${city}` });
    setIsEditing(false);
    toast("Personal information updated successfully.");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      updateProfile({ avatar: URL.createObjectURL(e.target.files[0]) });
      toast("Profile photo updated successfully.");
    }
  }

  const cityOptions = cities.filter((item) => item.toLowerCase().includes(cityQuery.toLowerCase()));
  const wardOptions = (wards[city] ?? []).filter((item) => item.toLowerCase().includes(wardQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen bg-background pb-24 relative">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center gap-4 h-14 px-5">
            <button onClick={() => navigate({ to: "/profile" })} className="flex h-9 w-9 items-center justify-center" aria-label="Back to Profile">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="min-w-0 flex-1 text-lg font-semibold tracking-tight">Personal Information</h1>
            <button onClick={() => setIsEditing(true)} className="flex h-9 w-9 items-center justify-center" aria-label="Edit personal information">
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </header>

      <div className="px-5 pt-8 pb-24">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-card shadow-sm ring-1 ring-border/50">
              {profile.avatar ? <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" /> : <span className="text-3xl font-bold text-muted-foreground">{profile.fullName[0]}</span>}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-md">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <div className="mt-3 text-sm font-medium">Profile Photo</div>
        </div>

        <div className="space-y-4">
          <ReadOnlyField label="Full Name" value={profile.fullName} />
          <EditableField label="Phone" value={phone} onChange={setPhone} editing={isEditing} />
          <EditableField label="Personal Email" value={personalEmail} onChange={setPersonalEmail} editing={isEditing} />

          <Selector
            label="City"
            value={city}
            editing={isEditing}
            query={cityQuery}
            setQuery={setCityQuery}
            placeholder="Search city…"
            options={cityOptions}
            onSelect={(value) => {
              setCity(value);
              setWardDistrict("");
              setCityQuery("");
            }}
          />
          <Selector
            label="Ward & District"
            value={wardDistrict}
            editing={isEditing && Boolean(city)}
            query={wardQuery}
            setQuery={setWardQuery}
            placeholder="Search ward & district…"
            options={wardOptions}
            onSelect={(value) => {
              setWardDistrict(value);
              setWardQuery("");
            }}
          />

          <ReadOnlyField label="ID Number" value={profile.idNumber} />
          <ReadOnlyField label="Bank Account" value={profile.bank} />
        </div>

        <p className="mt-6 px-2 text-center text-xs text-muted-foreground">
          For Full Name, ID Number, Bank Account, please contact Veasyble Admin to request change.
        </p>

        {isEditing && (
          <button onClick={handleSave} className="mt-6 h-12 w-full rounded bg-primary font-semibold text-primary-foreground shadow-sm">
            Save Changes
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="w-full rounded border border-border/60 bg-muted px-4 py-2.5 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function EditableField({ label, value, onChange, editing }: { label: string; value: string; onChange: (value: string) => void; editing: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {editing ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-border/60 bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
      ) : (
        <div className="w-full rounded border border-border/60 bg-card px-4 py-2.5 text-sm">{value}</div>
      )}
    </div>
  );
}

function Selector({
  label,
  value,
  editing,
  query,
  setQuery,
  placeholder,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  editing: boolean;
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {editing ? (
        <div className="rounded border border-border/60 bg-card p-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="h-9 w-full rounded bg-secondary px-3 text-sm outline-none" />
          <div className="mt-2 max-h-36 overflow-y-auto">
            {options.map((option) => (
              <button key={option} onClick={() => onSelect(option)} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent">
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full rounded border border-border/60 bg-card px-4 py-2.5 text-sm">{value || "Select after choosing city"}</div>
      )}
    </div>
  );
}
