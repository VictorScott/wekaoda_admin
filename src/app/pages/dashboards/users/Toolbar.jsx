import { useState } from "react";
import {
    CheckCircleIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";
import { FacedtedFilter } from "components/shared/table/FacedtedFilter";
import { FilterSelector } from "components/shared/table/FilterSelector";
import { Button, Input, GhostSpinner } from "components/ui";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { filtersOptions, statusOptions } from "./dataoptions.js";
import AddEditUserModal from "./extended/AddEditUserModal.jsx";
import { useDispatch } from "react-redux";
import { fetchUsers } from "store/slices/usersSlice";

export function Toolbar({ table, refreshing = false }) {

    const { isXs } = useBreakpointsContext();
    const dispatch = useDispatch();
    const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    const openAddUserModal = () => {
        setEditUser(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleRefresh = () => {
        dispatch(fetchUsers());
    };

    const onSuccess = () => {
        handleRefresh();
    };

    return (
        <>
            <div className="table-toolbar">
                <div
                    className={clsx(
                        "transition-content flex items-center justify-between gap-4",
                        isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x) pt-4"
                    )}
                >
                    <div className="min-w-0 flex items-center gap-3">
                        <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
                            Users
                        </h2>
                        {refreshing && (
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                <GhostSpinner className="size-4" />
                                <span className="text-xs">Refreshing...</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            variant="outlined"
                            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
                        >
                            <ArrowPathIcon className={clsx("size-4", refreshing && "animate-spin")} />
                            <span>Refresh</span>
                        </Button>
                        <Button
                            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
                            color="primary"
                            onClick={openAddUserModal}
                        >
                            <PlusIcon className="size-5" />
                            <span>Add User</span>
                        </Button>
                    </div>
                </div>

                {isXs ? (
                    <>
                        <div
                            className={clsx(
                                "flex gap-2 pt-4 [&_.input-root]:flex-1",
                                isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)"
                            )}
                        >
                            <SearchInput table={table} />
                            <TableConfig table={table} />
                        </div>
                        <div
                            className={clsx(
                                "hide-scrollbar flex shrink-0 gap-2 overflow-x-auto pb-1 pt-4",
                                isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)"
                            )}
                        >
                            <Filters table={table} />
                        </div>
                    </>
                ) : (
                    <div
                        className={clsx(
                            "custom-scrollbar transition-content flex justify-between gap-4 overflow-x-auto pb-1 pt-4",
                            isFullScreenEnabled ? "px-4 sm:px-5" : "px-(--margin-x)"
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

            <AddEditUserModal
                open={isModalOpen}
                onClose={closeModal}
                user={editUser}
                onSuccess={onSuccess}
            />
        </>
    );
}

function SearchInput({ table }) {
    return (
        <Input
            value={table.getState().globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder="Search Name, Email, Status..."
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
};

SearchInput.propTypes = {
    table: PropTypes.object.isRequired,
};

Filters.propTypes = {
    table: PropTypes.object.isRequired,
};
