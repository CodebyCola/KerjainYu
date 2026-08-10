import { cn } from "@/utils/cn";

type FilterOption<T extends string> = {
    value: T;
    label: string;
};

type ProjectFilterGroupProps<T extends string> = {
    legend: string;
    name: string;
    options: FilterOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

export default function ProjectFilterGroup<T extends string>({
    legend,
    name,
    options,
    value,
    onChange,
}: ProjectFilterGroupProps<T>) {
    return (
        <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-inter font-medium text-foreground">{legend}</legend>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isActive = option.value === value;
                    return (
                        <label key={option.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={isActive}
                                onChange={() => onChange(option.value)}
                                className="peer sr-only"
                            />
                            <span
                                className={cn(
                                    "flex min-h-9 items-center rounded-full border px-3.5 text-sm font-inter font-medium transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary",
                                    isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-muted hover:text-foreground"
                                )}
                            >
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}