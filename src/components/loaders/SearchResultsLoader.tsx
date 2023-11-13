import { Suspense } from "react";
import ViewControl from "@/app/[locale]/[lemma]/ViewControl";

export default function SearchResultsLoader() {
    const getLine = (i: number) => (
        <div key={i} className="border-b border-static-border px-4">
            <div className="animate-pulse bg-secondary h-6 my-3 rounded-md" />
        </div>
    );

    return (
        <div className="bg-white rounded overflow-hidden col-span-3 flex flex-col justify-between">
            <div className="flex justify-between border-b border-static-border">
                <Suspense>
                    <ViewControl />
                </Suspense>
            </div>

            <div className="grow">{Array.from({ length: 25 }, (_, i) => i).map(getLine)}</div>
        </div>
    );
}
