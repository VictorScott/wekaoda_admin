import { useState } from "react";
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";
import { FacedtedFilter } from "components/shared/table/FacedtedFilter";
import { FilterSelector } from "components/shared/table/FilterSelector";
import { TableConfig } from "./TableConfig";
import { Button, Input, GhostSpinner } from "components/ui";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";

import { 
    filtersOptions, 
    businessStatusOptions, 
    partnershipStatusOptions, 
    businessLevelOptions 
} from "./dataoptions.js";

export function Toolbar({ 
    table, 
    refreshing = false, 
    lastUpdated = null, 
    onRefresh,
    businessName,
    partnersType 
}) {
    const { isXs } = useBreakpointsContext();
    const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;
    const [lastRefreshTime, setLastRefreshTime] = useState(null);
    
    // Use the most recent time between lastUpdated (initial load) and lastRefreshTime (manual refresh)
    const displayTime = lastRefreshTime || lastUpdated;

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
            setLastRefreshTime(new Date());
        }
    };

    const modalTitle = partnersType === 'suppliers' ? 'Suppliers' : 'Anchors';
    const IconComponent = partnersType === 'suppliers' ? UserGroupIcon : BuildingOfficeIcon;

    return (
        <div className="table-toolbar">
            <div
                className={clsx(
                    "transition-content flex items-center justify-between gap-4",
                    isFullScreenEnabled ? "px-4 sm:px-5" : "px-4 pt-4"
                )}
            >
                <div className="min-w-0 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <IconComponent className="size-5 text-primary-600 dark:text-primary-400" />
                        <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
                            {modalTitle} - {businessName}
                        </h2>
                    </div>
                    {refreshing ? (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <GhostSpinner className="size-4" />
                            <span className="text-xs">Refreshing...</span>
                        </div>
                    ) : displayTime && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {displayTime.toLocaleTimeString()}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outlined"
                        className="h-8 space-x-1.5 rounded-md px-3 text-xs"
                        title={`Refresh ${modalTitle.toLowerCase()}`}
                    >
                        <ArrowPathIcon className={clsx("size-4", refreshing && "animate-spin")} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </Button>
                </div>
            </div>

            {isXs ? (
                <>
                    <div
                        className={clsx(
                            "flex gap-2 pt-4 [&_.input-root]:flex-1",
                            isFullScreenEnabled ? "px-4 sm:px-5" : "px-4"
                        )}
                    >
                        <SearchInput table={table} partnersType={partnersType} />
                    </div>
                    <div
                        className={clsx(
                            "hide-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1 pt-4",
                            isFullScreenEnabled ? "px-4 sm:px-5" : "px-4"
                        )}
                    >
                        <Filters table={table} />
                    </div>
                </>
            ) : (
                <div
                    className={clsx(
                        "custom-scrollbar transition-content flex justify-between gap-4 overflow-x-auto pb-1 pt-4",
                        isFullScreenEnabled ? "px-4 sm:px-5" : "px-4"
                    )}
                >
                    <div className="flex shrink-0 gap-2">
                        <SearchInput table={table} partnersType={partnersType} />
                        <Filters table={table} />
                    </div>

                    <TableConfig table={table} />
                </div>
            )}
        </div>
    );
}

function SearchInput({ table, partnersType }) {
    const modalTitle = partnersType === 'suppliers' ? 'suppliers' : 'anchors';
    
    return (
        <Input
            value={table.getState().globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder={`Search ${modalTitle}...`}
            classNames={{
                root: "shrink-0",
                input: "h-8 text-xs ring-primary-500/50 focus:ring-3",
            }}
        />
    );
}

function Filters({ table }) {
    const toolbarFilters = table.getState().toolbarFilters;

    return (
        <>
            {toolbarFilters.includes("status") && table.getColumn("status") && (
                <div style={{ order: toolbarFilters.indexOf("status") + 1 }}>
                    <FacedtedFilter
                        options={businessStatusOptions}
                        column={table.getColumn("status")}
                        title="Business Status"
                        Icon={CheckCircleIcon}
                    />
                </div>
            )}

            {toolbarFilters.includes("partnership_status") && table.getColumn("partnership_status") && (
                <div style={{ order: toolbarFilters.indexOf("partnership_status") + 1 }}>
                    <FacedtedFilter
                        options={partnershipStatusOptions}
                        column={table.getColumn("partnership_status")}
                        title="Partnership Status"
                        Icon={CheckCircleIcon}
                    />
                </div>
            )}

            {toolbarFilters.includes("business_level") && table.getColumn("business_level") && (
                <div style={{ order: toolbarFilters.indexOf("business_level") + 1 }}>
                    <FacedtedFilter
                        options={businessLevelOptions}
                        column={table.getColumn("business_level")}
                        title="Business Level"
                        Icon={BuildingOfficeIcon}
                    />
                </div>
            )}

            <div style={{ order: toolbarFilters.length + 1 }}>
                <FilterSelector options={filtersOptions} table={table} />
            </div>
        </>
    );
}

Toolbar.propTypes = {
    table: PropTypes.object.isRequired,
    refreshing: PropTypes.bool,
    lastUpdated: PropTypes.instanceOf(Date),
    onRefresh: PropTypes.func,
    businessName: PropTypes.string,
    partnersType: PropTypes.oneOf(['suppliers', 'anchors']),
};

SearchInput.propTypes = {
    table: PropTypes.object.isRequired,
    partnersType: PropTypes.oneOf(['suppliers', 'anchors']),
};

Filters.propTypes = {
    table: PropTypes.object.isRequired,
};
