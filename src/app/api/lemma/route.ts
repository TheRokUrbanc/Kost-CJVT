import { NextRequest, NextResponse } from "next/server";
import { SEARCH_SOURCE } from "@/constants";
import { parseSearchSource } from "@/data/search";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get("q");
    const searchSource = parseSearchSource(searchParams.get(SEARCH_SOURCE));

    if (!word) return NextResponse.json("No word provided", { status: 400 });

    let dbResult = await prisma.word.findFirst({
        where: { OR: [{ lemma: word }, { text: word }], type: searchSource },
        select: { lemma: true },
    });

    if (dbResult?.lemma === undefined) return NextResponse.json({ err: "Not found" }, { status: 404 });

    return NextResponse.json({ lemma: dbResult.lemma });
}
