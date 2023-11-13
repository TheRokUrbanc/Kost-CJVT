import { ParsedSearchFilters } from "@/data/search";
import prisma from "@/lib/prisma";
import { PaginatedResponse } from "@/types/query";
import { TextSource } from "@prisma/client";

const getNeighbouringWords = (
    sentence: { Words: { id: string; text: string; lemma: string | null }[] },
    lemma: string,
    leftDistance: number,
    rightDistance: number,
) => {
    const lemmaIndex = sentence.Words.findIndex((word: any) => word.text === lemma);
    if (lemmaIndex === -1) return [];
    const leftContext = sentence.Words.slice(Math.max(0, lemmaIndex - leftDistance), lemmaIndex).map((w) => w.text);
    const rightContext = sentence.Words.slice(lemmaIndex + 1, lemmaIndex + rightDistance + 1).map((w) => w.text);
    return [...leftContext, ...rightContext];
};

const getCollocations = async (lemma: string, parsedFilters: ParsedSearchFilters) => {
    const results = await prisma.sentence.findMany({
        include: {
            Words: {
                select: {
                    id: true,
                    text: true,
                    lemma: true,
                },
                orderBy: {
                    id: "asc",
                },
                where: {
                    NOT: {
                        lemma: null,
                    },
                },
            },
        },
        where: {
            type: TextSource.ORIG,
            Words: {
                some: {
                    lemma,
                },
            },
        },
    });

    const asd = results.flatMap((r) =>
        getNeighbouringWords(r, lemma, parsedFilters.leftDistance, parsedFilters.rightDistance),
    );
    return countStrings(asd, 25, parsedFilters.page);
};

function countStrings(
    array: string[],
    perPage: number,
    currentPage: number,
): { totalItems: number; data: [string, number][] } {
    const stringCountMap = new Map<string, number>();

    for (const str of array) {
        if (stringCountMap.has(str)) {
            stringCountMap.set(str, stringCountMap.get(str)! + 1);
        } else {
            stringCountMap.set(str, 1);
        }
    }

    const sorted = Array.from(stringCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice((currentPage - 1) * perPage, currentPage * perPage);
    return { totalItems: stringCountMap.size, data: sorted };
}

export const getPaginatedCollocations = async (
    locale: string,
    lemma: string,
    parsedFilters: ParsedSearchFilters,
): Promise<PaginatedResponse<[string, number][]>> => {
    const { totalItems, data } = await getCollocations(lemma, parsedFilters);
    const encodedLemma = encodeURIComponent(lemma);
    const totalPages = Math.ceil(totalItems / 25);
    const currentPage = parsedFilters.page;

    return {
        data,
        meta: {
            itemsPerPage: 25,
            totalItems: totalItems,
            totalPages: totalPages,
            currentPage,
        },
        links: {
            first: `/${locale}/${encodedLemma}/collocation?page=1`,
            previous: `/${locale}/${encodedLemma}/collocation?page=${currentPage > 2 ? currentPage - 1 : 1}`,
            current: `/${locale}/${encodedLemma}/collocation?page=${currentPage}`,
            next: `/${locale}/${encodedLemma}/collocation?page=${currentPage + 1}`,
            last: `/${locale}/${encodedLemma}/collocation?page=${totalPages}`,
        },
    };
};
