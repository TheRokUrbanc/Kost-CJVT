import { Suspense } from "react";
import { useLocale } from "next-intl";
import { getTranslator } from "next-intl/server";
import { unstable_cache } from "next/cache";
import CollocationEntry from "@/app/[locale]/[lemma]/collocation/CollocationEntry";
import { getPaginatedCollocations } from "@/data/collocation";
import { RawSearchFilters, parseRawFilters } from "@/data/search";
import PaginateControl from "@/design-system/PaginateControl";

interface CollocationResultsProps {
    currentLemma: string;
    searchParams: RawSearchFilters;
}

const cachedCollocationResults = unstable_cache((locale, currentLemma, parsedFilters) =>
    getPaginatedCollocations(locale, currentLemma, parsedFilters),
);

export default async function CollocationResults({ currentLemma, searchParams }: CollocationResultsProps) {
    const locale = useLocale();
    const t = await getTranslator(locale, "Collocation");

    const parsedFilters = parseRawFilters(searchParams);
    const response = await cachedCollocationResults(locale, currentLemma, parsedFilters);

    return (
        <div className="bg-white rounded overflow-hidden col-span-3 flex flex-col justify-between">
            <div className="flex justify-end py-1 border-b border-static-border">
                <Suspense>
                    <PaginateControl
                        meta={response.meta}
                        links={response.links}
                        data={undefined}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                        showCopy={false}
                    />
                </Suspense>
            </div>

            <div className="grow w-full">
                <div className="px-4 py-3 border-r border-b border-l border-static-border grid grid-cols-2">
                    <p className="body-2-title">{t("table.words")}</p>
                    <p className="body-2-title">{t("table.count")}</p>
                </div>
                {response.data.map(([text, count]) => (
                    <CollocationEntry
                        key={text}
                        text={text}
                        count={count}
                        currentLemma={currentLemma}
                        locale={locale}
                    />
                ))}
            </div>

            <div className="flex justify-end py-2">
                <Suspense>
                    <PaginateControl
                        meta={response.meta}
                        links={response.links}
                        data={undefined}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                        showCopy={false}
                    />
                </Suspense>
            </div>
        </div>
    );
}
