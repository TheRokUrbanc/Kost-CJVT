"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LIST_SEPARATOR } from "@/constants";
import { BiblFilter } from "@/data/filters";
import FilterableListBody from "@/design-system/filterable-list/FilterableListBody";
import FilterableListFooter from "@/design-system/filterable-list/FilterableListFooter";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";
import { createUrl } from "@/util/util";

export interface FilterableListProps {
    title?: string;
    paramName: string;
    filterItems?: BiblFilter[];
    cutoff?: number;
    showRel?: boolean;
}

export default function FilterableList({
    title,
    paramName,
    filterItems = [],
    cutoff = 8,
    showRel = false,
}: FilterableListProps) {
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(
        () => searchParams.get(paramName)?.split(LIST_SEPARATOR) ?? [],
        [searchParams, paramName],
    );
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (name: string) => {
        const newFilters = selectedFilters.includes(name)
            ? selectedFilters.filter((filter) => filter !== name)
            : [...selectedFilters, name];

        const newSearchParams = new URLSearchParams(searchParams);

        if (newFilters.length === 0) newSearchParams.delete(paramName);
        else newSearchParams.set(paramName, newFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const onFooterClick = () => {
        setIsExpanded(!isExpanded);
    };

    const sortedItems = useMemo(
        () => filterItems?.sort((a, b) => b[showRel ? "relative" : "count"] - a[showRel ? "relative" : "count"]),
        [filterItems, showRel],
    );

    return (
        <div className="bg-white">
            {title && <FilterableListHeader title={title} />}

            {sortedItems.slice(0, cutoff).map((i) => (
                <FilterableListBody
                    key={i.name}
                    label={i.name}
                    freq={showRel ? i.relative : i.count}
                    onClick={handleFilterChange}
                    isActive={selectedFilters.includes(decodeURIComponent(i.name))}
                />
            ))}

            {sortedItems.length > cutoff && <FilterableListFooter isOpen={isExpanded} onClick={onFooterClick} />}
            {isExpanded && (
                <div className="pl-2">
                    {sortedItems.slice(cutoff).map((i) => (
                        <FilterableListBody
                            key={i.name}
                            label={i.name}
                            freq={showRel ? i.relative : i.count}
                            onClick={handleFilterChange}
                            isActive={selectedFilters.includes(decodeURIComponent(i.name))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
