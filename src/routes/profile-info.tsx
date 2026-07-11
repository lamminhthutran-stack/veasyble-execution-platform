import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ArrowLeft, Edit2, Camera, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile-info")({
  head: () => ({
    meta: [{ title: "Personal Information — Veasyble Executor" }],
  }),
  component: ProfileInfo,
});

const CITY_WARDS: Record<string, string[]> = {
  "Ho Chi Minh City": [
    "Phường Bến Nghé, Quận 1",
    "Phường Đa Kao, Quận 1",
    "Phường Võ Thị Sáu, Quận 3",
    "Phường Thảo Điền, Quận 2",
    "Phường Tân Phong, Quận 7",
  ],
  "Hanoi": [
    "Phường Hàng Bạc, Quận Hoàn Kiếm",
    "Phường Tràng Tiền, Quận Hoàn Kiếm",
    "Phường Dịch Vọng, Quận Cầu Giấy",
    "Phường Láng Hạ, Quận Đống Đa",
  ],
  "Da Nang": [
    "Phường Hải Châu I, Quận Hải Châu",
    "Phường Thạch Thang, Quận Hải Châu",
    "Phường An Hải Bắc, Quận Sơn Trà",
  ],
};

function ProfileInfo() {
  const { profile, updateProfile } = useStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.personalEmail);
  const [city, setCity] = useState(profile.city || "Ho Chi Minh City");
  const [ward, setWard] = useState(profile.ward || "Phường Bến Nghé, Quận 1");

  const [provinces, setProvinces] = useState<{ name: string; code: number }[]>([]);
  const [wardsList, setWardsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  const [citySearch, setCitySearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isWardOpen, setIsWardOpen] = useState(false);

  // Sync search state when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setCitySearch(city);
      setWardSearch(ward);
    }
  }, [isEditing]);

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredWards = wardsList.filter(w =>
    w.toLowerCase().includes(wardSearch.toLowerCase())
  );

  async function loadWards(provinceCode: number, shouldDefaultFirstWard: boolean = false) {
    setIsWardsLoading(true);
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`);
      if (!res.ok) throw new Error("Failed to load wards");
      const data = await res.json();
      
      const list: string[] = [];
      if (data.districts && Array.isArray(data.districts)) {
        data.districts.forEach((d: any) => {
          if (d.wards && Array.isArray(d.wards)) {
            d.wards.forEach((w: any) => {
              list.push(`${w.name}, ${d.name}`);
            });
          }
        });
      }
      
      setWardsList(list);
      if (shouldDefaultFirstWard && list.length > 0) {
        setWard(list[0]);
        setWardSearch(list[0]);
      }
    } catch (err) {
      console.error("Wards API error, using fallback:", err);
      let fallbackKey = "Ho Chi Minh City";
      if (provinceCode === 1) fallbackKey = "Hanoi";
      if (provinceCode === 48) fallbackKey = "Da Nang";
      
      const list = CITY_WARDS[fallbackKey] || CITY_WARDS["Ho Chi Minh City"];
      setWardsList(list);
      if (shouldDefaultFirstWard && list.length > 0) {
        setWard(list[0]);
        setWardSearch(list[0]);
      }
    } finally {
      setIsWardsLoading(false);
    }
  }

  useEffect(() => {
    async function loadProvinces() {
      setIsLoading(true);
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        if (!res.ok) throw new Error("Failed to load provinces");
        const data = await res.json();
        setProvinces(data);

        const matched = data.find((p: any) => 
          p.name.toLowerCase().includes(city.toLowerCase()) || 
          city.toLowerCase().includes(p.name.toLowerCase())
        );
        const provinceCode = matched ? matched.code : 79;
        
        // Load wards
        setIsWardsLoading(true);
        const resWards = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`);
        if (!resWards.ok) throw new Error("Failed to load wards");
        const dataWards = await resWards.json();
        
        const list: string[] = [];
        if (dataWards.districts && Array.isArray(dataWards.districts)) {
          dataWards.districts.forEach((d: any) => {
            if (d.wards && Array.isArray(d.wards)) {
              d.wards.forEach((w: any) => {
                list.push(`${w.name}, ${d.name}`);
              });
            }
          });
        }
        setWardsList(list);
        setCitySearch(matched ? matched.name : city);
        setWardSearch(ward);
      } catch (err) {
        console.error("Provinces API error, using fallback:", err);
        const fallbackProvinces = Object.keys(CITY_WARDS).map((name) => ({
          name: name === "Ho Chi Minh City" ? "Thành phố Hồ Chí Minh" : name === "Hanoi" ? "Thành phố Hà Nội" : "Thành phố Đà Nẵng",
          code: name === "Ho Chi Minh City" ? 79 : name === "Hanoi" ? 1 : 48
        }));
        setProvinces(fallbackProvinces);
        
        const list = CITY_WARDS[city] || CITY_WARDS["Ho Chi Minh City"];
        setWardsList(list);
        setCitySearch(city === "Ho Chi Minh City" ? "Thành phố Hồ Chí Minh" : city);
        setWardSearch(ward);
      } finally {
        setIsWardsLoading(false);
        setIsLoading(false);
      }
    }
    loadProvinces();
  }, []);

  async function handleCitySelectChange(provinceCode: number) {
    const matched = provinces.find(p => p.code === provinceCode);
    if (matched) {
      setCity(matched.name);
      setCitySearch(matched.name);
      await loadWards(provinceCode, true);
    }
  }

  function handleSave() {
    updateProfile({ phone, personalEmail: email, city, ward });
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
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.history && window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/profile" });
                }
              }}
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">Personal Information</h1>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 pb-20">

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
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
            <div className="w-full h-14 bg-secondary border border-border/50 rounded-xl px-4 text-base font-normal text-muted-foreground/70 flex items-center">
              {profile.fullName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Phone</label>
            {isEditing ? (
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal flex items-center">{profile.phone}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Personal Email</label>
            {isEditing ? (
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <div className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal flex items-center">{profile.personalEmail}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
            {isLoading ? (
              <div className="w-full h-14 bg-secondary animate-pulse rounded-xl px-4 text-base font-normal flex items-center text-muted-foreground">
                Loading provinces...
              </div>
            ) : isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setIsCityOpen(true);
                  }}
                  onFocus={() => setIsCityOpen(true)}
                  className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
                {isCityOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => {
                      if (!citySearch) {
                        setCitySearch(city);
                      }
                      setIsCityOpen(false);
                    }} />
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                      {filteredProvinces.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">No cities found</div>
                      ) : (
                        filteredProvinces.map((p) => (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => {
                              setCitySearch(p.name);
                              setCity(p.name);
                              handleCitySelectChange(p.code);
                              setIsCityOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary active:bg-secondary/80 transition-colors cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal flex items-center">
                {city}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Ward & District</label>
            {isWardsLoading ? (
              <div className="w-full h-14 bg-secondary animate-pulse rounded-xl px-4 text-base font-normal flex items-center text-muted-foreground">
                Loading wards...
              </div>
            ) : isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ward & district..."
                  value={wardSearch}
                  onChange={(e) => {
                    setWardSearch(e.target.value);
                    setIsWardOpen(true);
                  }}
                  onFocus={() => setIsWardOpen(true)}
                  className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
                {isWardOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => {
                      if (!wardSearch) {
                        setWardSearch(ward);
                      }
                      setIsWardOpen(false);
                    }} />
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border/60 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                      {filteredWards.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">No wards found</div>
                      ) : (
                        filteredWards.map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => {
                              setWardSearch(w);
                              setWard(w);
                              setIsWardOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary active:bg-secondary/80 transition-colors cursor-pointer"
                          >
                            {w}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-14 bg-card border border-border/60 rounded-xl px-4 text-base font-normal flex items-center">
                {ward || "Chưa thiết lập"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">ID Number</label>
            <div className="w-full h-14 bg-secondary border border-border/50 rounded-xl px-4 text-base font-normal text-muted-foreground/70 flex items-center">
              {profile.idNumber}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Bank Account</label>
            <div className="w-full h-14 bg-secondary border border-border/50 rounded-xl px-4 text-base font-normal text-muted-foreground/70 flex items-center">
              {profile.bank}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center px-2 italic">
          For Full Name, ID Number, Bank Account, please contact Veasyble Admin to request change.
        </p>

        {isEditing && (
          <button 
            onClick={handleSave} 
            className="w-full h-14 mt-6 bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm text-base flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform"
          >
            Save Changes
          </button>
        )}
      </div>
    </AppShell>
  );
}
