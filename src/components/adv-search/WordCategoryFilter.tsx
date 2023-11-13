"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import { advFiltersSchema } from "@/components/adv-search/config";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

interface WordCategoryFilterProps {
    bg: "light" | "emphasised";
    size: "small" | "medium" | "large";
    selectedCategory?: string;
    onChange?: (name: string) => void;
}

export default function WordCategoryFilter({ bg, size, selectedCategory, onChange }: WordCategoryFilterProps) {
    const t = useTranslations("Filters.Category");
    // @ts-ignore - can't cast to proper lang type
    const label = useMemo(() => (selectedCategory ? t(selectedCategory) : t("unset")), [selectedCategory, t]);

    return (
        <FilterDropdown
            bg={bg}
            size={size}
            isActive={selectedCategory !== undefined}
            label={label}
            leadingIcon={<CaretDown />}
        >
            {Object.keys(advFiltersSchema).map((category) => (
                <MenuListItem
                    key={category}
                    name={category}
                    isActive={selectedCategory === category}
                    onClick={onChange}
                    icon={<RadioButtonIcon />}
                    activeIcon={<RadioButtonCheckedIcon />}
                >
                    {/* @ts-ignore - can't cast to proper lang type */}
                    {t(category)}
                </MenuListItem>
            ))}
        </FilterDropdown>
    );
}
