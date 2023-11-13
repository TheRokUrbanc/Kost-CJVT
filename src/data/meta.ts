import prisma from "@/lib/prisma";
import { TextSource } from "@prisma/client";

export const getCorpusSize = async (type: TextSource) => {
    return await prisma.word.count({ where: { type } });
};
