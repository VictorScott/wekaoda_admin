import {
    CheckIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import {Avatar, Badge, Swap, SwapOff, SwapOn} from "components/ui";
import {statusOptions} from "./dataoptions.js";
import {Highlight} from "../../../../components/shared/Highlight.jsx";
import {ensureString} from "../../../../utils/ensureString.js";

export function NameCell({ row, getValue, column, table }) {

    const globalQuery = ensureString(table.getState().globalFilter);
    const columnQuery = ensureString(column.getFilterValue());

    const { name, avatar_color, profile_pic } = row.original;

    const initialsName = name;
    const fullName = getValue();

    return (
        <div className="flex items-center space-x-3 ltr:-ml-1 rtl:-mr-1 ">
            <Swap
                effect="flip"
                disabled={!row.getCanSelect()}
                onChange={(val) => row.toggleSelected(val === "on")}
                value={row.getIsSelected() ? "on" : "off"}
            >
                <SwapOn className="flex size-10 items-center justify-center p-1">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-500">
                        <CheckIcon className="size-5 text-white" />
                    </div>
                </SwapOn>
                <SwapOff>
                    <Avatar
                        size={10}
                        src={profile_pic || undefined}
                        name={initialsName}
                        initialColor={avatar_color || "auto"}
                        classNames={{
                            root: "rounded-full border-2 border-dashed border-transparent p-0.5 transition-colors group-hover/tr:border-gray-400 dark:group-hover/tr:border-dark-300",
                            display: "text-xs-plus",
                        }}
                    />
                </SwapOff>
            </Swap>

            <div className="font-medium text-gray-800 dark:text-dark-100">
                <Highlight query={[globalQuery, columnQuery]}>
                    {fullName}
                </Highlight>
            </div>
        </div>
    );
}

export function StatusCell({ getValue }) {
    const val = getValue();
    const option = statusOptions.find((item) => item.value === val);

    return (
        <Badge color={option?.color || "neutral"} className="space-x-1.5 ">
            <span>{option?.label || val}</span>
        </Badge>
    );
}

NameCell.propTypes = {
  row: PropTypes.object,
  getValue: PropTypes.func,
  column: PropTypes.object,
  table: PropTypes.object,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
};
