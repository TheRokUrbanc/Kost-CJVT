import { FilterableListProps } from "@/design-system/filterable-list/FilterableList";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";

export default function FilterListLoader({ title }: Pick<FilterableListProps, "title">) {
    const getEntry = (i: number) => <div key={i} className="h-5 bg-static-border rounded mx-4 my-1" />;

    return (
        <div className="bg-white">
            {title && <FilterableListHeader title={title} />}

            <div>
                <div className="animate-pulse">{Array.from({ length: 7 }, (_, i) => getEntry(i))}</div>
            </div>
        </div>
    );
}
