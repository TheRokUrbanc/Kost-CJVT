"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { SearchSource, SearchType } from "@/app/[locale]/Search";
import SearchIcon from "@/assets/icons/SearchIcon";
import ZoomResetIcon from "@/assets/icons/ZoomResetIcon";
import SearchSourceSelector from "@/components/SearchSourceSelector";
import SearchTypeSelector from "@/components/SearchTypeSelector";
import { parseSearchSource, parseSearchType } from "@/data/search";
import { executeSearch } from "@/util/search.util";
import { TextSource } from "@prisma/client";

interface HeaderSearchBarProps {
    placeholder?: string;
}

export default function HeaderSearchBar({ placeholder }: HeaderSearchBarProps) {
    const locale = useLocale();
    const currentParams = useSearchParams();
    const [type, setType] = useState<SearchType>(parseSearchType(currentParams.get("type")));
    const [source, setSource] = useState<TextSource>(parseSearchSource(currentParams.get("source")));

    const handleTypeChange = (name: string) => setType(name as SearchType);
    const handleSourceChange = (name: string) => setSource(parseSearchSource(name));

    return (
        <form
            onSubmit={(e) => executeSearch(e, type, source, undefined, undefined, currentParams, locale)}
            className="px-4 py-3 flex gap-2 items-center bg-white rounded w-full"
        >
            <div className="pr-3 flex gap-2 border-r border-static-border">
                <SearchTypeSelector
                    bg="light"
                    size="xsmall"
                    selectedFilter={type}
                    handleFilterChange={handleTypeChange}
                />
                <SearchSourceSelector
                    bg="light"
                    size="xsmall"
                    selectedFilter={source}
                    handleFilterChange={handleSourceChange}
                />
            </div>
            <span className="h-4 w-4 aspect-square fill-grey">
                <SearchIcon />
            </span>
            <input
                name="search-string"
                placeholder={placeholder}
                className="w-full focus:outline-none placeholder:font-light placeholder:tracking-wide text-base"
            />
            <button>
                <ZoomResetIcon />
            </button>
        </form>
    );
}
