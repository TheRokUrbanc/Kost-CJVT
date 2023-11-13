import { useTranslations } from "next-intl";
import { ParagraphData } from "@/data/paragraph";

interface TabProps {
    data: ParagraphData;
}

export default function ParagraphMetadataTab({ data }: TabProps) {
    const tMeta = useTranslations("Metadata");

    return (
        <div className="px-4 flex gap-4 justify-between">
            <div className="bg-surface-static-secondary rounded-md p-4 grow flex flex-wrap gap-8">
                <MetaEntry title={tMeta("instruction")} value={data.Bibl.Instruction} />
                <MetaEntry title={tMeta("textCode")} value={data.id.slice(0, -4)} />
                <MetaEntry title={tMeta("topic")} value={data.Bibl.Topic} />
                <MetaEntry title={tMeta("creationDate")} value={data.Bibl.CreationDate} />
                <MetaEntry title={tMeta("taskSetting")} value={data.Bibl.TaskSetting} />
                <MetaEntry title={tMeta("proficSlv")} value={data.Bibl.ProficSlv} />
                <MetaEntry title={tMeta("programType")} value={data.Bibl.ProgramType} />
                <MetaEntry title={tMeta("inputType")} value={data.Bibl.InputType} />
                <MetaEntry title={tMeta("firstLang")} value={data.Bibl.FirstLang} />
                <MetaEntry title={tMeta("creationDate")} value={data.Bibl.CreationDate} />
                <MetaEntry title={tMeta("subProgram")} value={data.Bibl.ProgramSubtype} />
                <MetaEntry title={tMeta("author")} value={data.Bibl.Author} />
                <MetaEntry title={tMeta("sex")} value={data.Bibl.Sex} />
                <MetaEntry title={tMeta("yearOfBirth")} value={data.Bibl.YearOfBirth} />
                <MetaEntry title={tMeta("employmentStatus")} value={data.Bibl.EmploymentStatus} />
                <MetaEntry title={tMeta("completedEducation")} value={data.Bibl.CompletedEducation} />
                <MetaEntry title={tMeta("currentSchool")} value={data.Bibl.CurrentSchool} />
                <MetaEntry title={tMeta("country")} value={data.Bibl.Country} />
                <MetaEntry title={tMeta("otherLang")} value={data.Bibl.OtherLang} />
            </div>
        </div>
    );
}

function MetaEntry({ title, value }: { title: string; value: string | null }) {
    if (value === null) return;
    return (
        <div className="flex flex-col gap-1">
            <h5 className="caption !font-light text-light-grey">{title}</h5>
            <span className="body-2 text-grey">{value || "/"}</span>
        </div>
    );
}
