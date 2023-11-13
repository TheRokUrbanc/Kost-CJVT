import { ReactNode, Suspense } from "react";
import Header from "@/app/[locale]/Header";
import SearchInfo from "@/app/[locale]/[lemma]/SearchInfo";
import SpeakerLangFilter from "@/components/filters/SpeakerLangFilter";
import TextsFilter from "@/components/filters/TextsFilter";
import { getBiblFilters } from "@/data/filters";
import { ParsedSearchFilters } from "@/data/search";

interface LayoutProps {
    params: {
        lemma: string;
    };
    children: ReactNode;
}

export default function Layout({ params, children }: LayoutProps) {
    const decodedLemma = decodeURIComponent(params.lemma);

    return (
        <>
            <Header showSearch={true} lemma={params.lemma} />
            <div className="pb-24 bg-surface-static-secondary">
                <div className="bg-white shadow-tiny">
                    <div className="py-4 px-8 md:px-0 flex flex-col gap-2 container mx-auto">
                        <h1 className="text-surface-static-emphasised text-2xl font-bold">{decodedLemma}</h1>

                        <Suspense>
                            <SearchInfo />
                        </Suspense>
                    </div>

                    <hr className="text-static-border" />

                    <div className="py-2 px-8 md:px-0 flex gap-4 container mx-auto">
                        <TextsFilter bg="light" size="small" />
                        <Suspense>
                            <SpeakerLangWrapper />
                        </Suspense>
                    </div>
                </div>

                {children}
            </div>
        </>
    );
}

async function SpeakerLangWrapper() {
    const filters = await getBiblFilters("FirstLang", {} as ParsedSearchFilters);
    return <SpeakerLangFilter bg="light" size="small" filters={filters} />;
}
