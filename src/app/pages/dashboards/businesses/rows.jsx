import {
    CheckIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import {Avatar, Badge, Swap, SwapOff, SwapOn} from "components/ui";
import {levelOptions, verificationOptions, statusOptions, businessTypeOptions} from "./data";
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
                        name={row.original.business_name}
                    />
                </SwapOff>
            </Swap>

            <div className="font-medium text-gray-800 dark:text-dark-100">
                <Highlight query={[globalQuery, columnQuery]}>{getValue() || ''}</Highlight>
            </div>
        </div>
    );
}

export function LevelCell({ getValue }) {
    const val = getValue();
    const option = levelOptions.find((item) => item.value === val);

    return (
        <Badge color={option?.color} className="rounded-full" variant="outlined">
            {option?.label || val}
        </Badge>
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

export function VerificationStatusCell({ getValue }) {
    const val = getValue();
    const option = verificationOptions.find((item) => item.value === val);

    return (
        <Badge color={option?.color || "neutral"} className="space-x-1.5 ">
            <span>{option?.label || val}</span>
        </Badge>
    );
}

export function BusinessTypeCell({ getValue, row }) {
    const val = getValue();
    const businessTypeName = row.original.business_type_name;
    const option = businessTypeOptions.find((item) => item.value === val);

    return (
        <Badge color={option?.color || "neutral"} className="rounded-full" variant="outlined">
            {businessTypeName || option?.label || val}
        </Badge>
    );
}

export function KYCSummaryCell({ row }) {
    const kycSummary = row.original.kyc_summary;
    
    if (!kycSummary) {
        return <span className="text-gray-500 text-sm">No data</span>;
    }

    const { 
        approved_required, 
        total_required, 
        declined_required,
        declined, 
        completion_rate 
    } = kycSummary;
    
    // If total_required is 0, completion rate should be 100%
    const actualCompletionRate = total_required === 0 ? 100 : completion_rate;
    
    let color = 'error';
    
    if (actualCompletionRate === 100) {
        color = 'success';
    } else if (approved_required > 0) {
        color = 'warning';
    }

    return (
        <div className="flex flex-col space-y-1">
            <Badge color={color} className="text-xs">
                {actualCompletionRate}% Complete
            </Badge>
            <div className="text-xs text-gray-500">
                {approved_required}/{total_required} required
                {(declined_required > 0 || declined > 0) && (
                    <span className="text-red-500 ml-1">
                        ({declined_required || declined} declined)
                    </span>
                )}
            </div>
        </div>
    );
}

NameCell.propTypes = {
  row: PropTypes.object,
  getValue: PropTypes.func,
};

LevelCell.propTypes = {
  getValue: PropTypes.func,
};

StatusCell.propTypes = {
  getValue: PropTypes.func,
};

VerificationStatusCell.propTypes = {
  getValue: PropTypes.func,
};

BusinessTypeCell.propTypes = {
  getValue: PropTypes.func,
  row: PropTypes.object,
};

KYCSummaryCell.propTypes = {
  row: PropTypes.object,
};