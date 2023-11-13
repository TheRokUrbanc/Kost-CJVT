import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { headers } from "next/headers";
import FiltersSidebar from "@/app/[locale]/[lemma]/FiltersSidebar";
import SearchResults from "@/app/[locale]/[lemma]/SearchResults";
import InformationIcon from "@/assets/icons/InformationIcon";
import UnitFormatWrapper from "@/components/UnitFormatWrapper";
import SearchResultsLoader from "@/components/loaders/SearchResultsLoader";
import { RawSearchFilters } from "@/data/search";
import IconButton from "@/design-system/button/IconButton";

interface PageProps {
    params: {
        lemma: string;
    };
    searchParams: {} & RawSearchFilters;
}

export default function Page({ params, searchParams }: PageProps) {
    const t = useTranslations("SearchResults");
    const currentLemma = decodeURIComponent(params.lemma);
    const headersList = headers();
    const cacheHeader = headersList.get("cache-control");

    return (
        <div className="m-8 gap-x-8 grid grid-cols-4 container mx-auto">
            <div className="bg-white rounded pb-6">
                <div className="flex justify-between items-center">
                    <h3 className="body-2-title text-surface-static-emphasised ml-4">{t("filters-title")}</h3>

                    <div className="flex items-center">
                        <UnitFormatWrapper searchParams={searchParams} />

                        <div className="px-4 py-2 border-l border-surface-static-secondary">
                            <IconButton bg="light" shape="square" hiearchy="secondary" size="xsmall">
                                <InformationIcon />
                            </IconButton>
                        </div>
                    </div>
                </div>

                <Suspense>
                    <FiltersSidebar searchParams={searchParams} currentLemma={currentLemma} />
                </Suspense>
            </div>

            <Suspense fallback={<SearchResultsLoader />}>
                <SearchResults currentLemma={currentLemma} searchParams={searchParams} cacheHeader={cacheHeader} />
            </Suspense>
        </div>
    );
}
