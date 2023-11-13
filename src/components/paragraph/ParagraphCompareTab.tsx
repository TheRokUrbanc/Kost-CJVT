import { Fragment, MouseEvent, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchType } from "@/app/[locale]/Search";
import { SELECTED_WORD } from "@/constants";
import { ParagraphData } from "@/data/paragraph";
import { isMatchingLemma } from "@/util/highlight.util";
import { createUrl, getSelectedWordError, punctuationRegex } from "@/util/util";
import { Word } from "@prisma/client";
import { clsx } from "clsx";
import { Pick } from "prisma/prisma-client/runtime/library";

interface TabProps {
    data: ParagraphData;
    searchType: SearchType;
    currentLemma: string;
}

export default function ParagraphCompareTab({ data, searchType, currentLemma }: TabProps) {
    const tMeta = useTranslations("Metadata");
    const tErrs = useTranslations("ErrorCodes");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();

    const errorTargetIds =
        data.OrigErrors?.flatMap((e) => {
            let out = [];
            if (e.origWordId) out.push(e.origWordId);
            if (e.corrWordId) out.push(e.corrWordId);
            return out;
        }) ?? [];

    const selectedWordError = useMemo(
        () => getSelectedWordError(searchParams.get(SELECTED_WORD), data.OrigErrors ?? []),
        [searchParams, data],
    );

    const onWordClick = (e: MouseEvent<HTMLButtonElement>) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(SELECTED_WORD, e.currentTarget.getAttribute("data-id")!);
        router.replace(createUrl(path, newParams), { scroll: false });
    };

    const generateWord = (w: Pick<Word, "id" | "lemma" | "text">, type: "orig" | "corr") => {
        const isTarget = errorTargetIds.includes(w.id);
        const isLemma = isMatchingLemma(searchType, w, currentLemma);
        const isPunctuation = punctuationRegex.test(w.text);

        const dynamicClasses = clsx(
            isLemma && "font-bold",
            isTarget && "underline",
            isTarget && type === "orig" && "text-semantic-error",
            isTarget && type === "corr" && "text-semantic-correct",
        );

        if (isTarget) {
            return (
                <Fragment key={w.id}>
                    {!isPunctuation && " "}
                    <button className={dynamicClasses} data-id={w.id} onClick={onWordClick}>
                        {w.text}
                    </button>
                </Fragment>
            );
        }

        if (isLemma) {
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

    const mappedErrType = useMemo(() => selectedWordError?.type.split("|") ?? ["[???]"], [selectedWordError]);
    const selectedWordData = useMemo(() => {
        if (!selectedWordError) return null;
        const origIds = selectedWordError.origWordId;
        const corrIds = selectedWordError.corrWordId;

        const origSentenceId = origIds?.slice(0, -4);
        const corrSentenceId = corrIds?.slice(0, -4);

        const origWords =
            data.Sentences.find((s) => s.id === origSentenceId)?.Words.filter((w) => origIds === w.id) ?? [];
        const corrWords =
            data.CorrParagraph?.Sentences.find((s) => s.id === corrSentenceId)?.Words.filter((w) => corrIds === w.id) ??
            [];

        return { origWords, corrWords };
    }, [selectedWordError, data]);

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="flex flex-col gap-4 grow">
                <div className="flex flex-col justify-between grow bg-surface-static-secondary rounded-md p-4 min-h-[8rem]">
                    <p className="example text-justify">
                        {data.Sentences.map((s) => s.Words.map((w) => generateWord(w, "orig")))}
                    </p>

                    <span className="caption text-light-grey mt-4">Izvorno besedilo</span>
                </div>

                <div className="flex flex-col justify-between grow bg-surface-static-secondary rounded-md p-4 min-h-[8rem]">
                    <p className="example text-justify">
                        {data.CorrParagraph?.Sentences.map((s) => s.Words.map((w) => generateWord(w, "corr")))}
                    </p>
                    <span className="caption text-light-grey mt-4">Popravljeno besedilo</span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-surface-static-secondary rounded-md p-4 flex flex-col justify-between h-40">
                    <h5 className="caption text-light-grey">Tip napake</h5>

                    <div className="mt-2 grow flex flex-col justify-center">
                        <p className="text-semantic-error mb-3 body-2 h-5">
                            {selectedWordData?.origWords.map((w) =>
                                punctuationRegex.test(w.text) ? "" : " " + w.text,
                            )}
                        </p>
                        <p className="text-semantic-correct mb-3 body-2 h-5">
                            {selectedWordData?.corrWords.map((w) =>
                                punctuationRegex.test(w.text) ? "" : " " + w.text,
                            )}
                        </p>
                        <p className="caption">
                            {mappedErrType
                                .map((e) => {
                                    // @ts-expect-error - can't cast to lang type
                                    const er = tErrs.raw(e);

                                    return capitalize(er.category) + ": " + er.name;
                                })
                                .join(" | ")}
                        </p>
                    </div>
                </div>

                <div className="bg-surface-static-secondary rounded-md p-4 grow flex gap-6">
                    <div className="flex flex-col gap-4">
                        <MetaEntry title={tMeta("topic")} value={data.Bibl.Topic} />
                        <MetaEntry title={tMeta("academicYear")} value={data.Bibl.AcademicYear} />
                        <MetaEntry title={tMeta("taskSetting")} value={data.Bibl.TaskSetting} />
                    </div>

                    <div className="flex flex-col gap-4">
                        <MetaEntry title={tMeta("proficSlv")} value={data.Bibl.ProficSlv} />
                        <MetaEntry title={tMeta("programType")} value={data.Bibl.ProgramType} />
                        <MetaEntry title={tMeta("inputType")} value={data.Bibl.InputType} />
                        <MetaEntry title={tMeta("firstLang")} value={data.Bibl.FirstLang} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaEntry({ title, value }: { title: string; value: string | null }) {
    return (
        <div className="flex flex-col gap-1">
            <h5 className="caption !font-light text-light-grey">{title}</h5>
            <span className="caption text-grey">{value || "/"}</span>
        </div>
    );
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
