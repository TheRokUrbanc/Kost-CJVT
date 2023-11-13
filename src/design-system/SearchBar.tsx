"use client";

import { SearchType } from "@/app/[locale]/Search";
import SearchIcon from "@/assets/icons/SearchIcon";
import ZoomResetIcon from "@/assets/icons/ZoomResetIcon";
import { clsx } from "clsx";

interface SearchBarProps {
    placeholder?: string;
    roundTopLeft?: boolean;
    searchType: SearchType;
}

export default function SearchBar({ placeholder = "Search", roundTopLeft = true, searchType }: SearchBarProps) {
    const formClasses = clsx(
        "px-4 py-3 flex gap-4 justify-between items-center bg-white rounded",
        roundTopLeft === false && "rounded-tl-none",
    );

    return (
        <div className={formClasses}>
            {searchType === "collocations" && (
                <select className="bg-white p-1" name="leftDistance">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option selected={true} value="3">
                        3
                    </option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            )}
            <span className="h-5 w-5 flex items-center fill-light-grey">
                <SearchIcon />
            </span>
            <input
                name="search-string"
                placeholder={placeholder}
                className="w-full focus:outline-none placeholder:font-light placeholder:tracking-wide text-lg"
            />
            {searchType === "collocations" && (
                <select className="bg-white p-1" name="rightDistance">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option selected={true} value="3">
                        3
                    </option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            )}
            <button type="submit">
                <ZoomResetIcon />
            </button>
        </div>
    );
}
