"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import { ERRORS_FILTER, LIST_SEPARATOR } from "@/constants";
import { BiblFilter } from "@/data/filters";
import { ParsedSearchFilters } from "@/data/search";
import FilterableListBody from "@/design-system/filterable-list/FilterableListBody";
import FilterableListFooter from "@/design-system/filterable-list/FilterableListFooter";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";
import { createUrl } from "@/util/util";

export interface ErrorFiltersListProps {
    parsedFilters: ParsedSearchFilters;
    cutoff?: number;
}

export default function ErrorFiltersList({ parsedFilters, cutoff = 8 }: ErrorFiltersListProps) {
    const tS = useTranslations("SearchResults.filters");
    const t = useTranslations("Filters.Errors");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(() => searchParams.get(ERRORS_FILTER)?.split(LIST_SEPARATOR) ?? [], [searchParams]);
    const [isExpanded, setIsExpanded] = useState(false);
    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: ["errFilters"],
        queryFn: async () => fetch(`/api/filters/errs`).then((res) => res.json()),
    });

    const handleFilterChange = (name: string) => {
        const newFilters = selectedFilters.includes(name)
            ? selectedFilters.filter((filter) => filter !== name)
            : [...selectedFilters, name];

        const newSearchParams = new URLSearchParams(searchParams);

        if (newFilters.length === 0) newSearchParams.delete(ERRORS_FILTER);
        else newSearchParams.set(ERRORS_FILTER, newFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const onFooterClick = () => {
        setIsExpanded(!isExpanded);
    };

    if (isLoading) return <FilterListLoader title={tS("errors")} />;
    if (error || !data) return <div className="text-surface-static-emphasised pt-4">Error fetching filters</div>;

    return (
        <div className="bg-white">
            <FilterableListHeader title={tS("errors")} />

            {data.slice(0, cutoff).map((f) => (
                <FilterableListBody
                    key={f.name}
                    // @ts-expect-error - type mismatch
                    label={t(f.name)}
                    freq={parsedFilters.showRelative ? f.relative : f.count}
                    onClick={() => handleFilterChange(f.name)}
                    isActive={selectedFilters.includes(decodeURIComponent(f.name))}
                />
            ))}

            {data.length > cutoff && <FilterableListFooter isOpen={isExpanded} onClick={onFooterClick} />}
            {isExpanded && (
                <div className="pl-2">
                    {data.slice(cutoff).map((f) => (
                        <FilterableListBody
                            key={f.name}
                            // @ts-expect-error - type mismatch
                            label={t(f.name)}
                            freq={parsedFilters.showRelative ? f.relative : f.count}
                            onClick={() => handleFilterChange(f.name)}
                            isActive={selectedFilters.includes(decodeURIComponent(f.name))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
