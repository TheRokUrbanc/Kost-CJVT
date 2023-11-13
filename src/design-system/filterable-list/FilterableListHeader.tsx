interface FilterableListHeaderProps {
    title: string;
}

export default function FilterableListHeader({ title }: FilterableListHeaderProps) {
    return (
        <div className="px-4 py-5">
            <h4 className="body-2-title text-grey">{title}</h4>
        </div>
    );
}
