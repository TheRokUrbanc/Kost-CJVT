"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AlignHorizontalCenterIcon from "@/assets/icons/AlignHorizontalCenterIcon";
import AlignLeftIcon from "@/assets/icons/AlignLeftIcon";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";
import CorrectErrorIcon from "@/assets/icons/CorrectErrorIcon";
import { CENTER_CONCORDANCE, HIGHLIGHT_ERRORS, SEARCH_SOURCE, SHOW_CORRECT, SHOW_ORIG } from "@/constants";
import { parseSearchSource } from "@/data/search";
import ContentSwitcher from "@/design-system/ContentSwitcher";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";
import { createUrl } from "@/util/util";
import { TextSource } from "@prisma/client";

export default function ViewControl() {
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const isSourceChecked = useMemo(() => searchParams.get(SHOW_ORIG) == "true", [searchParams]);
    const isCorrectChecked = useMemo(() => searchParams.get(SHOW_CORRECT) == "true", [searchParams]);
    const isHighlightErrorsChecked = useMemo(() => searchParams.get(HIGHLIGHT_ERRORS) == "true", [searchParams]);
    const isCenterChecked = useMemo(() => searchParams.get(CENTER_CONCORDANCE) == "true", [searchParams]);
    const searchSource = useMemo(() => parseSearchSource(searchParams.get(SEARCH_SOURCE)), [searchParams]);

    const handleSourceClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get(SHOW_ORIG) == "true") newParams.delete(SHOW_ORIG);
        else newParams.set(SHOW_ORIG, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleCorrectedClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get(SHOW_CORRECT) == "true") newParams.delete(SHOW_CORRECT);
        else newParams.set(SHOW_CORRECT, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleHighlightErrorsClick = () => {
        const newParams = new URLSearchParams(searchParams);
        if (newParams.get(HIGHLIGHT_ERRORS) == "true") newParams.delete(HIGHLIGHT_ERRORS);
        else newParams.set(HIGHLIGHT_ERRORS, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleLeftAlignClick = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(CENTER_CONCORDANCE);
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    const handleCenterAlignClick = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(CENTER_CONCORDANCE, "true");
        router.replace(createUrl(pathName, newParams), { scroll: false });
    };

    return (
        <div className="flex">
            <div className="px-4 py-2">
                <ContentSwitcher
                    name="left"
                    position="left"
                    isActive={!isCenterChecked}
                    icon={<AlignLeftIcon />}
                    onClick={handleLeftAlignClick}
                />
                <ContentSwitcher
                    name="right"
                    position="right"
                    isActive={isCenterChecked}
                    icon={<AlignHorizontalCenterIcon />}
                    onClick={handleCenterAlignClick}
                />
            </div>

            <div className="flex gap-1 items-center px-4 py-2 border-l border-r border-static-border">
                <TextButton
                    bg="light"
                    hiearchy={isSourceChecked ? "primary" : "secondary"}
                    size="small"
                    trailingIcon={isSourceChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    onClick={handleSourceClick}
                    disabled={searchSource === TextSource.ORIG}
                >
                    Izvorno
                </TextButton>

                <TextButton
                    bg="light"
                    hiearchy={isCorrectChecked ? "primary" : "secondary"}
                    size="small"
                    trailingIcon={isCorrectChecked ? <CheckedBoxIcon /> : <CheckBoxIcon />}
                    onClick={handleCorrectedClick}
                    disabled={searchSource === TextSource.CORR}
                >
                    Popravljeno
                </TextButton>
            </div>

            <div className="flex items-center px-4">
                <IconButton
                    bg="light"
                    shape="square"
                    hiearchy={isHighlightErrorsChecked ? "primary" : "secondary"}
                    size="xsmall"
                    onClick={handleHighlightErrorsClick}
                >
                    <CorrectErrorIcon />
                </IconButton>
            </div>
        </div>
    );
}
