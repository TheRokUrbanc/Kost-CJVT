import { Bibl, Err, PrismaClient, Sentence, TextSource, Word } from "@prisma/client";
import chalk from "chalk";
import fs from "fs";
// @ts-ignore
import XmlStream from "xml-stream";

const prisma = new PrismaClient();

const importDir = "./import/";
const origFile = importDir + "kost-orig.xml";
const errFile = importDir + "kost-errs.xml";
const corrFile = importDir + "kost-corr.xml";

const zeroPadId = (id: string) => {
    // Use a regular expression to match "s/t." followed by numbers
    const regex = /([st]\.\d+(\.\d+)*)/g;

    // Replace each match with a zero-padded version
    return id.replace(regex, (match) => {
        const numbers = match.slice(2); // Extract numbers after "s./t."
        const zeroPadded = numbers
            .split(".")
            .map((num) => num.padStart(3, "0"))
            .join(".");
        return `${match.slice(0, 1)}.${zeroPadded}`;
    });
};

const parseFile = async (
    file: string,
    endElement: string,
    collect: string[],
    dataHandler: (data: any) => Promise<void>,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(chalk.blue("Processing file"), file);

        try {
            // Make sure file exists
            if (!fs.existsSync(file)) {
                console.error(chalk.red("File not found:"), file);
                return;
            }

            const fileStream = fs.createReadStream(file, "utf-8");
            const xmlStream = new XmlStream(fileStream);

            // Collect specified tags
            collect.forEach((tag) => xmlStream.collect(tag));

            console.log(chalk.blue("Parsing file"), file);

            const maxConcurrency = 100; // Concurrency level to prevent overloading the database
            const inProgress = new Set();

            xmlStream.on(`endElement: ${endElement}`, async (data: any) => {
                if (inProgress.size >= maxConcurrency) {
                    xmlStream.pause();
                    await Promise.all(inProgress);
                    xmlStream.resume();
                }

                const dataPromise = dataHandler(data);
                inProgress.add(dataPromise);
                await dataPromise.finally(() => inProgress.delete(dataPromise));
            });

            xmlStream.on("end", async () => {
                console.log(chalk.green("Done parsing file"), file);
                fileStream.close();

                // Wait for all pending data to finish processing
                await Promise.all(inProgress);

                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
};

const origDataHandler = async (data: OrigXmlData, dataType: TextSource) => {
    // Bibl parsing
    const biblId = data.bibl.$.n;

    const parsedBiblData: Partial<Bibl> = {
        id: biblId,
    };

    // Don't parse corr bibl data as it's the same as orig
    if (dataType == TextSource.ORIG) {
        data.bibl.note.forEach((note) => {
            const type = note.$!.ana.slice(1) as keyof Bibl;
            parsedBiblData[type] = note.$text!;
        });

        await prisma.bibl.create({
            data: parsedBiblData as Bibl,
        });
    }
    // End bibl parsing

    // Sentence & word parsing
    for (const paragraph of data.p) {
        const paragraphId = zeroPadId(paragraph.$["xml:id"]);

        await prisma.paragraph.create({
            data: {
                id: paragraphId,
                biblId,
                type: dataType,
                origParagraphId: dataType === TextSource.CORR ? paragraphId.replace("t", "s") : null,
            },
        });

        const sentences: Sentence[] = [];
        const words: Word[] = [];

        for (const sentence of paragraph.s) {
            const sentenceId = zeroPadId(sentence.$["xml:id"]);

            // Make sure w tag is an array
            sentence.w = sentence.w ?? [];

            // Merge seg tag content into sentence
            if (sentence.seg !== undefined) {
                sentence.w?.push(...sentence.seg.flatMap((seg) => seg.w || []));
                sentence.w?.push(...sentence.seg.flatMap((seg) => seg.pc || []));
            }

            const sentenceData: Sentence = {
                id: sentenceId,
                type: dataType,
                biblId,
                paragraphId,
            };

            const parsedWords: Word[] = [];

            // Merge pc tags into w tag
            if (sentence.pc !== undefined) {
                const isArr = Array.isArray(sentence.pc);
                if (isArr) sentence.w?.push(...(sentence.pc as PcNode[]));
                else sentence.w?.push(sentence.pc as PcNode);
            }

            for (const word of sentence.w || []) {
                parsedWords.push({
                    id: zeroPadId(word.$["xml:id"]),
                    type: dataType,
                    ana: word.$.ana,
                    lemma: word.$.lemma ?? null,
                    text: word.$text,
                    sentenceId,
                });
            }

            words.push(...parsedWords);
            sentences.push(sentenceData as Sentence);
        }

        await prisma.sentence.createMany({
            data: sentences,
        });

        await prisma.word.createMany({
            data: words,
        });
    }
    // End Sentence & word parsing
};

const errDataHandler = async (data: ErrXmlData) => {
    try {
        const correspSplit = data.$.corresp.split(" ");
        const origParagraphId = zeroPadId(correspSplit[0].slice(1));
        const corrParagraphId = zeroPadId(correspSplit[1].slice(1));

        const errs = data.link.flatMap((link) => {
            if (link.$.type === "ID") return [];

            const splitTarget = link.$.target.split(" ");
            const zeroPadTargets = splitTarget.map((target) => zeroPadId(target.replace("#", "").trim()));

            let output: Omit<Err, "id">[] = [];

            while (zeroPadTargets.length > 0) {
                const target = zeroPadTargets.shift()!;
                const corrTargetIndex = zeroPadTargets.indexOf(target.replace("s.", "t."));
                const corrTarget = corrTargetIndex !== -1 ? zeroPadTargets.splice(corrTargetIndex, 1)[0] : null;

                if (target.includes("s.")) {
                    output.push({
                        type: link.$.type,
                        origWordId: target,
                        corrWordId: corrTarget,
                        origParagraphId,
                        corrParagraphId,
                    });
                } else {
                    output.push({
                        type: link.$.type,
                        origWordId: null,
                        corrWordId: target,
                        origParagraphId,
                        corrParagraphId,
                    });
                }
            }

            return output;
        });

        await prisma.err.createMany({
            data: errs as Err[],
        });
    } catch (e: any) {
        console.log(chalk.red("Error occured at"), data.$);
        throw e;
    }
};

const populateMetadata = async () => {
    console.log(chalk.blue("Populating metadata"));

    // Bibl meta
    console.log(chalk.blue(" Populating bibl meta"));
    await setBiblMeta("FirstLang");
    await setBiblMeta("TaskSetting");
    await setBiblMeta("ProficSlv");
    await setBiblMeta("ProgramType");
    await setBiblMeta("InputType");
    await generateErrMeta();
    console.log(chalk.green(" Done populating bibl meta"));

    console.log(chalk.green("Done populating metadata"));
};

const setBiblMeta = async (col: keyof Bibl) => {
    const counts = await getBiblCounts(col);
    await prisma.biblMeta.create({
        data: {
            colName: col,
            origCounts: JSON.stringify(counts.origCounts),
            origWithErrCounts: JSON.stringify(counts.origCountsWithErrors),
            corrCounts: JSON.stringify(counts.corrCounts),
            corrWithErrCounts: JSON.stringify(counts.corrCountsWithErrors),
        },
    });
};

const getBiblCounts = async (col: keyof Bibl) => {
    console.log(chalk.blue("   Getting bibl counts for"), col);
    const origCounts = await getOrigCounts(col);
    const origCountsWithErrors = await getOrigCountsWithErrors(col);
    const corrCounts = await getCorrCounts(col);
    const corrCountsWithErrors = await getCorrCountsWithErrors(col);
    console.log(chalk.green("   Done getting bibl counts for"), col);

    return {
        origCounts,
        origCountsWithErrors,
        corrCounts,
        corrCountsWithErrors,
    };
};

const getOrigCounts = async (col: keyof Bibl) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT (ow.id))::int as count
        FROM "Bibl" as b
            INNER JOIN "Paragraph" opar on b.id = opar."biblId" AND opar.type = 'ORIG'
            INNER JOIN "Sentence" as os ON b.id = os."biblId" AND os.type = 'ORIG'
            INNER JOIN "Word" as ow ON os.id = ow."sentenceId" AND ow.type = 'ORIG'
        GROUP BY b."${col}"
        ORDER BY count DESC;
    `;
    return await prisma.$queryRawUnsafe(query);
};

const getOrigCountsWithErrors = async (col: keyof Bibl) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT (ow.id))::int as count
        FROM "Bibl" as b
            INNER JOIN "Paragraph" opar on b.id = opar."biblId" AND opar.type = 'ORIG'
            INNER JOIN "Sentence" as os ON b.id = os."biblId" AND os.type = 'ORIG'
            INNER JOIN "Word" as ow ON os.id = ow."sentenceId" AND ow.type = 'ORIG'
            INNER JOIN "Err" as e ON opar.id = e."origParagraphId"
        GROUP BY b."${col}"
        ORDER BY count DESC;    
    `;
    return await prisma.$queryRawUnsafe(query);
};

const getCorrCounts = async (col: keyof Bibl) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT (cw.id))::int as count
        FROM "Bibl" as b
            INNER JOIN "Paragraph" cpar on b.id = cpar."biblId" AND cpar.type = 'CORR'
            INNER JOIN "Sentence" as cs ON b.id = cs."biblId" AND cs.type = 'CORR'
            INNER JOIN "Word" as cw ON cs.id = cw."sentenceId" AND cw.type = 'CORR'
        GROUP BY b."${col}"
        ORDER BY count DESC;      
    `;
    return await prisma.$queryRawUnsafe(query);
};

const getCorrCountsWithErrors = async (col: keyof Bibl) => {
    const query = `
        SELECT b."${col}", COUNT(DISTINCT (cw.id))::int as count
        FROM "Bibl" as b
            INNER JOIN "Paragraph" cpar on b.id = cpar."biblId" AND cpar.type = 'CORR'
            INNER JOIN "Sentence" as cs ON b.id = cs."biblId" AND cs.type = 'CORR'
            INNER JOIN "Word" as cw ON cs.id = cw."sentenceId" AND cw.type = 'CORR'
            INNER JOIN "Err" as e ON cpar.id = e."corrParagraphId"
        GROUP BY b."${col}"
        ORDER BY count DESC;    
    `;
    return await prisma.$queryRawUnsafe(query);
};

const generateErrMeta = async () => {
    console.log(chalk.blue("   Getting error counts"));
    const origCounts = await getOrigErrCounts();
    const corrCounts = await getCorrErrCounts();
    console.log(chalk.green("   Done getting error counts"));

    await prisma.countMeta.create({
        data: {
            name: "errs",
            origCounts: JSON.stringify(origCounts),
            corrCounts: JSON.stringify(corrCounts),
        },
    });
};

const getOrigErrCounts = async () => {
    const query = `
        SELECT e.type, COUNT(e.id)::int as count
        FROM "Err" as e
        WHERE e."origWordId" IS NOT NULL
        GROUP BY e.type
        ORDER BY count DESC;
    `;
    return await prisma.$queryRawUnsafe(query);
};

const getCorrErrCounts = async () => {
    const query = `
        SELECT e.type, COUNT(e.id)::int as count
        FROM "Err" as e
        WHERE e."corrWordId" IS NOT NULL
        GROUP BY e.type
        ORDER BY count DESC;  
    `;
    return await prisma.$queryRawUnsafe(query);
};

async function main() {
    const tags = ["note", "p", "pc", "s", "w", "seg", "link"];

    console.time("Took");
    await parseFile(origFile, "div", tags, (data) => origDataHandler(data, TextSource.ORIG));
    await parseFile(corrFile, "div", tags, (data) => origDataHandler(data, TextSource.CORR));
    await parseFile(errFile, "linkGrp", ["linkGrp", "link"], errDataHandler);
    await populateMetadata();
    console.timeEnd("Took");
}

main().then();
