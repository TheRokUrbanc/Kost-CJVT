import prisma from "@/lib/prisma";
import { Prisma, TextSource } from "@prisma/client";

export type ParagraphData = Prisma.ParagraphGetPayload<{
    include: {
        Bibl: true;
        Sentences: {
            orderBy: {
                id: "asc";
            };
            include: {
                Words: {
                    orderBy: {
                        id: "asc";
                    };
                    select: {
                        id: true;
                        text: true;
                        lemma: true;
                        ana: true;
                    };
                };
            };
        };
        CorrParagraph: {
            include: {
                Sentences: {
                    orderBy: {
                        id: "asc";
                    };
                    include: {
                        Words: {
                            orderBy: {
                                id: "asc";
                            };
                            select: {
                                id: true;
                                text: true;
                                lemma: true;
                                ana: true;
                            };
                        };
                    };
                };
            };
        };
        OrigErrors: true;
    };
}>;

export const getParagraphData = async (paragraphId: string): Promise<ParagraphData | null> => {
    return await prisma.paragraph.findUnique({
        where: {
            id: paragraphId,
            type: TextSource.ORIG,
        },
        include: {
            Bibl: true,
            Sentences: {
                orderBy: {
                    id: "asc",
                },
                include: {
                    Words: {
                        orderBy: {
                            id: "asc",
                        },
                        select: {
                            id: true,
                            text: true,
                            lemma: true,
                            ana: true,
                        },
                    },
                },
            },
            CorrParagraph: {
                include: {
                    Sentences: {
                        orderBy: {
                            id: "asc",
                        },
                        include: {
                            Words: {
                                orderBy: {
                                    id: "asc",
                                },
                                select: {
                                    id: true,
                                    text: true,
                                    lemma: true,
                                    ana: true,
                                },
                            },
                        },
                    },
                },
            },
            OrigErrors: true,
            // Errs: {
            //     select: {
            //         id: true,
            //         type: true,
            //         target: true,
            //     },
            //     where: {
            //         type: {
            //             not: "ID",
            //         },
            //     },
            // },
        },
    });
};
