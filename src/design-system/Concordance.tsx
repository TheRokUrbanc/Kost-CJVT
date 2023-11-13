import { SearchType } from "@/app/[locale]/Search";
import CopyButton from "@/components/CopyButton";
import { SmolWord, isMatchingLemma } from "@/util/highlight.util";
import { punctuationRegex } from "@/util/util";
import { Err, Sentence } from "@prisma/client";
import { clsx } from "clsx";

interface ConcordanceProps {
    searchType: SearchType;
    currentLemma: string;
    paragraphErrors?: Err[];
    sentence: Sentence & { Words: SmolWord[] };
    corrSentence?: Sentence & { Words: SmolWord[] };
    contextWord?: string | null;
    showOrig: boolean;
    showCorrect: boolean;
    highlight: boolean;
    center?: boolean;
}

export default function Concordance({
    searchType,
    currentLemma,
    paragraphErrors,
    sentence,
    corrSentence,
    contextWord,
    showOrig,
    showCorrect,
    highlight,
    center = false,
}: ConcordanceProps) {
    const errorTargetIds =
        paragraphErrors?.flatMap((e) => {
            let out = [];
            if (e.origWordId) out.push(e.origWordId);
            if (e.corrWordId) out.push(e.corrWordId);
            return out;
        }) ?? [];

    return (
        <div className="px-4 border-r border-b border-l border-static-border hover:bg-secondary transition-all duration-200">
            {showOrig && (
                <SentenceEntry
                    searchType={searchType}
                    sentenceType="orig"
                    shouldCenter={center}
                    shouldHighlight={highlight}
                    currentLemma={currentLemma}
                    contextWord={contextWord}
                    sentence={sentence}
                    errorTargetIds={errorTargetIds}
                />
            )}

            {showOrig && showCorrect && corrSentence && <hr className="text-static-border mx-1" />}

            {showCorrect && corrSentence && (
                <SentenceEntry
                    searchType={searchType}
                    sentenceType="corr"
                    shouldCenter={center}
                    shouldHighlight={highlight}
                    currentLemma={currentLemma}
                    contextWord={contextWord}
                    sentence={corrSentence}
                    errorTargetIds={errorTargetIds}
                />
            )}
        </div>
    );
}

interface SentenceProps {
    searchType: SearchType;
    sentenceType: "orig" | "corr";
    shouldCenter: boolean;
    shouldHighlight: boolean;
    currentLemma: string;
    contextWord?: string | null;
    sentence: Sentence & { Words: SmolWord[] };
    errorTargetIds: string[];
}

function SentenceEntry({
    searchType,
    sentenceType,
    shouldCenter,
    shouldHighlight,
    currentLemma,
    contextWord,
    sentence,
    errorTargetIds,
}: SentenceProps) {
    const currentLemmaIndex = sentence.Words.findIndex((word) => isMatchingLemma(searchType, word, currentLemma));

    const handleCopy = async () => {
        const text = sentence.Words.map((w) => (punctuationRegex.test(w.text) ? w.text : ` ${w.text}`)).join("");
        await navigator.clipboard.writeText(text);
    };

    const generateWordElement = (word: SmolWord) => {
        const isHighlighted = shouldHighlight && errorTargetIds.includes(word.id);
        const isBold = isMatchingLemma(searchType, word, currentLemma) || word.text === contextWord;
        const classes = clsx(
            isHighlighted && (sentenceType === "corr" ? "text-semantic-correct" : "text-semantic-error"),
            isBold && "font-bold",
        );

        return (
            <span key={word.id} className={classes} title={word.id}>
                {punctuationRegex.test(word.text) ? "" : " "}
                {word.text}
            </span>
        );
    };

    let content;
    if (!shouldCenter) {
        content = <p className="py-3">{sentence.Words.map(generateWordElement)}</p>;
    }

    if (shouldCenter) {
        content = (
            <p className={`py-3 grow grid grid-cols-2 gap-1.5`}>
                <span className="whitespace-nowrap overflow-hidden text-clip">
                    <span className="float-right inline-block text-right">
                        {sentence.Words.slice(0, currentLemmaIndex).map(generateWordElement)}
                    </span>
                </span>

                <span className="whitespace-nowrap overflow-hidden text-clip">
                    <span className="float-left inline-block text-right">
                        {sentence.Words.slice(currentLemmaIndex).map(generateWordElement)}
                    </span>
                </span>
            </p>
        );
    }

    return (
        <div className="flex justify-between items-center">
            {content}
            <div className="pl-3 border-l border-static-border">
                <CopyButton onClick={handleCopy} />
            </div>
        </div>
    );
}
