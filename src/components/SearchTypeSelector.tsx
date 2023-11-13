"use client";

import { useTranslations } from "next-intl";
import { SearchType } from "@/app/[locale]/Search";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

interface SearchTypeSelectorProps {
    bg: "light" | "emphasised";
    size: "xsmall" | "small" | "medium" | "large";
    selectedFilter: SearchType;
    handleFilterChange?: (name: string) => void;
}

export default function SearchTypeSelector({ bg, size, selectedFilter, handleFilterChange }: SearchTypeSelectorProps) {
    const t = useTranslations("Search.tab");

    return (
        <FilterDropdown bg={bg} size={size} isActive={true} label={t(selectedFilter)} leadingIcon={<CaretDown />}>
            <MenuListItem
                name="basic"
                isActive={selectedFilter === "basic"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("basic")}
            </MenuListItem>
            <MenuListItem
                name="collocations"
                isActive={selectedFilter === "collocations"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("collocations")}
            </MenuListItem>
            <MenuListItem
                name="list"
                isActive={selectedFilter === "list"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("list")}
            </MenuListItem>
        </FilterDropdown>
    );
}
