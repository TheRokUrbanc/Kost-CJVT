import { ReadonlyURLSearchParams } from "next/navigation";
import { Err } from "@prisma/client";

export const punctuationRegex = /^[!"#$%&'*+,-./:;<=>?@^_`{|}~]/g;
export const sanitizeRegex = /[^\w ?*ščžćđ\[\]]/g;

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
    const paramsString = params.toString();
    const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

    return `${pathname}${queryString}`;
};

export const sanitizeLemma = (lemma: string) => {
    return lemma.replace(sanitizeRegex, "");
};

export const getSelectedWordError = (id: string | null, errs: Err[]) => {
    if (!id) return null;
    return errs.find((e) => e.origWordId === id || e.corrWordId === id);
};
