"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import programsData from "@/scraping/programs.json" with { type: "json" };

const colors = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-green-600",
  "bg-orange-600",
  "bg-pink-600",
  "bg-red-600",
  "bg-indigo-600",
  "bg-cyan-600",
  "bg-yellow-600",
  "bg-teal-600",
  "bg-rose-600",
  "bg-amber-600",
];

export default function Home() {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedMajors, setSelectedMajors] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = localStorage.getItem("selectedMajorId");
    if (stored) {
      setSelectedMajorId(stored);
    }
  }, []);

  const toggleMajorSelection = (major: { id: string; name: string }) => {
    setSelectedMajors((prev) => {
      const isSelected = prev.some((m) => m.id === major.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== major.id);
      }
      if (prev.length < 2) {
        return [...prev, major];
      }
      return prev;
    });
  };

  const handleComparisonToggle = () => {
    setComparisonMode(!comparisonMode);
    setSelectedMajors([]);
  };
  // Extract and group majors by college
  const collegeGroups = useMemo(() => {
    const grouped = (programsData as any).data
      .filter(
        (program: any) =>
          program.catalogDisplayName && program.code && program.type === "MAJOR"
      )
      .reduce((acc: Record<string, any[]>, program: any) => {
        const college = program.college || "Other";
        if (!acc[college]) {
          acc[college] = [];
        }
        acc[college].push({
          id: program.code,
          name: program.catalogDisplayName,
        });
        return acc;
      }, {});

    // Convert to array and assign colors
    return Object.entries(grouped)
      .map(([collegeName, majors], index) => ({
        name: collegeName,
        majors: (majors as any[]).map((major, majorIndex) => ({
          ...major,
          color: colors[(index + majorIndex) % colors.length],
        })),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl">Welcome</h1>
          <p className="text-gray-600 text-lg">
            Select a college to explore available majors
          </p>

          {/* Comparison Mode Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="font-medium text-gray-700 text-sm">
              Compare majors?
            </span>
            <button
              aria-checked={comparisonMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                comparisonMode ? "bg-blue-600" : "bg-gray-300"
              }`}
              onClick={handleComparisonToggle}
              role="switch"
              type="button"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  comparisonMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            {comparisonMode && (
              <span className="ml-2 font-medium text-blue-600 text-xs">
                Select 2 majors to compare
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="flex flex-wrap justify-center gap-6"
            style={{
              width: "100%",
              maxWidth: "1120px",
            }}
          >
            {collegeGroups.map((college) => (
              // biome-ignore assist/source/useSortedAttributes: false positive
              <div
                key={college.name}
                className="group relative h-48 w-[220px] cursor-pointer overflow-hidden rounded-lg border border-black bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl"
              >
                {/* Background card - visible by default (white with thin black outline) */}
                <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-black transition-opacity duration-300 group-hover:opacity-0">
                  <div className="text-center">
                    <h2 className="font-bold text-xl">{college.name}</h2>
                    <p className="mt-2 text-sm opacity-90">
                      {college.majors.length} majors
                    </p>
                  </div>
                </div>

                {/* Scrollable majors list - visible on hover */}
                <div className="absolute inset-0 flex flex-col overflow-hidden bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2 p-3">
                      {college.majors.map((major, idx) => {
                        const isSelected = selectedMajors.some(
                          (m) => m.id === major.id
                        );
                        return comparisonMode ? (
                          <button
                            className={`w-full truncate rounded px-3 py-2 text-left font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                              isSelected
                                ? "bg-blue-500 text-white ring-2 ring-blue-700"
                                : idx % 2 === 0
                                  ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            } ${selectedMajors.length === 2 && !isSelected ? "cursor-not-allowed opacity-50" : ""}`}
                            disabled={
                              selectedMajors.length === 2 && !isSelected
                            }
                            key={major.id}
                            onClick={() => toggleMajorSelection(major)}
                            title={major.name}
                            type="button"
                          >
                            {major.name}
                            {isSelected && " ✓"}
                          </button>
                        ) : (
                          <Link
                            className={`${idx % 2 === 0 ? "bg-gray-200" : "bg-gray-100"} block truncate rounded px-3 py-2 font-medium text-gray-900 text-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${selectedMajorId === major.id ? "ring-2 ring-blue-500" : ""}`}
                            href={`/chat?majorId=${major.id}&majorName=${encodeURIComponent(major.name)}`}
                            key={major.id}
                            onClick={() => {
                              try {
                                localStorage.setItem(
                                  "selectedMajorId",
                                  major.id
                                );
                              } catch {
                                /* ignore */
                              }
                              setSelectedMajorId(major.id);
                            }}
                            title={major.name}
                          >
                            {major.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Mode - Show selected majors and compare button */}
        {comparisonMode && selectedMajors.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-lg">
                Selected Majors:
              </h3>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {selectedMajors.map((major) => (
                  <div
                    className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white"
                    key={major.id}
                  >
                    <span>{major.name}</span>
                    <button
                      className="ml-1 text-lg hover:opacity-70"
                      onClick={() => toggleMajorSelection(major)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedMajors.length === 2 && (
              <Link
                className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                href={`/chat/compare?major1=${encodeURIComponent(selectedMajors[0].id)}&major1Name=${encodeURIComponent(selectedMajors[0].name)}&major2=${encodeURIComponent(selectedMajors[1].id)}&major2Name=${encodeURIComponent(selectedMajors[1].name)}`}
              >
                Compare These Majors
              </Link>
            )}
          </div>
        )}

        {collegeGroups.length === 0 && (
          <div className="text-center text-gray-500">
            <p>No majors available</p>
          </div>
        )}
      </div>
    </main>
  );
}
