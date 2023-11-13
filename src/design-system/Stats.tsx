interface StatsProps {
    title: string;
    value: string;
}

export default function Stats({ title, value }: StatsProps) {
    return (
        <div className="border-t border-white flex flex-col text-white">
            <span className="py-4 text-3xl font-semibold">{value}</span>

            <span className="text-sm tracking-wide">{title}</span>
        </div>
    );
}
