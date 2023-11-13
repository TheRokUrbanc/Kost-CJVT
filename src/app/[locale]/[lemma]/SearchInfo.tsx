"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { RawSearchFilters, parseRawFilters } from "@/data/search";

export default function SearchInfo() {
    const t = useTranslations("SearchInfo");
    const formatter = useFormatter();
    const searchParams = useSearchParams();
    const parsedParams = useMemo(
        () => parseRawFilters(Object.fromEntries(searchParams.entries()) as RawSearchFilters),
        [searchParams],
    );
    const { data, isLoading, error } = useQuery({
        queryKey: ["corpus-count", parsedParams.searchSource],
        queryFn: async () =>
            fetch(`/api/meta/corpus-size?source=${parsedParams.searchSource}`).then((res) => res.json()),
    });

    if (isLoading) return <p className="h-4 bg-secondary animate-pulse rounded-2xl w-80" aria-label="loading"></p>;
    if (error) return <p className="text-xs text-surface-static-emphasised">{t("error")}</p>;

    return (
        <p className="text-xs text-light-grey">
            {t(parsedParams.searchSource)} / {t("size", { count: formatter.number(data.count) })}
        </p>
    );
}
