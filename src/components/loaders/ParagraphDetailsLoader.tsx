import ParagraphCompareTab from "@/components/paragraph/ParagraphCompareTab";
import ParagraphCorrTab from "@/components/paragraph/ParagraphCorrTab";
import ParagraphSourceTab from "@/components/paragraph/ParagraphSourceTab";
import TextButton from "@/design-system/button/TextButton";

export default function ParagraphDetailsLoader() {
    return (
        <div className="bg-white">
            <h4 className="px-4 py-4 text-surface-static-emphasised body-2-title border-b border-static-border">
                Korpusni podatki
            </h4>
            <div className="px-4 py-3 flex gap-1">
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
                <div className="bg-secondary animate-pulse rounded-3xl h-9 w-32" />
            </div>

            <div className="px-4 flex gap-4 justify-between">
                <div className="flex flex-col gap-4 grow">
                    <div className="bg-secondary animate-pulse rounded-md h-36 p-4"></div>
                    <div className="bg-secondary animate-pulse rounded-md h-36 p-4"></div>
                </div>

                <div className="flex flex-col gap-4 w-32">
                    <div className="bg-secondary animate-pulse rounded-md p-4 flex flex-col justify-between h-28" />
                    <div className="bg-secondary animate-pulse rounded-md px-4 grow flex gap-8" />
                </div>
            </div>
        </div>
    );
}
