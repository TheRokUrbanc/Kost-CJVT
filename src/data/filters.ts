import { ParsedSearchFilters } from "@/data/search";
import prisma from "@/lib/prisma";
import { Bibl, TextSource } from "@prisma/client";

export interface BiblFilter {
    name: string;
    count: number;
    relative: number;
}

const getBiblTotalWordCount = async (
    column: keyof Bibl,
    searchSource: TextSource,
    searchText: undefined | "with-error",
): Promise<string[]> => {
    // Search orig texts
    if (searchSource === TextSource.ORIG) {
        // Search all texts
        if (searchText === undefined) {
            const res = await prisma.biblMeta.findFirst({
                select: {
                    origCounts: true,
                },
                where: {
                    colName: column,
                },
            });

            return res ? JSON.parse(res.origCounts) : [];
        }

        // Search only texts with errors
        const res = await prisma.biblMeta.findFirst({
            select: {
                origWithErrCounts: true,
            },
            where: {
                colName: column,
            },
        });

        return res ? JSON.parse(res.origWithErrCounts) : [];
    }

    // Search all corr texts
    if (searchText === undefined) {
        const res = await prisma.biblMeta.findFirst({
            select: {
                corrCounts: true,
            },
            where: {
                colName: column,
            },
        });

        return res ? JSON.parse(res.corrCounts) : [];
    }

    // Search only corr texts with errors
    const res = await prisma.biblMeta.findFirst({
        select: {
            corrWithErrCounts: true,
        },
        where: {
            colName: column,
        },
    });

    return res ? JSON.parse(res.corrWithErrCounts) : [];
};

export const getBiblFilters = async (
    field: keyof Bibl,
    filters: ParsedSearchFilters,
    count: boolean = false,
    lemma?: string,
): Promise<BiblFilter[]> => {
    // Get total word count
    const rawWordCount = await getBiblTotalWordCount(field, filters.searchSource, filters.texts);
    // Map to map type
    const mappedTotalCounts: Map<string, number> = new Map(
        // @ts-ignore
        rawWordCount?.flatMap((i) => [[i[field]!, i.count]]),
    );

    const result = await prisma.bibl.groupBy({
        orderBy: {
            _count: {
                [field]: "desc",
            },
        },
        by: [field],
        _count: {
            [field]: true,
        },
        where: {
            Paragraph: {
                some: {
                    type: filters.searchSource,
                    Sentences: {
                        some: {
                            Words: {
                                some: {
                                    AND: [{ lemma }],
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return Array.from(mappedTotalCounts.entries()).flatMap(([name, totalCount]) => {
        if (name === null) return [];

        const r = result.find((i) => i[field] === name);
        if (!r) return { name, count: 0, relative: 0 };

        const count = r._count[field] as number;
        const relative = Number(((count / totalCount) * 1000000).toFixed(2));

        return { name, count, relative };
    });
};
