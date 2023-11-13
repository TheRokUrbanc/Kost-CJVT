import { advFiltersSchema } from "@/components/adv-search/config";

export const parsePageNumber = (number: string | null): number => {
    const parsedNumber = Number(number);
    if (isNaN(parsedNumber) || parsedNumber < 1) return 1;
    return parsedNumber;
};

export const decodeAna = (ana: string, tCategory: any, tSchema: any) => {
    const cleaned = ana.replace("mte:", "").split("");
    const cat = cleaned.at(0)!;

    return cleaned
        .flatMap((val, index) => {
            if (val === "-") return [];
            if (index === 0) return tCategory(val);

            const catSchema = advFiltersSchema[cat];
            const key = catSchema[index - 1];
            return tSchema(`${key}.${val}`).toLowerCase();
        })
        .join("; ");
};
