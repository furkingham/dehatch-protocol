"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Users,
  Layers,
  Plus,
  Trash2,
  Egg,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  year: string;
  linkedin: string;
  walletAddress: string;
}

interface TeamMemberForm {
  id: string;
  name: string;
  role: string;
  email: string;
  university: string;
}

interface MilestoneForm {
  id: string;
  title: string;
  description: string;
  amount: string;
  date: string;
}

interface ProjectInfo {
  projectName: string;
  category: string;
  tagline: string;
  description: string;
  howItWorks: string;
  goalAmount: string;
  pitchDeckUrl: string;
  milestones: MilestoneForm[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Kişisel Bilgiler", icon: <User size={16} /> },
  { id: 2, title: "Proje Ekibi", icon: <Users size={16} /> },
  { id: 3, title: "Proje Bilgileri", icon: <Layers size={16} /> },
];

const CATEGORIES = ["AI/ML", "DeFi", "EdTech", "HealthTech", "GreenTech", "SaaS"];

const inputStyle = {
  background: "var(--color-black-muted)",
  border: "1px solid var(--color-black-border)",
  color: "var(--color-white)",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  width: "100%",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-white-muted)" }}>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
    />
  );
}

// ── Step 1: Personal Info ─────────────────────────────────────────────────────
function Step1({
  data,
  onChange,
}: {
  data: PersonalInfo;
  onChange: (d: PersonalInfo) => void;
}) {
  const set = (key: keyof PersonalInfo) => (val: string) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Ad Soyad *</FieldLabel>
          <Input value={data.fullName} onChange={set("fullName")} placeholder="Ahmet Yıldız" />
        </div>
        <div>
          <FieldLabel>E-posta *</FieldLabel>
          <Input value={data.email} onChange={set("email")} placeholder="ahmet@uni.edu.tr" type="email" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Telefon</FieldLabel>
          <Input value={data.phone} onChange={set("phone")} placeholder="+90 5XX XXX XX XX" />
        </div>
        <div>
          <FieldLabel>Üniversite *</FieldLabel>
          <Input value={data.university} onChange={set("university")} placeholder="ODTÜ, İTÜ, Boğaziçi..." />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Bölüm</FieldLabel>
          <Input value={data.department} onChange={set("department")} placeholder="Bilgisayar Mühendisliği" />
        </div>
        <div>
          <FieldLabel>Sınıf / Yıl</FieldLabel>
          <Input value={data.year} onChange={set("year")} placeholder="3. Sınıf / 2026" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>LinkedIn Profili</FieldLabel>
          <Input value={data.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..." />
        </div>
        <div>
          <FieldLabel>Stellar Cüzdan Adresi</FieldLabel>
          <Input
            value={data.walletAddress}
            onChange={set("walletAddress")}
            placeholder="G... (opsiyonel, sonra da ekleyebilirsiniz)"
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Team ──────────────────────────────────────────────────────────────
function Step2({
  members,
  onChange,
}: {
  members: TeamMemberForm[];
  onChange: (m: TeamMemberForm[]) => void;
}) {
  const addMember = () => {
    onChange([
      ...members,
      { id: Date.now().toString(), name: "", role: "", email: "", university: "" },
    ]);
  };

  const removeMember = (id: string) => {
    onChange(members.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, key: keyof TeamMemberForm, val: string) => {
    onChange(members.map((m) => (m.id === id ? { ...m, [key]: val } : m)));
  };

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-xl"
        style={{ background: "var(--color-yellow-glow)", border: "1px solid rgba(245,197,24,0.2)" }}
      >
        <p className="text-xs" style={{ color: "var(--color-yellow)" }}>
          💡 Başvuru sahibi (siz) otomatik olarak ekip liderine eklendi. Diğer üyeleri aşağıya ekleyebilirsiniz.
        </p>
      </div>

      {members.map((member, i) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-2xl"
          style={{
            background: "var(--color-black-muted)",
            border: "1px solid var(--color-black-border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "var(--color-white)" }}>
              Üye {i + 1}
            </p>
            {i > 0 && (
              <button
                onClick={() => removeMember(member.id)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#f87171", background: "rgba(239,68,68,0.1)" }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Ad Soyad</FieldLabel>
              <Input
                value={member.name}
                onChange={(v) => updateMember(member.id, "name", v)}
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <FieldLabel>Rol / Ünvan</FieldLabel>
              <Input
                value={member.role}
                onChange={(v) => updateMember(member.id, "role", v)}
                placeholder="CTO, Designer, ML Engineer..."
              />
            </div>
            <div>
              <FieldLabel>E-posta</FieldLabel>
              <Input
                value={member.email}
                onChange={(v) => updateMember(member.id, "email", v)}
                placeholder="email@uni.edu.tr"
                type="email"
              />
            </div>
            <div>
              <FieldLabel>Üniversite</FieldLabel>
              <Input
                value={member.university}
                onChange={(v) => updateMember(member.id, "university", v)}
                placeholder="Üniversite adı"
              />
            </div>
          </div>
        </motion.div>
      ))}

      {members.length < 6 && (
        <button
          onClick={addMember}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: "var(--color-black-card)",
            border: "1px dashed var(--color-black-muted)",
            color: "var(--color-white-muted)",
          }}
        >
          <Plus size={16} />
          Ekip Üyesi Ekle
        </button>
      )}
    </div>
  );
}

// ── Step 3: Project Info ──────────────────────────────────────────────────────
function Step3({
  data,
  onChange,
}: {
  data: ProjectInfo;
  onChange: (d: ProjectInfo) => void;
}) {
  const set = (key: keyof Omit<ProjectInfo, "milestones">) => (val: string) =>
    onChange({ ...data, [key]: val });

  const addMilestone = () => {
    onChange({
      ...data,
      milestones: [
        ...data.milestones,
        {
          id: Date.now().toString(),
          title: "",
          description: "",
          amount: "",
          date: "",
        },
      ],
    });
  };

  const removeMilestone = (id: string) => {
    onChange({ ...data, milestones: data.milestones.filter((m) => m.id !== id) });
  };

  const updateMilestone = (id: string, key: keyof MilestoneForm, val: string) => {
    onChange({
      ...data,
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, [key]: val } : m)),
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Proje Adı *</FieldLabel>
          <Input value={data.projectName} onChange={set("projectName")} placeholder="AgroChain AI" />
        </div>
        <div>
          <FieldLabel>Kategori *</FieldLabel>
          <select
            value={data.category}
            onChange={(e) => set("category")(e.target.value)}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-yellow)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-black-border)")}
          >
            <option value="">Seçiniz</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>Proje Sloganı (1 cümle) *</FieldLabel>
        <Input
          value={data.tagline}
          onChange={set("tagline")}
          placeholder="Çiftçileri DeFi ile buluşturan yapay zeka destekli tarım finansmanı"
        />
      </div>

      <div>
        <FieldLabel>Proje Açıklaması *</FieldLabel>
        <Textarea
          value={data.description}
          onChange={set("description")}
          placeholder="Projenizin amacını, hedef kitlesini ve çözdüğü problemi detaylı anlatın..."
          rows={4}
        />
      </div>

      <div>
        <FieldLabel>Nasıl Çalışır?</FieldLabel>
        <Textarea
          value={data.howItWorks}
          onChange={set("howItWorks")}
          placeholder="Projenizin teknik akışını adım adım açıklayın..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Toplam Hedef Bütçe (USDC) *</FieldLabel>
          <Input
            value={data.goalAmount}
            onChange={set("goalAmount")}
            placeholder="50000"
            type="number"
          />
        </div>
        <div>
          <FieldLabel>Pitch Deck URL (opsiyonel)</FieldLabel>
          <Input
            value={data.pitchDeckUrl}
            onChange={set("pitchDeckUrl")}
            placeholder="https://pitch.com/..."
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <FieldLabel>Milestone&apos;lar (Aşamalar) *</FieldLabel>
          <span className="text-xs" style={{ color: "var(--color-white-dim)" }}>
            {data.milestones.length}/5
          </span>
        </div>

        <div className="space-y-3">
          {data.milestones.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{
                background: "var(--color-black-muted)",
                border: "1px solid var(--color-black-border)",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold" style={{ color: "var(--color-yellow)" }}>
                  Aşama {i + 1}
                </p>
                {i > 0 && (
                  <button
                    onClick={() => removeMilestone(m.id)}
                    style={{ color: "#f87171" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Aşama Başlığı</FieldLabel>
                  <Input
                    value={m.title}
                    onChange={(v) => updateMilestone(m.id, "title", v)}
                    placeholder="MVP Geliştirme"
                  />
                </div>
                <div>
                  <FieldLabel>Hedef Miktar (USDC)</FieldLabel>
                  <Input
                    value={m.amount}
                    onChange={(v) => updateMilestone(m.id, "amount", v)}
                    placeholder="15000"
                    type="number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Açıklama</FieldLabel>
                  <Input
                    value={m.description}
                    onChange={(v) => updateMilestone(m.id, "description", v)}
                    placeholder="Bu aşamada ne yapılacak?"
                  />
                </div>
                <div>
                  <FieldLabel>Hedef Tarih</FieldLabel>
                  <Input
                    value={m.date}
                    onChange={(v) => updateMilestone(m.id, "date", v)}
                    placeholder=""
                    type="date"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {data.milestones.length < 5 && (
          <button
            onClick={addMilestone}
            className="w-full mt-3 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
            style={{
              background: "var(--color-black-card)",
              border: "1px dashed var(--color-black-muted)",
              color: "var(--color-white-muted)",
            }}
          >
            <Plus size={15} />
            Aşama Ekle
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Form Component ───────────────────────────────────────────────────────
export default function LaunchPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    department: "",
    year: "",
    linkedin: "",
    walletAddress: "",
  });

  const [team, setTeam] = useState<TeamMemberForm[]>([
    { id: "leader", name: "", role: "Ekip Lideri", email: "", university: "" },
  ]);

  const [project, setProject] = useState<ProjectInfo>({
    projectName: "",
    category: "",
    tagline: "",
    description: "",
    howItWorks: "",
    goalAmount: "",
    pitchDeckUrl: "",
    milestones: [
      { id: "m1", title: "", description: "", amount: "", date: "" },
    ],
  });

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--color-black)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--color-yellow-glow)", border: "2px solid var(--color-yellow)" }}
          >
            <CheckCircle2 size={36} style={{ color: "var(--color-yellow)" }} />
          </div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
          >
            Başvurunuz Alındı! 🎉
          </h1>
          <p className="text-base mb-2" style={{ color: "var(--color-white-muted)" }}>
            <strong style={{ color: "var(--color-white)" }}>{project.projectName || "Projeniz"}</strong> için
            başvurunuz DeHatch ekibine iletildi.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--color-white-dim)" }}>
            72 saat içinde e-posta adresinize geri dönüş yapılacaktır. Projenizin DeHatch&apos;ta parlayacağından eminiz! 🚀
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
          >
            <ArrowLeft size={15} />
            Ana Sayfaya Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-black)", minHeight: "100vh" }}>
      <div className="px-6 py-10" style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-5"
            style={{ color: "var(--color-white-muted)" }}
          >
            <ArrowLeft size={14} />
            Geri Dön
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-yellow)", color: "var(--color-black)" }}
            >
              <Egg size={20} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-yellow)" }}>
                DeHatch
              </p>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
              >
                Proje Başvurusu
              </h1>
            </div>
          </div>
          <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
            Projenizi DeHatch&apos;a tanıtın, global yatırımcılara ulaşın.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background:
                      step > s.id
                        ? "var(--color-success)"
                        : step === s.id
                        ? "var(--color-yellow)"
                        : "var(--color-black-muted)",
                    color:
                      step >= s.id ? "var(--color-black)" : "var(--color-white-dim)",
                  }}
                >
                  {step > s.id ? <CheckCircle2 size={16} /> : s.icon}
                </div>
                <p
                  className="text-xs mt-1 text-center hidden sm:block"
                  style={{
                    color: step === s.id ? "var(--color-yellow)" : "var(--color-white-dim)",
                    fontWeight: step === s.id ? 600 : 400,
                  }}
                >
                  {s.title}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                  style={{
                    background: step > s.id ? "var(--color-yellow)" : "var(--color-black-muted)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="p-6 rounded-2xl mb-6"
          style={{
            background: "var(--color-black-card)",
            border: "1px solid var(--color-black-border)",
          }}
        >
          <h2
            className="text-lg font-bold mb-5"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
          >
            {step === 1 && "Kişisel Bilgileriniz"}
            {step === 2 && "Proje Ekibi"}
            {step === 3 && "Proje Bilgileri"}
          </h2>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Step1 data={personal} onChange={setPersonal} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Step2 members={team} onChange={setTeam} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Step3 data={project} onChange={setProject} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: step === 1 ? "var(--color-black-muted)" : "var(--color-black-card)",
              color: step === 1 ? "var(--color-white-dim)" : "var(--color-white)",
              border: "1px solid var(--color-black-border)",
              cursor: step === 1 ? "not-allowed" : "pointer",
              opacity: step === 1 ? 0.5 : 1,
            }}
          >
            <ArrowLeft size={15} />
            Geri
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: step === s.id ? "var(--color-yellow)" : "var(--color-black-muted)",
                  transform: step === s.id ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {step < 3 ? (
            <motion.button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--color-yellow)",
                color: "var(--color-black)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              İleri
              <ArrowRight size={15} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--color-yellow)",
                color: "var(--color-black)",
                boxShadow: "0 4px 20px var(--color-yellow-glow)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <CheckCircle2 size={15} />
              Başvuruyu Yap
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
