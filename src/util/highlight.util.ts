import { SearchType } from "@/app/[locale]/Search";
import { Word } from "@prisma/client";

export type SmolWord = Pick<Word, "id" | "text" | "lemma">;

export const getListSearchRegex = (currentLemma: string) => {
    const highlightRegex = currentLemma.replaceAll("*", ".*").replace("?", ".");
    return new RegExp(highlightRegex, "i");
};

export const isMatchingLemma = (searchType: SearchType, word: SmolWord, currentLemma: string) => {
    if (searchType === "basic") {
        return word.lemma === currentLemma;
    }

    if (searchType === "collocations") {
        throw new Error("Not implemented");
    }

    if (searchType === "list") {
        const regex = getListSearchRegex(currentLemma);
        return regex.test(word.text);
    }

    return false;
};
