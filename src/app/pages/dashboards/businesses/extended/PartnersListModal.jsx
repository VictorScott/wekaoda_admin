import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
    UserGroupIcon,
    BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import {
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Button, GhostSpinner, Table, Card, THead, TBody, Th, Tr, Td } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { useLockScrollbar, useLocalStorage, useDidUpdate } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { fetchBusinessPartners } from "store/slices/businessSlice";
import PartnershipDetailsModal from "./PartnershipDetailsModal";
import { Toolbar } from "./partners-table/Toolbar";
import { createColumns } from "./partners-table/columns";

const isSafari = getUserAgentBrowser() === "Safari";

export default function PartnersListModal({ open, onClose, businessData, partnersType }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    const { cardSkin } = useThemeContext();
    
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState([]);
    const [error, setError] = useState("");
    const [partnershipModalOpen, setPartnershipModalOpen] = useState(false);
    const [selectedPartnership, setSelectedPartnership] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    
    // Table settings
    const [tableSettings, setTableSettings] = useState({
        enableFullScreen: false,
        enableRowDense: false,
        enableSorting: true,
        enableColumnFilters: true,
    });

    const [toolbarFilters, setToolbarFilters] = useState(["status", "partnership_status"]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    const [columnVisibility, setColumnVisibility] = useLocalStorage(
        `column-visibility-partners-${partnersType}`,
        {}
    );

    const [columnPinning, setColumnPinning] = useLocalStorage(
        `column-pinning-partners-${partnersType}`,
        {}
    );

    const [autoResetPageIndex] = useSkipper();

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await dispatch(fetchBusinessPartners({
                businessId: businessData.business_id,
                type: partnersType
            })).unwrap();
            
            if (result.success) {
                setPartners(result.data || []);
                setLastUpdated(new Date());
            } else {
                setError(result.message || `Failed to fetch ${partnersType}`);
            }
        } catch (err) {
            setError(err.message || `Failed to fetch ${partnersType}`);
        } finally {
            setLoading(false);
        }
    }, [dispatch, businessData, partnersType]);

    useEffect(() => {
        if (open && businessData && partnersType) {
            fetchPartners();
        }
    }, [open, businessData, partnersType, fetchPartners]);

    const handleClose = () => {
        // Don't clear partners data immediately to prevent flash
        setError("");
        onClose();
        
        // Clear state after modal closes
        setTimeout(() => {
            setPartners([]);
            setGlobalFilter("");
            setSorting([]);
            setRowSelection({});
        }, 300);
    };

    const handleViewPartnership = (partner) => {
        setSelectedPartnership(partner);
        setPartnershipModalOpen(true);
    };

    // Create columns with callback
    const columns = createColumns(handleViewPartnership);

    // React table setup
    const table = useReactTable({
        data: partners || [],
        columns: columns,
        state: {
            globalFilter,
            sorting,
            columnVisibility,
            columnPinning,
            tableSettings,
            toolbarFilters,
            rowSelection,
        },
        meta: {
            setTableSettings,
            setToolbarFilters,
        },
        filterFns: {
            fuzzy: fuzzyFilter,
            arrIncludesSome: (row, columnId, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const value = row.getValue(columnId);
                return filterValue.includes(value);
            },
        },
        enableSorting: tableSettings.enableSorting,
        enableColumnFilters: tableSettings.enableColumnFilters,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        globalFilterFn: fuzzyFilter,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onColumnPinningChange: setColumnPinning,
        onRowSelectionChange: setRowSelection,
        autoResetPageIndex,
    });

    useDidUpdate(() => table.resetRowSelection(), [partners]);
    useLockScrollbar(tableSettings.enableFullScreen);

    return (
        <>
            <Transition appear show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                    onClose={handleClose}
                    initialFocus={closeButtonRef}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
                    </TransitionChild>

                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className={clsx(
                            "relative flex w-full origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700",
                            tableSettings.enableFullScreen ? "max-w-full h-full" : "max-w-6xl"
                        )}>
                            <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                                <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                    Partners List
                                </DialogTitle>
                                <Button
                                    onClick={handleClose}
                                    variant="flat"
                                    isIcon
                                    className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                                    ref={closeButtonRef}
                                >
                                    <XMarkIcon className="size-4.5" />
                                </Button>
                            </div>

                            <div
                                className={clsx(
                                    "flex h-full w-full flex-col",
                                    tableSettings.enableFullScreen &&
                                    "fixed inset-0 z-61 bg-white pt-3 dark:bg-dark-900"
                                )}
                            >
                                <Toolbar 
                                    table={table} 
                                    refreshing={loading} 
                                    lastUpdated={lastUpdated}
                                    onRefresh={fetchPartners}
                                    businessName={businessData.business_name}
                                    partnersType={partnersType}
                                />
                                <div
                                    className={clsx(
                                        "transition-content flex grow flex-col pt-3",
                                        tableSettings.enableFullScreen
                                            ? "overflow-hidden"
                                            : "px-4"
                                    )}
                                >
                                    <Card
                                        className={clsx(
                                            "relative flex grow flex-col mb-6",
                                            tableSettings.enableFullScreen && "overflow-hidden"
                                        )}
                                    >

                                        {loading ? (
                                            <div className="flex justify-center items-center py-12">
                                                <GhostSpinner className="size-8" />
                                                <span className="ml-3 text-gray-600 dark:text-dark-300">Loading partners...</span>
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-8">
                                                <div className="text-error dark:text-error-light mb-4">{error}</div>
                                                <Button onClick={fetchPartners} size="sm">
                                                    Try Again
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="table-wrapper min-w-full grow overflow-x-auto">
                                                    <Table
                                                        hoverable
                                                        dense={tableSettings.enableRowDense}
                                                        sticky={tableSettings.enableFullScreen}
                                                        className="w-full text-left rtl:text-right"
                                                    >
                                                        <THead>
                                                            {table.getHeaderGroups().map((headerGroup) => (
                                                                <Tr key={headerGroup.id}>
                                                                    {headerGroup.headers
                                                                        .filter(
                                                                            (header) => !header.column.columnDef.isHiddenColumn
                                                                        )
                                                                        .map((header) => (
                                                                            <Th
                                                                                key={header.id}
                                                                                className={clsx(
                                                                                    "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                                                                                    header.column.getCanPin() && [
                                                                                        header.column.getIsPinned() === "left" &&
                                                                                        "sticky z-2 ltr:left-0 rtl:right-0",
                                                                                        header.column.getIsPinned() === "right" &&
                                                                                        "sticky z-2 ltr:right-0 rtl:left-0",
                                                                                    ]
                                                                                )}
                                                                            >
                                                                                {header.column.getCanSort() ? (
                                                                                    <div
                                                                                        className="flex cursor-pointer select-none items-center space-x-3"
                                                                                        onClick={header.column.getToggleSortingHandler()}
                                                                                    >
                                                                                        <span className="flex-1">
                                                                                            {header.isPlaceholder
                                                                                                ? null
                                                                                                : flexRender(
                                                                                                    header.column.columnDef.header,
                                                                                                    header.getContext()
                                                                                                )}
                                                                                        </span>
                                                                                        <TableSortIcon
                                                                                            sorted={header.column.getIsSorted()}
                                                                                        />
                                                                                    </div>
                                                                                ) : header.isPlaceholder ? null : (
                                                                                    flexRender(
                                                                                        header.column.columnDef.header,
                                                                                        header.getContext()
                                                                                    )
                                                                                )}
                                                                            </Th>
                                                                        ))}
                                                                </Tr>
                                                            ))}
                                                        </THead>
                                                        <TBody>
                                                            {table.getRowModel().rows.length === 0 ? (
                                                                <Tr>
                                                                    <Td colSpan={table.getAllColumns().length} className="h-[400px] text-center">
                                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                                            <div className="rounded-full bg-gray-100 p-8 dark:bg-dark-700">
                                                                                {partnersType === 'suppliers' ? (
                                                                                    <UserGroupIcon className="h-12 w-12 text-gray-400" />
                                                                                ) : (
                                                                                    <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                                                                                )}
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <p className="text-lg font-medium text-gray-700 dark:text-dark-50">
                                                                                    No {partnersType} found
                                                                                </p>
                                                                                <p className="text-sm text-gray-500 dark:text-dark-200">
                                                                                    {globalFilter ? `No results found for "${globalFilter}"` : `No ${partnersType} partnerships exist yet.`}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </Td>
                                                                </Tr>
                                                            ) : (
                                                                table.getRowModel().rows.map((row) => {
                                                                    return (
                                                                        <Tr
                                                                            key={row.id}
                                                                            className={clsx(
                                                                                "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                                                                                row.getIsSelected() &&
                                                                                !isSafari &&
                                                                                "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
                                                                            )}
                                                                        >
                                                                            {row
                                                                                .getVisibleCells()
                                                                                .filter(
                                                                                    (cell) => !cell.column.columnDef.isHiddenColumn
                                                                                )
                                                                                .map((cell) => {
                                                                                    return (
                                                                                        <Td
                                                                                            key={cell.id}
                                                                                            className={clsx(
                                                                                                "relative",
                                                                                                cardSkin === "shadow"
                                                                                                    ? "dark:bg-dark-700"
                                                                                                    : "dark:bg-dark-900",
                                                                                                cell.column.getCanPin() && [
                                                                                                    cell.column.getIsPinned() === "left" &&
                                                                                                    "sticky z-2 ltr:left-0 rtl:right-0",
                                                                                                    cell.column.getIsPinned() === "right" &&
                                                                                                    "sticky z-2 ltr:right-0 rtl:left-0",
                                                                                                ]
                                                                                            )}
                                                                                        >
                                                                                            {cell.column.getIsPinned() && (
                                                                                                <div
                                                                                                    className={clsx(
                                                                                                        "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
                                                                                                        cell.column.getIsPinned() === "left"
                                                                                                            ? "ltr:border-r rtl:border-l"
                                                                                                            : "ltr:border-l rtl:border-r"
                                                                                                    )}
                                                                                                ></div>
                                                                                            )}
                                                                                            {flexRender(
                                                                                                cell.column.columnDef.cell,
                                                                                                cell.getContext()
                                                                                            )}
                                                                                        </Td>
                                                                                    );
                                                                                })}
                                                                        </Tr>
                                                                    );
                                                                })
                                                            )}
                                                        </TBody>
                                                    </Table>
                                                </div>
                                                {table.getCoreRowModel().rows.length > 0 && (
                                                    <div
                                                        className={clsx(
                                                            "px-4 pb-4 sm:px-5 sm:pt-4",
                                                            tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
                                                            "pt-4"
                                                        )}
                                                    >
                                                        <PaginationSection table={table} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Card>
                                </div>
                            </div>

                            {!tableSettings.enableFullScreen && (
                                <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                                    <Button
                                        onClick={handleClose}
                                        variant="outlined"
                                        className="min-w-[7rem]"
                                    >
                                        Close
                                    </Button>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

            {/* Partnership Details Modal */}
            <PartnershipDetailsModal
                open={partnershipModalOpen}
                onClose={() => setPartnershipModalOpen(false)}
                partnershipData={selectedPartnership}
                businessData={businessData}
            />
        </>
    );
}

PartnersListModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    businessData: PropTypes.object,
    partnersType: PropTypes.oneOf(['suppliers', 'anchors']),
};
