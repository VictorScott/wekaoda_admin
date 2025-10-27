import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  ChartBarIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import PropTypes from "prop-types";
import { FacedtedFilter } from "components/shared/table/FacedtedFilter";
import { FilterSelector } from "components/shared/table/FilterSelector";
import {Button, Input, Spinner} from "components/ui";
import { useDispatch } from "react-redux";
import { fetchBusinesses } from "store/slices/businessSlice";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import {
    filtersOptions,
    levelOptions,
    statusOptions,
    verificationOptions,
} from "./data";

export function Toolbar({ table, refreshing = false, lastUpdated = null, onAddBusiness }) {
  const { isXs } = useBreakpointsContext();
  const dispatch = useDispatch();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  // Use the most recent time between lastUpdated (initial load) and lastRefreshTime (manual refresh)
  const displayTime = lastRefreshTime || lastUpdated;

  const handleRefresh = () => {
    dispatch(fetchBusinesses())
      .then(() => {
        setLastRefreshTime(new Date());
      });
  };


  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4",
        )}
      >
        <div className="min-w-0 flex items-center gap-3">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Businesses
          </h2>
          {refreshing ? (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Spinner color="primary" className="size-4 border-2" />
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
            onClick={onAddBusiness}
            color="primary"
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            title="Add new business"
          >
            <PlusIcon className="size-4" />
            <span>Add Business</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outlined"
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            title="Refresh businesses list"
          >
            <ArrowPathIcon className={clsx("size-4", refreshing && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {isXs ? (
        <>
          <div
            className={clsx(
              "flex gap-2 pt-4 [&_.input-root]:flex-1",
              isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
            )}
          >
            <SearchInput table={table} />
            <TableConfig table={table} />
          </div>
          <div
            className={clsx(
              "hide-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1 pt-4",
              isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
            )}
          >
            <Filters table={table} />
          </div>
        </>
      ) : (
        <div
          className={clsx(
            "custom-scrollbar transition-content flex justify-between gap-4 overflow-x-auto pb-1 pt-4",
            isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)",
          )}
          style={{
            "--margin-scroll": isFullScreenEnabled
              ? "1.25rem"
              : "var(--margin-x)",
          }}
        >
          <div className="flex shrink-0 gap-2">
            <SearchInput table={table} />
            <Filters table={table} />
          </div>

          <TableConfig table={table} />
        </div>
      )}
    </div>
  );
}

function SearchInput({ table }) {
  return (
    <Input
      value={table.getState().globalFilter}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      placeholder="Search Name, Level, Type..."
      classNames={{
        root: "shrink-0",
        input: "h-8 text-xs ring-primary-500/50 focus:ring-3",
      }}
    />
  );
}

function Filters({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const toolbarFilters = table.getState().toolbarFilters;

  return (
    <>
        {toolbarFilters.includes("business_level") && table.getColumn("business_level") && (
            <div style={{ order: toolbarFilters.indexOf("business_level") + 1 }}>
                <FacedtedFilter
                    options={levelOptions}
                    column={table.getColumn("business_level")}
                    title="Level"
                    Icon={ChartBarIcon}
                />
            </div>
        )}

        {toolbarFilters.includes("status") && table.getColumn("status") && (
            <div style={{ order: toolbarFilters.indexOf("status") + 1 }}>
                <FacedtedFilter
                    options={statusOptions}
                    column={table.getColumn("status")}
                    title="Status"
                    Icon={CheckCircleIcon}
                />
            </div>
        )}

        {toolbarFilters.includes("verification_status") && table.getColumn("verification_status") && (
            <div style={{ order: toolbarFilters.indexOf("verification_status") + 1 }}>
                <FacedtedFilter
                    options={verificationOptions}
                    column={table.getColumn("verification_status")}
                    title="Verification"
                    Icon={CheckCircleIcon}
                />
            </div>
        )}

      <div style={{ order: toolbarFilters.length + 1 }}>
        <FilterSelector options={filtersOptions} table={table} />
      </div>

      {isFiltered && (
        <Button
          onClick={() => table.resetColumnFilters()}
          className="h-8 whitespace-nowrap px-2.5 text-xs"
          style={{ order: toolbarFilters.length + 2 }}
        >
          Reset Filters
        </Button>
      )}
    </>
  );
}

Toolbar.propTypes = {
  table: PropTypes.object.isRequired,
  refreshing: PropTypes.bool,
  lastUpdated: PropTypes.instanceOf(Date),
  onAddBusiness: PropTypes.func.isRequired,
};

SearchInput.propTypes = {
  table: PropTypes.object,
};

Filters.propTypes = {
  table: PropTypes.object,
};
