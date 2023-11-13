"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CONTEXT_WORD, LEFT_DISTANCE, RIGHT_DISTANCE } from "@/constants";
import { Link } from "@/navigation";

interface CollocationEntryProps {
    locale: string;
    currentLemma: string;
    text: string;
    count: number;
}

export default function CollocationEntry({ locale, currentLemma, text, count }: CollocationEntryProps) {
    const searchParams = useSearchParams();
    const href = useMemo(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(CONTEXT_WORD, text);
        newParams.delete("page");
        newParams.delete(LEFT_DISTANCE);
        newParams.delete(RIGHT_DISTANCE);
        return `/${locale}/${currentLemma}?${newParams.toString()}`;
    }, [currentLemma, text, locale, searchParams]);

    return (
        <Link
            href={href}
            className="px-4 py-3 border-r border-b border-l border-static-border grid grid-cols-2 group hover:bg-secondary transition-all duration-200"
        >
            <div className="group-hover:text-surface-static-emphasised">{text}</div>
            <div className="group-hover:text-surface-static-emphasised text-grey">{count}</div>
        </Link>
    );
}
