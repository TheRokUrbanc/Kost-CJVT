import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import cjvt from "@/assets/images/cjvt-logo-red.svg";
import clarin from "@/assets/images/clarin-logo.svg";
import rsMzk from "@/assets/images/rs-mzk.svg";
import uniLJ from "@/assets/images/unilj-logo.svg";
import { clsx } from "clsx";

export default function Footer() {
    const t = useTranslations("Footer");

    return (
        <footer className="bg-footer text-white px-8 pb-12 min-h-[14rem]">
            <ul className="grid grid-cols-6">
                <FooterCell>
                    <Image src={uniLJ} alt="Univerza v Ljubljani" />
                </FooterCell>

                <FooterCell title={t("manager")}>
                    <Image src={cjvt} alt={t("cjvt")} />
                </FooterCell>

                <FooterCell title={t("source-info")}>
                    info@cjvt.si
                    <br />
                    {t("cjvt")}
                </FooterCell>

                <FooterCell title={t("accessibility.title")}>{t("accessibility.body")}</FooterCell>

                <FooterCell title={t("support")}>
                    <Image src={clarin} alt="CLARIN" />
                </FooterCell>

                <FooterCell>
                    <Image src={rsMzk} alt="Ministrstvo za Kulturo" />
                </FooterCell>
            </ul>
        </footer>
    );
}

const FooterCell = ({ title, children }: { title?: string; children: ReactNode }) => {
    const dynamicClasses = clsx(`
        ${title ? "grid-rows-[2.5rem_1fr]" : "grid-rows-1"}
    `);

    const dynamicBodyClasses = clsx(`
        ${title ? "items-start justify-start" : "items-center justify-center"}    
    `);

    return (
        <li className={`grid grid-cols-1 p-4 border-l border-static-border ${dynamicClasses}`}>
            {title && <h5 className="body-2-title">{title}</h5>}
            <div className={`text-light-grey body-2 !font-light flex ${dynamicBodyClasses}`}>{children}</div>
        </li>
    );
};
