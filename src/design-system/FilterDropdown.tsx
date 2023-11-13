"use client";

import { ReactNode, useState } from "react";
import { clsx } from "clsx";

interface FilterDropdownProps {
    bg: "light" | "emphasised";
    hiearchy?: "primary" | "ghost";
    size: "xsmall" | "small" | "medium" | "large";
    isActive?: boolean;
    label: string;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    onTrailingIconClick?: () => void;
    children: ReactNode;
}

export default function FilterDropdown({
    bg,
    hiearchy = "primary",
    size,
    isActive = false,
    label,
    leadingIcon,
    trailingIcon,
    onTrailingIconClick,
    children,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = (e: any) => {
        setIsOpen(e.target.open);
    };

    const dynamicClasses = clsx(
        hiearchy === "primary" && bg === "light" && "border-surface-static-border",
        bg === "light" && "text-grey fill-grey hover:text-black hover:fill-black",
        bg === "light" &&
            isActive &&
            "text-surface-static-emphasised fill-surface-static-emphasised border-surface-static-emphasised hover:text-surface-static-emphasised hover:fill-surface-static-emphasised",
        bg === "emphasised" && "text-white fill-white",
        bg === "emphasised" && isActive && "border-white hover:border-white",
        hiearchy === "primary" && bg === "emphasised" && "border-primary-emphasised-disabled hover:border-white",
        hiearchy === "ghost" &&
            bg === "emphasised" &&
            "hover:bg-ghost-hover !border-transparent hover:border-transparent",
        size === "xsmall" && "p-1.5 caption-emphasised !leading-none gap-1",
        size === "small" && "p-2.5 caption-emphasised gap-1.5",
        size === "medium" && "px-3.5 py-3 body-2-title gap-2",
        size === "large" && "px-5 py-3.5 body-2-title gap-2",
    );

    const dynamicIconClasses = clsx(
        "transition-all duration-200",
        size === "xsmall" && "w-3 h-3",
        size === "small" && "w-4 h-4",
        size === "medium" && "w-5 h-5",
        size === "large" && "w-5 h-5",
        isOpen && "transform rotate-180",
    );

    const placeholder = <span className="w-0.5" aria-hidden />;

    const trailingClickHandler = () => {
        setIsOpen(false);
        if (onTrailingIconClick) onTrailingIconClick();
    };

    return (
        <details className="relative" onToggle={handleToggle} open={isOpen}>
            <summary
                className={`inline-flex cursor-pointer items-center gap-2 shrink-0 rounded-4xl bg-transparent border select-none transition-all duration-200 ${dynamicClasses}`}
            >
                {leadingIcon ? <span className={dynamicIconClasses}>{leadingIcon}</span> : placeholder}
                <span>{label}</span>
                {trailingIcon ? (
                    <button onClick={trailingClickHandler} className={dynamicIconClasses}>
                        {trailingIcon}
                    </button>
                ) : (
                    placeholder
                )}
            </summary>

            <ul className="absolute z-10 min-w-full w-max mt-1 rounded shadow-lg">{children}</ul>
        </details>
    );
}
