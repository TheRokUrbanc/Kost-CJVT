"use client";

import { useMemo } from "react";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import ChevronLeftIcon from "@/assets/icons/ChevronLeftIcon";
import ChevronRightIcon from "@/assets/icons/ChevronRightIcon";
import OverflowMenuIcon from "@/assets/icons/OverflowMenuIcon";
import CopyButton from "@/components/CopyButton";
import IconButton from "@/design-system/button/IconButton";
import { OrigParagraphQuery, PaginatedResponse } from "@/types/query";
import { punctuationRegex } from "@/util/util";

const mergeQueryParams = (url: string, params: ReadonlyURLSearchParams) => {
    const urlObj = new URL(url, "https://example.com");

    const mergedSearchParams = new URLSearchParams(urlObj.searchParams);
    params.forEach((value, key) => {
        // If exists, don't overwrite
        if (mergedSearchParams.has(key)) return;
        mergedSearchParams.append(key, value);
    });

    return `${urlObj.pathname}?${mergedSearchParams.toString()}`;
};

type PaginateControlProps = {
    showOrig: boolean;
    showCorrect: boolean;
    showCopy?: boolean;
} & PaginatedResponse<OrigParagraphQuery[] | undefined>;

export default function PaginateControl({
    meta,
    links,
    data,
    showOrig,
    showCorrect,
    showCopy = true,
}: PaginateControlProps) {
    const params = useSearchParams();
    const prevPageLink = useMemo(() => mergeQueryParams(links.previous, params), [links, params]);
    const firstPageLink = useMemo(() => mergeQueryParams(links.first, params), [links, params]);
    const currentPageLink = useMemo(() => mergeQueryParams(links.current, params), [links, params]);
    const nextPageLink = useMemo(() => mergeQueryParams(links.next, params), [links, params]);
    const lastPageLink = useMemo(() => mergeQueryParams(links.last, params), [links, params]);

    const handleCopy = async () => {
        if (!data) return;
        let origOut: string[] = [];
        let corrOut: string[] = [];

        if (showOrig)
            origOut = data.flatMap((p) =>
                // @ts-expect-error - types issue for some reason
                p.Sentences.map((s) =>
                    // @ts-expect-error - types issue for some reason
                    s.Words.map((w, index) => {
                        return punctuationRegex.test(w.text) || index === 0 ? w.text : ` ${w.text}`;
                    }).join(""),
                ),
            );

        if (showCorrect)
            corrOut = data.flatMap(
                (p) =>
                    // @ts-expect-error - types issue for some reason
                    p.CorrParagraph?.Sentences.map((s) =>
                        // @ts-expect-error - types issue for some reason
                        s.Words.map((w, index) => {
                            return punctuationRegex.test(w.text) || index === 0 ? w.text : ` ${w.text}`;
                        }).join(""),
                    ) || [],
            );

        // Join orig and corr sentences by index
        let length = Math.max(origOut.length, corrOut.length);
        let output = [];
        for (let i = 0; i < length; i++) {
            if (showOrig) output.push(origOut.at(i));
            if (showCorrect) output.push(corrOut.at(i));
        }
        await navigator.clipboard.writeText(output.join("\n"));
    };

    return (
        <div className="flex border border-transparent">
            <div className="px-4 py-3 flex items-center gap-1 caption text-light-grey border-l border-static-border">
                <span className="text-grey">
                    {(meta.currentPage - 1) * 25 + 1}-{meta.currentPage * 25}
                </span>
                od
                <span className="text-grey">{meta.totalPages * 25}</span>
                konkordanc
            </div>

            <div className="px-4 flex items-center gap-1 border-l border-static-border">
                <IconButton type="link" href={prevPageLink} bg="light" shape="square" hiearchy="ghost" size="xsmall">
                    <ChevronLeftIcon />
                </IconButton>

                {meta.currentPage > 1 && (
                    <IconButton
                        type="link"
                        href={firstPageLink}
                        bg="light"
                        shape="square"
                        hiearchy="ghost"
                        size="xsmall"
                    >
                        1
                    </IconButton>
                )}

                {meta.currentPage !== meta.totalPages && (
                    <IconButton
                        type="link"
                        href={currentPageLink}
                        bg="light"
                        shape="square"
                        hiearchy="primary"
                        size="xsmall"
                    >
                        {meta.currentPage}
                    </IconButton>
                )}

                {meta.currentPage === 1 && (
                    <IconButton
                        type="link"
                        href={nextPageLink}
                        bg="light"
                        shape="square"
                        hiearchy="ghost"
                        size="xsmall"
                    >
                        {meta.currentPage + 1}
                    </IconButton>
                )}

                <IconButton type="button" bg="light" shape="square" hiearchy="secondary" size="xsmall">
                    <OverflowMenuIcon />
                </IconButton>

                <IconButton
                    type="link"
                    href={lastPageLink}
                    bg="light"
                    shape="square"
                    hiearchy={meta.currentPage === meta.totalPages ? "primary" : "ghost"}
                    size="xsmall"
                >
                    {meta.totalPages}
                </IconButton>

                <IconButton type="link" href={nextPageLink} bg="light" shape="square" hiearchy="ghost" size="xsmall">
                    <ChevronRightIcon />
                </IconButton>
            </div>

            {showCopy && (
                <div className="pl-3 pr-4 flex items-center border-l border-static-border">
                    <CopyButton onClick={handleCopy} />
                </div>
            )}
        </div>
    );
}
