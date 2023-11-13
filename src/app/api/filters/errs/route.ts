import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getErrsFilters } from "@/data/errs";
import { RawSearchFilters, parseRawFilters } from "@/data/search";

const cachedFilters = unstable_cache((parsedFilters) => getErrsFilters(parsedFilters));

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsedFilters = parseRawFilters(Object.fromEntries(searchParams.entries()) as RawSearchFilters);

    const filters = await cachedFilters(parsedFilters);
    if (!filters) return NextResponse.json("No data found", { status: 400 });
    return NextResponse.json(filters);
}
