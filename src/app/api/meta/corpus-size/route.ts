import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SEARCH_SOURCE } from "@/constants";
import { getCorpusSize } from "@/data/meta";
import { parseSearchSource } from "@/data/search";

const cachedData = unstable_cache((type) => getCorpusSize(type));

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const searchSource = parseSearchSource(searchParams.get(SEARCH_SOURCE));
    const dbResult = await cachedData(searchSource);
    return NextResponse.json({ count: dbResult });
}
