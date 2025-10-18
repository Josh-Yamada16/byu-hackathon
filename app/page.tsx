'use client';

import Link from "next/link";
import { useMemo } from "react";
import programsData from '@/scraping/programs.json' with { type: "json" };


const colors = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-green-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-red-600',
  'bg-indigo-600',
  'bg-cyan-600',
  'bg-yellow-600',
  'bg-teal-600',
  'bg-rose-600',
  'bg-amber-600',
];

export default function Home() {
  // Extract and group majors by college
  const collegeGroups = useMemo(() => {
    const grouped = (programsData as any).data
      .filter((program: any) => 
        program.catalogDisplayName && 
        program.code && 
        program.type === 'MAJOR'
      )
      .reduce((acc: Record<string, any[]>, program: any) => {
        const college = program.college || 'Other';
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
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collegeGroups.map((college) => (
            // biome-ignore assist/source/useSortedAttributes: false positive
<div
              key={college.name}
              className="group relative h-48 cursor-pointer overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl"
            >
              {/* Background card - visible by default */}
              <div className={`${college.color} absolute inset-0 flex items-center justify-center p-6 text-white transition-opacity duration-300 group-hover:opacity-0`}>
                <div className="text-center">
                  <h2 className="font-bold text-xl">{college.name}</h2>
                  <p className="mt-2 text-sm opacity-90">{college.majors.length} majors</p>
                </div>
              </div>

              {/* Scrollable majors list - visible on hover */}
              <div className="absolute inset-0 flex flex-col overflow-hidden bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex-shrink-0 border-gray-200 border-b bg-gray-100 px-4 py-3">
                  <h3 className="font-bold text-gray-800 text-sm">{college.name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2 p-3">
                    {college.majors.map((major) => (
                      // biome-ignore assist/source/useSortedAttributes: false positive
<Link
                        key={major.id}
                        href={`/chat?majorId=${major.id}&majorName=${encodeURIComponent(major.name)}`}
                        className={`${major.color} block truncate rounded px-3 py-2 font-medium text-sm text-white transition-opacity hover:opacity-90`}
                        title={major.name}
                      >
                        {major.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {collegeGroups.length === 0 && (
          <div className="text-center text-gray-500">
            <p>No majors available</p>
          </div>
        )}
      </div>
    </main>
  );
}
