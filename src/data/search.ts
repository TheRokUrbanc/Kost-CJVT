import { SearchType } from "@/app/[locale]/Search";
import { AdvFilterKeys, advFiltersSchema, filterDef } from "@/components/adv-search/config";
import {
    ADV_FILTERS_SEPARATOR,
    CENTER_CONCORDANCE,
    CONTEXT_WORD,
    ERRORS_FILTER,
    FIRST_LANG_FILTER,
    HIGHLIGHT_ERRORS,
    INPUT_TYPE_FILTER,
    LEFT_DISTANCE,
    LIST_SEPARATOR,
    PROFIC_SLV_FILTER,
    PROGRAM_TYPE_FILTER,
    RIGHT_DISTANCE,
    SEARCH_SOURCE,
    SHOW_CORRECT,
    SHOW_ORIG,
    SHOW_RELATIVE,
    TASK_SETTING_FILTER,
    WORD_CATEGORY,
} from "@/constants";
import prisma from "@/lib/prisma";
import { OrigParagraphQuery, PaginatedResponse } from "@/types/query";
import { parsePageNumber } from "@/util/parsing.util";
import { sanitizeLemma } from "@/util/util";
import { TextSource } from "@prisma/client";

// Shared across all search types
export type RawBaseFilters = {
    texts?: "with-error";
    type?: string;
    page?: string;
    [SHOW_RELATIVE]?: string;
    [SEARCH_SOURCE]?: string;
    [SHOW_ORIG]?: string;
    [SHOW_CORRECT]?: string;
    [HIGHLIGHT_ERRORS]?: string;
    [CENTER_CONCORDANCE]?: string;
    [FIRST_LANG_FILTER]?: string;
    [TASK_SETTING_FILTER]?: string;
    [PROFIC_SLV_FILTER]?: string;
    [PROGRAM_TYPE_FILTER]?: string;
    [INPUT_TYPE_FILTER]?: string;
    [WORD_CATEGORY]?: string;
    [ERRORS_FILTER]?: string;
};

export type RawCollocationsFilters = {
    [LEFT_DISTANCE]?: string;
    [RIGHT_DISTANCE]?: string;
    [CONTEXT_WORD]?: string;
};

export type RawSearchFilters = RawBaseFilters & RawCollocationsFilters & Record<AdvFilterKeys, string>;

export type ParsedSearchFilters = {
    texts?: "with-error";
    type: SearchType;
    page: number;
    showRelative: boolean;
    searchSource: TextSource;
    showOrig: boolean;
    showCorrect: boolean;
    highlightErrors: boolean;
    center: boolean;
    firstLang?: string[];
    taskSetting?: string[];
    proficSlv?: string[];
    programType?: string[];
    inputType?: string[];
    leftDistance: number;
    rightDistance: number;
    context?: string;
    advancedFilters?: Record<AdvFilterKeys, string[]>;
    wordCategory?: string;
    errorsFilters?: string[];
};

export type OrigParagraphResult = {
    totalItems: number;
    data: OrigParagraphQuery[];
};

export const parseSearchType = (type?: string | null): SearchType => {
    if (!type) return "basic";
    return type as SearchType;
};

export const parseSearchSource = (source?: string | null): TextSource => {
    if (source === "correct" || source === "CORR") return TextSource.CORR;
    return TextSource.ORIG;
};

export const parseRawFilters = (rawFilters: RawSearchFilters): ParsedSearchFilters => {
    const baseFilters = {
        texts: rawFilters.texts,
        type: parseSearchType(rawFilters.type),
        page: parsePageNumber(rawFilters.page || "1"),
        showRelative: rawFilters[SHOW_RELATIVE] == "true",
        searchSource: parseSearchSource(rawFilters[SEARCH_SOURCE]),
        showOrig: rawFilters[SHOW_ORIG] == "true",
        showCorrect: rawFilters[SHOW_CORRECT] == "true",
        center: rawFilters[CENTER_CONCORDANCE] == "true",
        highlightErrors: rawFilters[HIGHLIGHT_ERRORS] == "true",
        firstLang: rawFilters[FIRST_LANG_FILTER]?.split(LIST_SEPARATOR),
        taskSetting: rawFilters[TASK_SETTING_FILTER]?.split(LIST_SEPARATOR),
        proficSlv: rawFilters[PROFIC_SLV_FILTER]?.split(LIST_SEPARATOR),
        programType: rawFilters[PROGRAM_TYPE_FILTER]?.split(LIST_SEPARATOR),
        inputType: rawFilters[INPUT_TYPE_FILTER]?.split(LIST_SEPARATOR),
        wordCategory: rawFilters[WORD_CATEGORY],
        errorsFilters: rawFilters[ERRORS_FILTER]?.split(LIST_SEPARATOR),
    };

    const collocationsFilters = {
        leftDistance: Number(rawFilters[LEFT_DISTANCE] ?? "0"),
        rightDistance: Number(rawFilters[RIGHT_DISTANCE] ?? "0"),
        context: rawFilters[CONTEXT_WORD],
    };

    const advFilters = Object.entries(rawFilters).reduce(
        (acc, [key, value]) => {
            if (key in filterDef) {
                acc[key as AdvFilterKeys] = value.split(ADV_FILTERS_SEPARATOR);
            }
            return acc;
        },
        {} as Record<AdvFilterKeys, string[]>,
    );

    return { ...baseFilters, ...collocationsFilters, advancedFilters: advFilters };
};

export const getBiblFilterQuery = (filters: ParsedSearchFilters) => ({
    FirstLang: {
        in: filters.firstLang,
    },
    TaskSetting: {
        in: filters.taskSetting,
    },
    ProficSlv: {
        in: filters.proficSlv,
    },
    ProgramType: {
        in: filters.programType,
    },
    InputType: {
        in: filters.inputType,
    },
});

export const getMappedAdvFiltersQuery = (filters: ParsedSearchFilters) => {
    // Return empty array if no advanced filters are selected
    if (!filters.wordCategory || !filters.advancedFilters) return [];

    // Get the schema for the selected word category
    const categorySchema = advFiltersSchema[filters.wordCategory];

    // Map the selected advanced filters to a query
    return Object.entries(filters.advancedFilters).map(([key, values]) => {
        // Get the index of the current filter in the schema
        const schemaIndex = categorySchema.indexOf(key as AdvFilterKeys);
        if (schemaIndex === -1) {
            throw new Error(`Invalid advanced filter: ${key}`);
        }
        // Create a string of underscores to fill the offset (used for SQL wildcards)
        const offsetFiller = "_".repeat(schemaIndex);

        return {
            OR: values.map((value) => {
                return {
                    ana: {
                        startsWith: `mte:${filters.wordCategory}${offsetFiller}${value}%`,
                    },
                };
            }),
        };
    });
};

export const getWhereFilterQuery = (
    lemma: string | undefined,
    parsedFilters: ParsedSearchFilters,
    biblFilters: any,
    mappedAdvFilters: any,
    context?: string,
) => {
    const sanitizedLemma = lemma ? sanitizeLemma(lemma) : undefined;
    let wordFilterQuery = {};
    if (parsedFilters.type === "basic" || parsedFilters.type === "collocations") {
        wordFilterQuery = {
            lemma: sanitizedLemma,
        };
    }

    if (parsedFilters.type === "list") {
        // Convert wildcard characters to SQL wildcards
        const adjustedLemma = sanitizedLemma?.replaceAll("*", "%").replaceAll("?", "_");
        wordFilterQuery = {
            text: {
                startsWith: adjustedLemma,
            },
        };
    }

    const mappedErrFilters =
        parsedFilters.errorsFilters?.map((err) => ({
            OrigErrors: {
                some: {
                    type: err,
                },
            },
        })) ?? [];

    return {
        some: {
            Bibl: biblFilters,
            Words: {
                some: {
                    AND: [wordFilterQuery, ...mappedAdvFilters, ...mappedErrFilters],
                },
            },
        },
    };
};

export const getOrigParagraphs = async (lemma: string, filters: ParsedSearchFilters): Promise<OrigParagraphResult> => {
    const mappedAdvFilters = getMappedAdvFiltersQuery(filters);
    const biblFilters = getBiblFilterQuery(filters);
    const whereFilter = getWhereFilterQuery(lemma, filters, biblFilters, mappedAdvFilters);

    const showCorrect = {
        CorrParagraph: {
            include: {
                Sentences: {
                    orderBy: {
                        id: "asc",
                    },
                    include: {
                        Words: {
                            orderBy: {
                                id: "asc",
                            },
                            select: {
                                id: true,
                                text: true,
                                lemma: true,
                            },
                        },
                    },
                    where: {
                        Words: {
                            some: {
                                lemma,
                            },
                        },
                    },
                },
            },
        },
    };

    const totalItems = await prisma.paragraph.count({
        where: {
            type: filters.searchSource,
            Sentences: whereFilter,
        },
    });

    const data = await prisma.paragraph.findMany({
        take: 25,
        skip: (filters.page - 1) * 25,
        orderBy: {
            id: "asc",
        },
        where: {
            type: filters.searchSource,
            Sentences: whereFilter,
        },
        // @ts-ignore - conditional includes mess up the types
        include: {
            Sentences: {
                orderBy: {
                    id: "asc",
                },
                include: {
                    Words: {
                        orderBy: {
                            id: "asc",
                        },
                        select: {
                            id: true,
                            text: true,
                            lemma: true,
                        },
                    },
                },
                where: whereFilter.some,
            },
            ...showCorrect,
            ...(filters.highlightErrors ? { OrigErrors: true } : {}),
        },
    });

    // @ts-ignore - conditional includes mess up the types
    return { totalItems, data };
};

export const getPaginatedOrigParagraphs = async (
    locale: string,
    lemma: string,
    parsedFilters: ParsedSearchFilters,
): Promise<PaginatedResponse<OrigParagraphQuery[]>> => {
    const { totalItems, data } = await getOrigParagraphs(lemma, parsedFilters);
    const totalPages = Math.ceil(totalItems / 25);
    const currentPage = parsedFilters.page;

    // Filter out errors not in the same sentence as the lemma
    data.forEach((item) => trimItem(item));

    const encodedLemma = encodeURIComponent(lemma);

    return {
        data,
        meta: {
            itemsPerPage: 25,
            totalItems,
            totalPages,
            currentPage: currentPage,
        },
        links: {
            first: `/${locale}/${encodedLemma}?page=1`,
            previous: `/${locale}/${encodedLemma}?page=${currentPage > 2 ? currentPage - 1 : 1}`,
            current: `/${locale}/${encodedLemma}?page=${currentPage}`,
            next: `/${locale}/${encodedLemma}?page=${currentPage + 1}`,
            last: `/${locale}/${encodedLemma}?page=${totalPages}`,
        },
    };
};

// Remove all errors except the ones that are in the same sentence as the current lemma
const trimItem = (item: OrigParagraphQuery) => {
    // TODO: Fix
    // if (item.Errs && item.OrigSentences[0]) {
    //     item.Errs = item.Errs.filter((err) => err.target.includes(item.OrigSentences[0].id));
    // }
};
