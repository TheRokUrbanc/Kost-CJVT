import { ReactNode } from "react";

interface MenuListItemProps {
    name: string;
    icon?: ReactNode;
    activeIcon?: ReactNode;
    isActive?: boolean;
    children: ReactNode;
    onClick?: (name: string) => void;
}

export default function MenuListItem({ name, icon, activeIcon, isActive, children, onClick }: MenuListItemProps) {
    const clickHandler = () => {
        if (!onClick) return;
        onClick(name);
    };

    return (
        <li className="bg-white first:rounded-t last:rounded-b transition-all duration-200 hover:bg-secondary">
            <button className="px-4 py-3 flex gap-2 items-center" onClick={clickHandler} type="button">
                <span className="w-4 h-4">{isActive ? activeIcon : icon}</span>
                <span className="body-2 text-grey">{children}</span>
            </button>
        </li>
    );
}
