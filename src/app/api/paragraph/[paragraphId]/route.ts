import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getParagraphData } from "@/data/paragraph";

interface Params {
    params: {
        paragraphId: string;
    };
}

const cachedData = unstable_cache((paragraphId) => getParagraphData(paragraphId));

export async function GET(req: NextRequest, { params }: Params) {
    const paragraphId = params.paragraphId;
    const paragraph = await cachedData(paragraphId);
    if (!paragraph) return NextResponse.json("Paragrpah not found", { status: 400 });
    return NextResponse.json(paragraph);
}
