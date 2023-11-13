import { ReadonlyURLSearchParams } from "next/navigation";
import { SearchType, WordSearchMode } from "@/app/[locale]/Search";
import { HIGHLIGHT_ERRORS, SEARCH_SOURCE, SHOW_CORRECT, SHOW_ORIG, WORD_CATEGORY } from "@/constants";
import { TextSource } from "@prisma/client";

export const executeSearch = async (
    e: any,
    type: SearchType,
    searchSource: TextSource,
    searchMode: WordSearchMode | undefined,
    selectedCategory: string | undefined,
    existingParams: ReadonlyURLSearchParams,
    locale: string,
) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const searchString = formData.get("search-string") as string;
    if (!searchString) return;
    formData.delete("search-string");

    // Convert search mode to type (type isn't used in advanced search)
    if (searchMode === "lemma") {
        type = "basic";
    } else if (searchMode === "exact") {
        type = "list";
    }

    try {
        let search = searchString;

        if (searchString.startsWith('"') && searchString.endsWith('"')) {
            type = "list";
            search = searchString.replaceAll('"', "");
        }

        if (type === "basic") {
            const apiResult = await fetch(`/api/lemma?q=${searchString}&${SEARCH_SOURCE}=${searchSource}`);

            if (apiResult.status !== 200) {
                search = "404";
            } else {
                const { lemma } = await apiResult.json();
                search = encodeURIComponent(lemma);
            }
        }

        if (type === "collocations") {
            search = encodeURIComponent(searchString) + "/collocation";
        }

        if (type === "list") {
            search = encodeURIComponent(search);
        }

        const newParams = new URLSearchParams(existingParams);
        newParams.set("type", type);
        newParams.set(SEARCH_SOURCE, searchSource);
        newParams.set(HIGHLIGHT_ERRORS, "true");
        if (searchSource === TextSource.ORIG) {
            newParams.set(SHOW_ORIG, "true");
            newParams.delete(SHOW_CORRECT);
        }
        if (searchSource === TextSource.CORR) {
            newParams.set(SHOW_CORRECT, "true");
            newParams.delete(SHOW_ORIG);
        }
        if (selectedCategory) {
            newParams.set(WORD_CATEGORY, selectedCategory);
        }

        const mappedAdvFilters = mapFormDataToObj(Array.from(formData.entries()));
        // @ts-ignore - Works fine with Record<string, string | string[]>
        const advFiltersQueryParams = new URLSearchParams(mappedAdvFilters);

        // Merge the query params
        const mergedSearchParams = mergeQueryParams(newParams, advFiltersQueryParams);

        window.location.href = `/${locale}/${search}?${mergedSearchParams.toString()}`;
    } catch (e) {
        // TODO: Handle this in a user friendly way
        console.log("Failed to fetch lemma.", e);
    }
};

const mapFormDataToObj = (formData: [string, FormDataEntryValue][]): Record<string, string[] | string> => {
    return formData.reduce((result: Record<string, string[] | string>, [key, value]) => {
        // Check if first char is uppercase - We merge the values of the same key
        const isUpperCase = key.charAt(0) === key.charAt(0).toUpperCase();

        // No special treatment for lowercase keys
        if (!isUpperCase) {
            result[key] = value as string;
            return result;
        }

        // Add the value to the array
        if (result[key] === undefined) result[key] = [];
        (result[key] as string[]).push(value as string);

        return result;
    }, {});
};

const mergeQueryParams = (
    first: ReadonlyURLSearchParams | URLSearchParams,
    second: ReadonlyURLSearchParams | URLSearchParams,
) => {
    const mergedSearchParams = new URLSearchParams(first);
    second.forEach((value, key) => {
        // If exists, don't overwrite
        if (mergedSearchParams.has(key)) return;
        mergedSearchParams.append(key, value);
    });
    return mergedSearchParams;
};
