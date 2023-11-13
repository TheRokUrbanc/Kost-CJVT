import { Fragment, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SearchType } from "@/app/[locale]/Search";
import { ParagraphData } from "@/data/paragraph";
import { isMatchingLemma } from "@/util/highlight.util";
import { decodeAna } from "@/util/parsing.util";
import { getSelectedWordError, punctuationRegex } from "@/util/util";
import { Word } from "@prisma/client";
import { clsx } from "clsx";

interface TabProps {
    data: ParagraphData;
    searchType: SearchType;
    currentLemma: string;
    sentenceId?: string;
}

export default function ParagraphCorrTab({ data, searchType, currentLemma, sentenceId }: TabProps) {
    const tCategory = useTranslations("Filters.Category");
    const tSchema = useTranslations("Filters.Schema");
    const corrParagraph = data.CorrParagraph;
    const errorTargetIds = useMemo(
        () =>
            data.OrigErrors.flatMap((e) => {
                let out = [];
                if (e.origWordId) out.push(e.origWordId);
                if (e.corrWordId) out.push(e.corrWordId);
                return out;
            }),
        [data],
    );
    const sentence = corrParagraph?.Sentences.find((s) => s.id === sentenceId);

    const generateWord = (w: Pick<Word, "id" | "ana" | "text" | "lemma">) => {
        const isTarget = errorTargetIds.includes("#" + w.id);
        const isLemma = isMatchingLemma(searchType, w, currentLemma);
        const isPunctuation = punctuationRegex.test(w.text);

        const dynamicClasses = clsx(isLemma && "font-bold", isTarget && "text-semantic-correct");

        if (isLemma || isTarget) {
            return (
                <Fragment key={w.id}>
                    {!isPunctuation && " "}
                    <span className={dynamicClasses}>{w.text}</span>
                </Fragment>
            );
        }

        return (
            <Fragment key={w.id}>
                {!isPunctuation && " "}
                {w.text}
            </Fragment>
        );
    };

    if (!corrParagraph) return <>No data</>;

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="flex flex-col gap-4 grow">
                <div className="bg-surface-static-secondary rounded-md p-4">
                    <p className="example text-justify">
                        {corrParagraph.Sentences.map((s) => s.Words.map(generateWord))}
                    </p>

                    <span className="caption text-light-grey">Popravljeno besedilo</span>
                </div>

                <div className="flex flex-col">
                    <div className="grid grid-cols-6 caption-emphasised bg-surface-static-secondary text-left">
                        <p className="p-4">Beseda</p>
                        <p className="p-4">Osnovna oblika</p>
                        <p className="p-4 col-span-3">Značilnosti osnovne oblike</p>
                        <p className="p-4">Tip popravka</p>
                    </div>

                    {sentence?.Words.map((w) => {
                        const wordError = getSelectedWordError(w.id, data.OrigErrors);

                        return (
                            <div key={w.id} className="grid grid-cols-6 caption odd:bg-surface-static-secondary">
                                <p className="p-4">{w.text}</p>
                                <p className="p-4">{w.lemma}</p>
                                <p className="p-4 col-span-3">{decodeAna(w.ana, tCategory, tSchema)}</p>
                                <p className="p-4">{wordError?.type ?? "/"}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
