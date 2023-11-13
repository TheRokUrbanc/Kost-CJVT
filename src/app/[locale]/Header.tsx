"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import LangSwitcher from "@/app/[locale]/LangSwitcher";
import SwitcherIcon from "@/assets/icons/SwitcherIcon";
import cjvtLogo from "@/assets/images/cjvt-logo.svg";
import HeaderSearchBar from "@/components/HeaderSearchBar";
import OtherSources from "@/components/OtherSources";
import IconButton from "@/design-system/button/IconButton";
import TextButton from "@/design-system/button/TextButton";

interface HeaderProps {
    lemma?: string;
    showSearch?: boolean;
    showAllSources?: boolean;
}

export default function Header({ lemma, showSearch = false, showAllSources = false }: HeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations("Header");
    const decodedLemma = decodeURIComponent(lemma ?? "");

    return (
        <>
            <header className="px-8 py-2 bg-surface-static-emphasised">
                <div className="grid grid-cols-4 items-center container mx-auto">
                    <Link href={"/"}>
                        <Image src={cjvtLogo} alt="cjvt logo" />
                    </Link>

                    {showSearch && (
                        <div className="flex gap-2 col-span-2">
                            <Suspense>
                                <HeaderSearchBar placeholder={decodedLemma} />
                                <IconButton
                                    bg="light"
                                    shape="round"
                                    hiearchy="primary"
                                    size="medium"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <SwitcherIcon />
                                </IconButton>
                            </Suspense>
                        </div>
                    )}
                    {!showSearch && <div className="col-span-2" aria-hidden />}

                    <div className="justify-self-end flex items-center gap-2 text-white">
                        <TextButton
                            type="link"
                            href="https://www.cjvt.si/korpus-kost/"
                            bg="emphasised"
                            hiearchy="ghost"
                            size="medium"
                        >
                            {t("about")}
                        </TextButton>
                        <LangSwitcher />
                        {showAllSources && (
                            <TextButton
                                bg="light"
                                hiearchy="primary"
                                size="large"
                                leadingIcon={<SwitcherIcon />}
                                type="link"
                                href="https://viri.cjvt.si/"
                            >
                                {t("all-sources")}
                            </TextButton>
                        )}
                    </div>
                </div>
            </header>

            {isOpen && <OtherSources currentLemma={lemma} />}
        </>
    );
}
