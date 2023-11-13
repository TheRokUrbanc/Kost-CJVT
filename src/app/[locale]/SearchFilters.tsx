"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useTranslations } from "next-intl";
import InformationIcon from "@/assets/icons/InformationIcon";
import WordCategoryFilter from "@/components/adv-search/WordCategoryFilter";
import WordSearchMode from "@/components/adv-search/WordSearchMode";
import { filters } from "@/components/adv-search/config";
import SpeakerLangFilter from "@/components/filters/SpeakerLangFilter";
import TextsFilter from "@/components/filters/TextsFilter";
import IndexFiltersLoader from "@/components/loaders/IndexFiltersLoader";
import { BiblFilter } from "@/data/filters";
import TextButton from "@/design-system/button/TextButton";

interface SearchFiltersProps {
    isAdvancedSearch: boolean;
    selectedCategory?: string;
    handleCategoryChange?: (name: string) => void;
    selectedMode: string;
    handleModeChange?: (name: string) => void;
}

export default function SearchFilters({
    isAdvancedSearch,
    selectedCategory,
    handleCategoryChange,
    selectedMode,
    handleModeChange,
}: SearchFiltersProps) {
    const tSearch = useTranslations("Search");
    const tFilters = useTranslations("Filters.Schema");

    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: ["firstLangFilters"],
        queryFn: async () => fetch(`/api/filters/bibl/FirstLang`).then((res) => res.json()),
    });

    if (isLoading) return <IndexFiltersLoader />;
    if (error) return <div className="text-white pt-4">Error fetching filters</div>;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div className="pt-4 flex items-center gap-3">
                    <TextsFilter bg="emphasised" size="medium" />
                    <SpeakerLangFilter bg="emphasised" size="medium" filters={data} />
                    {isAdvancedSearch && (
                        <WordCategoryFilter
                            bg="emphasised"
                            size="medium"
                            onChange={handleCategoryChange}
                            selectedCategory={selectedCategory}
                        />
                    )}

                    {isAdvancedSearch && (
                        <WordSearchMode
                            bg="emphasised"
                            size="medium"
                            selectedMode={selectedMode}
                            onChange={handleModeChange}
                        />
                    )}
                </div>

                <TextButton bg="emphasised" hiearchy="ghost" size="small" trailingIcon={<InformationIcon />}>
                    {tSearch(isAdvancedSearch ? "type.using.advanced" : "type.using.basic")}
                </TextButton>
            </div>

            {isAdvancedSearch && selectedCategory && (
                <div className="bg-white shadow-lg rounded-4xl mt-2 p-6 flex flex-col gap-5">
                    {filters[selectedCategory]?.map((filter, index) => (
                        <div key={index} className="select-none">
                            <h4 className="body-1-title mb-1">{tFilters(`${filter.name}.title`)}</h4>
                            <div className="ml-0.5 flex gap-6">
                                {filter.values.map((option, index) => (
                                    <label key={`${option}-${index}`} className="body-1">
                                        {/* @ts-ignore - can't cast to lang type */}
                                        {tFilters(`${filter.name}.${option}`)}
                                        <input className="ml-2" type="checkbox" name={filter.name} value={option} />
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
