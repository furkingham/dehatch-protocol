"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Project } from "@/types";
import ProjectCard from "./ProjectCard";

type SortOption = "trending" | "newest" | "ending" | "funded";
type FilterCategory = Project["category"] | "all";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "trending", label: "Trend" },
  { value: "newest", label: "En Yeni" },
  { value: "ending", label: "Biten" },
  { value: "funded", label: "En Çok Fonlanan" },
];

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "AI/ML", label: "AI/ML" },
  { value: "DeFi", label: "DeFi" },
  { value: "EdTech", label: "EdTech" },
  { value: "HealthTech", label: "HealthTech" },
  { value: "GreenTech", label: "GreenTech" },
  { value: "SaaS", label: "SaaS" },
];

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("trending");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = projects
    .filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.tagline.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = category === "all" || p.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      switch (sort) {
        case "trending":
          return b.backers - a.backers;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "ending":
          return a.daysLeft - b.daysLeft;
        case "funded":
          return b.raised / b.goal - a.raised / a.goal;
        default:
          return 0;
      }
    });

  return (
    <div>
      {/* Search & Filter Bar */}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Search */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "var(--color-black-card)",
            border: "1px solid var(--color-black-border)",
          }}
        >
          <Search size={16} style={{ color: "var(--color-white-dim)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Proje, kategori veya etiket ara..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--color-white)" }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={14} style={{ color: "var(--color-white-dim)" }} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: showFilters ? "var(--color-yellow-glow)" : "var(--color-black-card)",
            border: showFilters
              ? "1px solid rgba(245,197,24,0.3)"
              : "1px solid var(--color-black-border)",
            color: showFilters ? "var(--color-yellow)" : "var(--color-white-muted)",
          }}
        >
          <SlidersHorizontal size={15} />
          Filtrele
        </button>
      </div>

      {/* Sort + Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              {/* Sort */}
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: "var(--color-white-dim)" }}>
                  SIRALAMA
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSort(opt.value)}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background:
                          sort === opt.value ? "var(--color-yellow)" : "var(--color-black-card)",
                        color:
                          sort === opt.value ? "var(--color-black)" : "var(--color-white-muted)",
                        border:
                          sort === opt.value
                            ? "1px solid var(--color-yellow)"
                            : "1px solid var(--color-black-border)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-medium mb-2.5" style={{ color: "var(--color-white-dim)" }}>
                  KATEGORİ
                </p>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background:
                          category === cat.value
                            ? "var(--color-black-muted)"
                            : "var(--color-black-card)",
                        color:
                          category === cat.value
                            ? "var(--color-white)"
                            : "var(--color-white-muted)",
                        border:
                          category === cat.value
                            ? "1px solid var(--color-white-dim)"
                            : "1px solid var(--color-black-border)",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: "var(--color-white-dim)" }}>
          <span style={{ color: "var(--color-white)", fontWeight: 600 }}>{filtered.length}</span>{" "}
          proje bulundu
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <div className="text-5xl mb-4">🔭</div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-white)" }}
          >
            Proje bulunamadı
          </h3>
          <p className="text-sm" style={{ color: "var(--color-white-muted)" }}>
            Farklı bir arama terimi veya filtre deneyin.
          </p>
        </motion.div>
      )}
    </div>
  );
}
