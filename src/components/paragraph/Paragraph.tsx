"use client";

import { SyntheticEvent, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchType } from "@/app/[locale]/Search";
import ParagraphDetails from "@/components/paragraph/ParagraphDetails";
import { CONTEXT_WORD, EXPANDED_PARAGRAPH, SELECTED_TAB, SELECTED_WORD } from "@/constants";
import Concordance from "@/design-system/Concordance";
import { OrigParagraphQuery } from "@/types/query";
import { createUrl } from "@/util/util";

interface ParagraphProps {
    currentLemma: string;
    paragraph: OrigParagraphQuery;
    showOrig: boolean;
    showCorrect: boolean;
    highlight: boolean;
    center: boolean;
    cacheHeader: string | null;
}

export default function Paragraph({
    currentLemma,
    paragraph,
    showOrig,
    showCorrect,
    highlight,
    center,
    cacheHeader,
}: ParagraphProps) {
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const isOpen = useMemo(() => searchParams.get(EXPANDED_PARAGRAPH) == paragraph.id, [searchParams, paragraph]);
    const searchType = useMemo(() => (searchParams.get("type") ?? "basic") as SearchType, [searchParams]);

    const onToggle = (e: SyntheticEvent<HTMLDetailsElement, MouseEvent>) => {
        const newParams = new URLSearchParams(searchParams);
        if (e.currentTarget.open) {
            newParams.set(EXPANDED_PARAGRAPH, paragraph.id);
        } else {
            newParams.delete(SELECTED_TAB);
            newParams.delete(SELECTED_WORD);
        }

        router.replace(createUrl(path, newParams), { scroll: false });
    };

    const highlightedSentence = paragraph.Sentences.at(0);
    const highlightedCorrSentence = paragraph.CorrParagraph?.Sentences.at(0);

    if (!highlightedSentence) return;

    return (
        <details onToggle={onToggle} open={isOpen} className="even:bg-secondary">
            <summary className="list-none cursor-pointer">
                <Concordance
                    searchType={searchType}
                    currentLemma={currentLemma}
                    sentence={highlightedSentence}
                    corrSentence={highlightedCorrSentence}
                    contextWord={searchParams.get(CONTEXT_WORD)}
                    paragraphErrors={paragraph.OrigErrors}
                    showOrig={showOrig}
                    showCorrect={showCorrect}
                    highlight={highlight}
                    center={center}
                />
            </summary>

            {isOpen && (
                <ParagraphDetails
                    id={paragraph.id}
                    currentLemma={currentLemma}
                    cacheHeader={cacheHeader}
                    highlightedOrigSentenceId={highlightedSentence?.id}
                    highlightedCorrSentenceId={highlightedCorrSentence?.id}
                />
            )}

            {isOpen && <hr className="text-static-border mt-4" />}
        </details>
    );
}
