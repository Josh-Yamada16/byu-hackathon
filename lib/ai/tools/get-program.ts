import { tool } from "ai";
import { z } from "zod";
import programsData from "@/scraping/programs.json" with { type: "json" };
import { getSyllabusesForMajor, buildSyllabusSummary } from "@/lib/ai/tools/get-syllabus-data";

const programs = (programsData as any)?.data || [];

export const getProgram = tool({
  description:
    "Lookup program information by major id or name. Returns a concise program object or an error if not found.",
  inputSchema: z
    .object({
      majorId: z.string().optional(),
      majorName: z.string().optional(),
    })
    .refine((d) => !!d.majorId || !!d.majorName, {
      message: "Provide either majorId or majorName",
    }),
  execute: (input) => {
    const { majorId, majorName } = input;

    if (majorId) {
      const found = programs.find(
        (p: any) => p.programGroupId === majorId || p.id === majorId
      );
      if (!found) {
        return { error: `No program found for id: ${majorId}` };
      }
      
      // Attach syllabus data if available
      const syllabusData = getSyllabusesForMajor(found.catalogDisplayName || found.longName);
      const result = { ...found };
      if (syllabusData && syllabusData.courses.length > 0) {
        result.relatedCourses = syllabusData.courses.map((c) => ({
          code: c.courseCode,
          name: c.courseName,
          instructor: c.instructor?.name,
        }));
      }
      return result;
    }

    if (majorName) {
      const needle = majorName.toLowerCase();
      const found = programs.find((p: any) =>
        (p.catalogDisplayName || p.longName || p.name || "")
          .toString()
          .toLowerCase()
          .includes(needle)
      );

      if (!found) {
        // Return a small list of close matches to help the model
        const matches = programs
          .filter((p: any) =>
            (p.catalogDisplayName || p.longName || p.name || "")
              .toString()
              .toLowerCase()
              .includes(needle.split(" ")[0])
          )
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            title: p.catalogDisplayName || p.longName,
          }));

        return { error: `No exact match for name: ${majorName}`, matches };
      }

      // Attach syllabus data if available
      const syllabusData = getSyllabusesForMajor(found.catalogDisplayName || found.longName);
      const result = { ...found };
      if (syllabusData && syllabusData.courses.length > 0) {
        result.relatedCourses = syllabusData.courses.map((c) => ({
          code: c.courseCode,
          name: c.courseName,
          instructor: c.instructor?.name,
        }));
      }
      return result;
    }

    return { error: "No input provided" };
  },
});
