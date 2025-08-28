import {
    CheckIcon,
    StarIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import {Avatar, Badge, Swap, SwapOff, SwapOn} from "components/ui";
import { courseStatusOptions, levelOptions } from "./data";
import {Highlight} from "../../../../components/shared/Highlight.jsx";
import {ensureString} from "../../../../utils/ensureString.js";

export function NameCell({ row, getValue, column, table }) {

    const globalQuery = ensureString(table.getState().globalFilter);
    const columnQuery = ensureString(column.getFilterValue());

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
                        classNames={{
                            root: "rounded-full border-2 border-dashed border-transparent p-0.5 transition-colors group-hover/tr:border-gray-400 dark:group-hover/tr:border-dark-300",
                            display: "text-xs-plus",
                        }}
                        src={row.original.avatar}
                        initialColor="auto"
                        name={row.original.name}
                    />
                </SwapOff>
            </Swap>

            <div className="font-medium text-gray-800 dark:text-dark-100">
                <Highlight query={[globalQuery, columnQuery]}>{getValue()}</Highlight>
            </div>
        </div>
    );
}

export function RatingCell({ getValue }) {
  return (
    <div className="flex items-center space-x-1 ">
      <StarIcon className="size-4 text-yellow-500" />
      <span>{getValue()}</span>
    </div>
  );
}

export function StatusCell({ getValue }) {
    const val = getValue();
    const option = courseStatusOptions.find((item) => item.value === val);

    return (
        <Badge color={option.color} className="space-x-1.5 ">
            {option.icon && <option.icon className="h-4 w-4" />}

            <span>{option.label}</span>
        </Badge>
    );
}

export function LevelCell({ getValue }) {
  const val = getValue();
  const option = levelOptions.find((item) => item.value === val);

  return (
    <Badge color={option?.color} className="rounded-full" variant="outlined">
      {option.label}
    </Badge>
  );
}

export function PriceCell({ getValue }) {
  return <>${getValue()}</>;
}

NameCell.propTypes = {
  row: PropTypes.object,
  getValue: PropTypes.func,
};

LevelCell.propTypes = {
  getValue: PropTypes.func,
};

RatingCell.propTypes = {
  getValue: PropTypes.func,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
};

PriceCell.propTypes = {
  getValue: PropTypes.func,
};
