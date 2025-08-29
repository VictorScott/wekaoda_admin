import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  ChartBarIcon,
} from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { FacedtedFilter } from "components/shared/table/FacedtedFilter";
import { FilterSelector } from "components/shared/table/FilterSelector";
import { Button, Input } from "components/ui";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import {
    filtersOptions,
    levelOptions,
    statusOptions,
    verificationOptions,
} from "./data";

export function Toolbar({ table }) {
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            All Businesses
          </h2>
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
  table: PropTypes.object,
};

SearchInput.propTypes = {
  table: PropTypes.object,
};

Filters.propTypes = {
  table: PropTypes.object,
};
