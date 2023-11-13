// Example of id: L-1819-001t.1.1
export const sortById = (a: { id: string }, b: { id: string }) => {
    const aSplit = a.id.split(".");
    const bSplit = b.id.split(".");

    if (aSplit.length !== bSplit.length) {
        throw new Error("Ids are not the same 'level'");
    }

    const aPart = Number(aSplit[aSplit.length - 1]);
    const bPart = Number(bSplit[bSplit.length - 1]);

    return aPart - bPart;
};
