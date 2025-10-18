'use client';

import Link from "next/link";
import { useMemo } from "react";
import programsData from '@/scraping/programs.json';

interface Major {
  id: string;
  name: string;
  color: string;
}

const colors = [
  'bg-blue-600 hover:bg-blue-700',
  'bg-purple-600 hover:bg-purple-700',
  'bg-green-600 hover:bg-green-700',
  'bg-orange-600 hover:bg-orange-700',
  'bg-pink-600 hover:bg-pink-700',
  'bg-red-600 hover:bg-red-700',
  'bg-indigo-600 hover:bg-indigo-700',
  'bg-cyan-600 hover:bg-cyan-700',
];

export default function Home() {
  // Extract majors from the imported JSON data
  const majors = useMemo(() => {
    return programsData.data
      .filter((program: any) => 
        program.catalogDisplayName && 
        program.code && 
        program.type === 'MAJOR'
      )
      .map((program: any, index: number) => ({
        id: program.code,
        name: program.catalogDisplayName,
        color: colors[index % colors.length],
      }));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-lg text-gray-600 mb-8">
          Select your major to get started with your chatbot
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {majors.length > 0 ? (
            majors.map((major: Major) => (
              <Link
                key={major.id}
                href={`/chat?majorId=${major.id}&majorName=${encodeURIComponent(major.name)}`}
                className={`px-6 py-3 ${major.color} text-white font-semibold rounded-lg transition-colors`}
              >
                {major.name}
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No majors available</p>
          )}
        </div>
      </div>
    </main>
  );
}
