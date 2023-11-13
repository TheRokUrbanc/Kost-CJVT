import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { unstable_cache } from "next/cache";
import ErrorFiltersList from "@/components/ErrorFiltersList";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import {
    FIRST_LANG_FILTER,
    INPUT_TYPE_FILTER,
    PROFIC_SLV_FILTER,
    PROGRAM_TYPE_FILTER,
    TASK_SETTING_FILTER,
} from "@/constants";
import { getBiblFilters } from "@/data/filters";
import { ParsedSearchFilters, RawSearchFilters, parseRawFilters } from "@/data/search";
import AsyncFilterableList from "@/design-system/filterable-list/AsyncFilterableList";

interface FiltersSidebarProps {
    searchParams: RawSearchFilters;
    currentLemma: string;
}

const cachedFirstLangFilters = unstable_cache((parsedFilters: ParsedSearchFilters, lemma: string) =>
    getBiblFilters("FirstLang", parsedFilters, true, lemma),
);
const cachedTaskSettingFilters = unstable_cache((parsedFilters: ParsedSearchFilters, lemma: string) =>
    getBiblFilters("TaskSetting", parsedFilters, true, lemma),
);
const cachedProficSlvFilters = unstable_cache((parsedFilters: ParsedSearchFilters, lemma: string) =>
    getBiblFilters("ProficSlv", parsedFilters, true, lemma),
);
const cachedProgramTypeFilters = unstable_cache((parsedFilters: ParsedSearchFilters, lemma: string) =>
    getBiblFilters("ProgramType", parsedFilters, true, lemma),
);
const cachedInputTypeFilters = unstable_cache((parsedFilters: ParsedSearchFilters, lemma: string) =>
    getBiblFilters("InputType", parsedFilters, true, lemma),
);

export default function FiltersSidebar({ searchParams, currentLemma }: FiltersSidebarProps) {
    const parsedFilters = parseRawFilters(searchParams);

    return (
        <Suspense>
            <FirstLangFilter parsedFilters={parsedFilters} currentLemma={currentLemma} />
            <TaskSettingFilter parsedFilters={parsedFilters} currentLemma={currentLemma} />
            <ProficSlvFilter parsedFilters={parsedFilters} currentLemma={currentLemma} />
            <ProgramTypeFilter parsedFilters={parsedFilters} currentLemma={currentLemma} />
            <InputTypeFilter parsedFilters={parsedFilters} currentLemma={currentLemma} />
            <ErrorFiltersList parsedFilters={parsedFilters} />
        </Suspense>
    );
}

interface FilterProps {
    parsedFilters: ParsedSearchFilters;
    currentLemma: string;
}

function FirstLangFilter({ parsedFilters, currentLemma }: FilterProps) {
    const t = useTranslations("SearchResults.filters");
    const title = t("first-lang");

    return (
        <Suspense fallback={<FilterListLoader title={title} />}>
            <AsyncFilterableList
                asyncFilterItems={cachedFirstLangFilters(parsedFilters, currentLemma)}
                paramName={FIRST_LANG_FILTER}
                title={title}
                showRel={parsedFilters.showRelative}
            />
        </Suspense>
    );
}

function TaskSettingFilter({ parsedFilters, currentLemma }: FilterProps) {
    const t = useTranslations("SearchResults.filters");
    const title = t("task-setting");
    return (
        <Suspense fallback={<FilterListLoader title={title} />}>
            <AsyncFilterableList
                asyncFilterItems={cachedTaskSettingFilters(parsedFilters, currentLemma)}
                paramName={TASK_SETTING_FILTER}
                title={title}
                showRel={parsedFilters.showRelative}
            />
        </Suspense>
    );
}

function ProficSlvFilter({ parsedFilters, currentLemma }: FilterProps) {
    const t = useTranslations("SearchResults.filters");
    const title = t("profic-slv");
    return (
        <Suspense fallback={<FilterListLoader title={title} />}>
            <AsyncFilterableList
                asyncFilterItems={cachedProficSlvFilters(parsedFilters, currentLemma)}
                paramName={PROFIC_SLV_FILTER}
                title={title}
                showRel={parsedFilters.showRelative}
            />
        </Suspense>
    );
}

function ProgramTypeFilter({ parsedFilters, currentLemma }: FilterProps) {
    const t = useTranslations("SearchResults.filters");
    const title = t("program-type");
    return (
        <Suspense fallback={<FilterListLoader title={title} />}>
            <AsyncFilterableList
                asyncFilterItems={cachedProgramTypeFilters(parsedFilters, currentLemma)}
                paramName={PROGRAM_TYPE_FILTER}
                title={title}
                showRel={parsedFilters.showRelative}
            />
        </Suspense>
    );
}

function InputTypeFilter({ parsedFilters, currentLemma }: FilterProps) {
    const t = useTranslations("SearchResults.filters");
    const title = t("input-type");
    return (
        <Suspense fallback={<FilterListLoader title={title} />}>
            <AsyncFilterableList
                asyncFilterItems={cachedInputTypeFilters(parsedFilters, currentLemma)}
                paramName={INPUT_TYPE_FILTER}
                title={title}
                showRel={parsedFilters.showRelative}
            />
        </Suspense>
    );
}
