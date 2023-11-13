import { Prisma } from "@prisma/client";

type PaginatedResponse<T> = {
    data: T;
    meta: {
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
    links: {
        first: string;
        previous: string;
        current: string;
        next: string;
        last: string;
    };
};

type OrigParagraphQuery = Prisma.OrigParagraphGetPayload<{
    include: {
        Sentences: {
            orderBy: {
                id: "asc";
            };
            include: {
                Words: {
                    select: {
                        id: true;
                        text: true;
                        lemma: true;
                    };
                };
            };
            where: {
                Words: {
                    some: {
                        lemma;
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
                            select: {
                                id: true;
                                text: true;
                                lemma: true;
                            };
                        };
                    };
                    where: {
                        Words: {
                            some: {
                                lemma;
                            };
                        };
                    };
                };
            };
        };
        OrigErrors: true;
    };
}>;
