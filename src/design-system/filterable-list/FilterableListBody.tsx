import { useFormatter } from "next-intl";
import CheckBoxIcon from "@/assets/icons/CheckBoxIcon";
import CheckedBoxIcon from "@/assets/icons/CheckedBoxIcon";

interface FilterableListBodyProps {
    label: string;
    freq: number;
    isActive?: boolean;
    onClick?: (name: string) => void;
}

export default function FilterableListBody({ label, freq, isActive, onClick }: FilterableListBodyProps) {
    const formatter = useFormatter();

    const clickHandler = () => {
        if (!onClick) return;
        onClick(label);
    };

    return (
        <button
            className="px-4 py-1 w-full text-grey flex items-center justify-between transition-all duration-200 hover:bg-secondary"
            onClick={clickHandler}
        >
            <div className="flex items-center gap-2">
                <span className="w-4 h-4">{isActive ? <CheckedBoxIcon /> : <CheckBoxIcon />}</span>
                <span className="callout">{label}</span>
            </div>

            {freq !== -1 && (
                <span className="caption text-grey">{formatter.number(freq, { maximumFractionDigits: 2 })}</span>
            )}
        </button>
    );
}
