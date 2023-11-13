import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBiblFilters } from "@/data/filters";
import { RawSearchFilters, parseRawFilters } from "@/data/search";
import { Bibl } from "@prisma/client";

interface Params {
    params: {
        biblType: string;
    };
}

const cachedFilters = unstable_cache((type, searchParams) => getBiblFilters(type, searchParams, false));
const allowedTypes: (keyof Bibl)[] = ["FirstLang"];

export async function GET(req: NextRequest, { params }: Params) {
    const { biblType } = params;
    const { searchParams } = new URL(req.url);
    const parsedFilters = parseRawFilters(Object.fromEntries(searchParams.entries()) as RawSearchFilters);

    if (!biblType) return NextResponse.json("No type provided", { status: 400 });
    if (!allowedTypes.includes(biblType as never)) return NextResponse.json("Type not allowed", { status: 400 });

    const filters = await cachedFilters(biblType, parsedFilters);
    if (!filters) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(filters);
}
