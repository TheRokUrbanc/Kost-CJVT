import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Header from "@/app/[locale]/Header";
import Search from "@/app/[locale]/Search";
import Stats from "@/design-system/Stats";

export default function Home() {
    const t = useTranslations("Index");
    return (
        <>
            <Header showAllSources={true} />

            <main className="bg-surface-static-emphasised">
                <div className="container mx-auto mb-24">
                    <div className="flex flex-col gap-4 text-white text-2xl pb-16 pt-24">
                        <h1 className="font-bold">{t("title")}</h1>
                        <h2 className="font-light tracking-wider">{t("subtitle")}</h2>
                    </div>

                    <Suspense>
                        <Search />
                    </Suspense>

                    <div className="grid grid-cols-4 gap-8 pt-20 pb-24">
                        <Stats title={t("stats.texts")} value="155,534" />
                        <Stats title={t("stats.words")} value="6,955,534" />
                        <Stats title={t("stats.texts")} value="155,534" />
                        <Stats title={t("stats.words")} value="355,534" />
                    </div>
                </div>
            </main>
        </>
    );
}
