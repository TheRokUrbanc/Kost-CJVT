import { BiblFilter } from "@/data/filters";
import { ParsedSearchFilters } from "@/data/search";
import prisma from "@/lib/prisma";
import { TextSource } from "@prisma/client";

export const getErrsFilters = async (parsedFilters: ParsedSearchFilters): Promise<BiblFilter[]> => {
    const allCounts = await prisma.countMeta.findFirst({ where: { name: "errs" } });
    if (!allCounts) return [];

    if (parsedFilters.searchSource === TextSource.CORR) {
        return JSON.parse(allCounts.corrCounts).map((f: { type: string; count: number }) => ({
            name: f.type,
            count: f.count,
            relative: 0,
        }));
    }

    return JSON.parse(allCounts.origCounts).map((f: { type: string; count: number }) => ({
        name: f.type,
        count: f.count,
        relative: 0,
    }));
};
