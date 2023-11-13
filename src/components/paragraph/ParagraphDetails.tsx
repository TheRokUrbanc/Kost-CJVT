"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchType } from "@/app/[locale]/Search";
import ParagraphDetailsLoader from "@/components/loaders/ParagraphDetailsLoader";
import ParagraphCompareTab from "@/components/paragraph/ParagraphCompareTab";
import ParagraphCorrTab from "@/components/paragraph/ParagraphCorrTab";
import ParagraphError from "@/components/paragraph/ParagraphError";
import ParagraphMetadataTab from "@/components/paragraph/ParagraphMetadataTab";
import ParagraphSourceTab from "@/components/paragraph/ParagraphSourceTab";
import { SELECTED_TAB } from "@/constants";
import TextButton from "@/design-system/button/TextButton";
import { createUrl } from "@/util/util";

interface ParagraphDetailsProps {
    id: string;
    currentLemma: string;
    cacheHeader: string | null;
    highlightedOrigSentenceId?: string;
    highlightedCorrSentenceId?: string;
}

export default function ParagraphDetails({
    id,
    currentLemma,
    cacheHeader,
    highlightedOrigSentenceId,
    highlightedCorrSentenceId,
}: ParagraphDetailsProps) {
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const searchType = useMemo(() => (searchParams.get("type") ?? "basic") as SearchType, [searchParams]);
    const selectedTab = useMemo(() => searchParams.get(SELECTED_TAB) ?? "compare", [searchParams]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["paragraph", id],
        queryFn: async () =>
            fetch(`/api/paragraph/${id}`, {
                headers: {
                    "cache-control": cacheHeader ?? "",
                },
            }).then((res) => res.json()),
    });

    const onClick = (name: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(SELECTED_TAB, name);
        router.replace(createUrl(path, newParams), { scroll: false });
    };

    if (isLoading) return <ParagraphDetailsLoader />;
    if (error) return <ParagraphError />;

    return (
        <div>
            <h4 className="px-4 py-4 text-surface-static-emphasised body-2-title border-b border-static-border">
                Korpusni podatki
            </h4>
            <div className="px-4 py-3 flex gap-1">
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "compare" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("compare")}
                >
                    Primerjava
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "orig" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("orig")}
                >
                    Izvorno besedilo
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "corr" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("corr")}
                >
                    Popravljeno besedilo
                </TextButton>
                <TextButton
                    bg="light"
                    hiearchy={selectedTab === "meta" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => onClick("meta")}
                >
                    Metapodatki
                </TextButton>
            </div>

            {selectedTab === "compare" && (
                <ParagraphCompareTab data={data} searchType={searchType} currentLemma={currentLemma} />
            )}
            {selectedTab === "orig" && (
                <ParagraphSourceTab
                    data={data}
                    sentenceId={highlightedOrigSentenceId}
                    searchType={searchType}
                    currentLemma={currentLemma}
                />
            )}
            {selectedTab === "corr" && (
                <ParagraphCorrTab
                    data={data}
                    sentenceId={highlightedCorrSentenceId}
                    searchType={searchType}
                    currentLemma={currentLemma}
                />
            )}
            {selectedTab === "meta" && <ParagraphMetadataTab data={data} />}
        </div>
    );
}
