import { Suspense } from "react";
import { useLocale } from "next-intl";
import { unstable_cache } from "next/cache";
import ViewControl from "@/app/[locale]/[lemma]/ViewControl";
import Paragraph from "@/components/paragraph/Paragraph";
import { RawSearchFilters, getPaginatedOrigParagraphs, parseRawFilters } from "@/data/search";
import PaginateControl from "@/design-system/PaginateControl";

interface SearchResultsProps {
    currentLemma: string;
    cacheHeader: string | null;
    searchParams: RawSearchFilters;
}

const cachedPaginatedOrigParagraphs = unstable_cache((locale, currentLemma, parsedFilters) =>
    getPaginatedOrigParagraphs(locale, currentLemma, parsedFilters),
);

export default async function SearchResults({ currentLemma, cacheHeader, searchParams }: SearchResultsProps) {
    const locale = useLocale();

    const parsedFilters = parseRawFilters(searchParams);
    const response = await cachedPaginatedOrigParagraphs(locale, currentLemma, parsedFilters);

    return (
        <div className="bg-white rounded overflow-hidden col-span-3 flex flex-col justify-between">
            <div className="flex justify-between border-b border-static-border">
                <Suspense>
                    <ViewControl />

                    <PaginateControl
                        meta={response.meta}
                        links={response.links}
                        data={response.data}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                    />
                </Suspense>
            </div>

            <div className="grow">
                <Suspense>
                    {response.data.map((paragraph) => (
                        <Paragraph
                            key={paragraph.id}
                            currentLemma={currentLemma}
                            paragraph={paragraph}
                            showOrig={parsedFilters.showOrig}
                            showCorrect={parsedFilters.showCorrect}
                            highlight={parsedFilters.highlightErrors}
                            center={parsedFilters.center}
                            cacheHeader={cacheHeader}
                        />
                    ))}
                </Suspense>
            </div>

            <div className="flex justify-end py-2">
                <Suspense>
                    <PaginateControl
                        meta={response.meta}
                        links={response.links}
                        data={response.data}
                        showOrig={parsedFilters.showOrig}
                        showCorrect={parsedFilters.showCorrect}
                    />
                </Suspense>
            </div>
        </div>
    );
}
