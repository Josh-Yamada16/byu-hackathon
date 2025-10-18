'use client';

import Link from "next/link";
import { useMemo } from "react";
import programsData from '@/scraping/programs.json';

interface Major {
  id: string;
  name: string;
  color: string;
}

interface College {
  name: string;
  majors: Major[];
}

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
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-lg text-gray-600">
            Select a college to explore available majors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collegeGroups.map((college) => (
            <div
              key={college.name}
              className="group relative h-48 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Background card - visible by default */}
              <div className={`${college.color} absolute inset-0 flex items-center justify-center text-white p-6 transition-opacity duration-300 group-hover:opacity-0`}>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{college.name}</h2>
                  <p className="text-sm mt-2 opacity-90">{college.majors.length} majors</p>
                </div>
              </div>

              {/* Scrollable majors list - visible on hover */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden flex flex-col">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex-shrink-0">
                  <h3 className="font-bold text-gray-800 text-sm">{college.name}</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 space-y-2">
                    {college.majors.map((major) => (
                      <Link
                        key={major.id}
                        href={`/chat?majorId=${major.id}&majorName=${encodeURIComponent(major.name)}`}
                        className={`${major.color} text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity block truncate`}
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
