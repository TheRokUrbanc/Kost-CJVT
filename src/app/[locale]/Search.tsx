"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import SearchFilters from "@/app/[locale]/SearchFilters";
import IskanjeIcon from "@/assets/icons/IskanjeIcon";
import OkolicaIcon from "@/assets/icons/OkolicaIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import SeznamIcon from "@/assets/icons/SeznamIcon";
import SearchSourceSelector from "@/components/SearchSourceSelector";
import { parseSearchSource } from "@/data/search";
import SearchBar from "@/design-system/SearchBar";
import Tab from "@/design-system/Tab";
import TextButton from "@/design-system/button/TextButton";
import { executeSearch } from "@/util/search.util";
import { TextSource } from "@prisma/client";

export type SearchType = "basic" | "collocations" | "list";
export type SearchSource = "orig" | "corrected";
export type WordSearchMode = "lemma" | "exact";

export default function Search() {
    const locale = useLocale();
    const currentParams = useSearchParams();
    const t = useTranslations("Search");
    const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
    const [selectedTab, setSelectedTab] = useState<SearchType>("basic");
    const [selectedSource, setSelectedSource] = useState<TextSource>(TextSource.ORIG);
    const [selectedCategory, setSelectedCategory] = useState<string>();
    const [selectedMode, setSelectedMode] = useState<WordSearchMode>("lemma");

    const handleTabClick = (name: string) => setSelectedTab(name as SearchType);
    const handleSourceChange = (name: string) => setSelectedSource(parseSearchSource(name));
    const handleAdvancedSearchClick = () => {
        if (!isAdvancedSearch) setSelectedTab("basic");
        setIsAdvancedSearch(!isAdvancedSearch);
    };
    const handleCategoryChange = (name: string) => setSelectedCategory(name);
    const handleModeChange = (name: string) => setSelectedMode(name as WordSearchMode);

    const handleFormSubmit = (e: FormEvent) =>
        executeSearch(
            e,
            selectedTab,
            selectedSource,
            isAdvancedSearch ? selectedMode : undefined,
            selectedCategory,
            currentParams,
            locale,
        );

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="flex justify-between items-end">
                <div className="flex w-fit">
                    <div className="rounded-t overflow-clip">
                        <Tab
                            label={t("tab.basic")}
                            name="basic"
                            isActive={selectedTab === "basic"}
                            icon={<IskanjeIcon />}
                            onClick={handleTabClick}
                            disabled={isAdvancedSearch}
                        />
                        <Tab
                            label={t("tab.collocations")}
                            name="collocations"
                            isActive={selectedTab === "collocations"}
                            icon={<OkolicaIcon />}
                            onClick={handleTabClick}
                            disabled={isAdvancedSearch}
                        />
                        <Tab
                            label={t("tab.list")}
                            name="list"
                            isActive={selectedTab === "list"}
                            icon={<SeznamIcon />}
                            onClick={handleTabClick}
                            disabled={isAdvancedSearch}
                        />
                    </div>

                    <div className="ml-3 self-center">
                        <SearchSourceSelector
                            bg="emphasised"
                            hiearchy="ghost"
                            size="small"
                            selectedFilter={selectedSource}
                            handleFilterChange={handleSourceChange}
                        />
                    </div>
                </div>

                <TextButton
                    bg="emphasised"
                    hiearchy="ghost"
                    size="small"
                    leadingIcon={<SearchIcon />}
                    onClick={handleAdvancedSearchClick}
                >
                    {t(isAdvancedSearch ? "type.basic" : "type.advanced")}
                </TextButton>
            </div>

            <SearchBar placeholder={t("placeholder")} roundTopLeft={false} searchType={selectedTab} />

            <SearchFilters
                isAdvancedSearch={isAdvancedSearch}
                handleCategoryChange={handleCategoryChange}
                selectedCategory={selectedCategory}
                selectedMode={selectedMode}
                handleModeChange={handleModeChange}
            />
        </form>
    );
}
