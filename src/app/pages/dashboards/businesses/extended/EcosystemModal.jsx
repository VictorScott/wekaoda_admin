import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { 
    XMarkIcon,
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
import {Button, Table, Card, THead, TBody, Th, Tr, Td, Spinner} from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
import { useLockScrollbar, useLocalStorage, useDidUpdate } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { fetchBusinessEcosystems } from "store/slices/businessSlice";
import { Toolbar } from "./eco-system-table/Toolbar";
import { createColumns } from "./eco-system-table/columns";
import PartnershipDetailsModal from "./PartnershipDetailsModal.jsx";

const isSafari = getUserAgentBrowser() === "Safari";

export default function EcosystemModal({ open, onClose, businessData }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    const { cardSkin } = useThemeContext();
    
    const [loading, setLoading] = useState(false);
    const [ecosystems, setEcosystems] = useState([]);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);
    const [partnershipDetailsOpen, setPartnershipDetailsOpen] = useState(false);
    const [selectedEcosystem, setSelectedEcosystem] = useState(null);
    const [lastEventId, setLastEventId] = useState(null);
    
    // Table settings
    const [tableSettings, setTableSettings] = useState({
        enableFullScreen: false,
        enableRowDense: false,
        enableSorting: true,
        enableColumnFilters: true,
    });

    const [toolbarFilters, setToolbarFilters] = useState(["status"]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    // Safe localStorage keys
    const businessId = businessData?.business_id || 'default';
    const [columnVisibility, setColumnVisibility] = useLocalStorage(
        `column-visibility-ecosystems-${businessId}`,
        {}
    );

    const [columnPinning, setColumnPinning] = useLocalStorage(
        `column-pinning-ecosystems-${businessId}`,
        {}
    );

    const [autoResetPageIndex] = useSkipper();

    const fetchEcosystems = useCallback(async () => {
        if (!businessData?.business_id) {
            setError("No business data available");
            return;
        }
        
        setLoading(true);
        setError("");
        try {
            const result = await dispatch(fetchBusinessEcosystems({
                businessId: businessData.business_id,
            })).unwrap();
            
            if (result.success) {
                setEcosystems(result.data || []);
                setLastUpdated(new Date());
            } else {
                setError(result.message || `Failed to fetch echo systems`);
            }
        } catch (err) {
            console.error('Error fetching ecosystems:', err);
            setError(err.message || `Failed to fetch echo systems`);
        } finally {
            setLoading(false);
        }
    }, [dispatch, businessData]);

    useEffect(() => {
        if (open && businessData) {
            fetchEcosystems();
        }
    }, [open, businessData, fetchEcosystems]);

    // Listen for Details button clicks
    useEffect(() => {
        if (!open) return; // Only listen when modal is open
        
        const handleOpenPartnershipDetails = (event) => {
            // Prevent multiple modals from opening using unique event ID
            const eventId = event.detail.eventId;
            if (partnershipDetailsOpen || lastEventId === eventId) return;
            
            setLastEventId(eventId);
            setSelectedEcosystem(event.detail.ecosystemData);
            setPartnershipDetailsOpen(true);
        };

        window.addEventListener('openPartnershipDetails', handleOpenPartnershipDetails);
        
        return () => {
            window.removeEventListener('openPartnershipDetails', handleOpenPartnershipDetails);
        };
    }, [open, partnershipDetailsOpen, lastEventId]);

    const handleClose = () => {
        setError("");
        setPartnershipDetailsOpen(false);
        setSelectedEcosystem(null);
        setLastEventId(null);
        onClose();
        
        setTimeout(() => {
            setEcosystems([]);
            setGlobalFilter("");
            setSorting([]);
            setRowSelection({});
        }, 300);
    };

    const columns = createColumns();

    const table = useReactTable({
        data: ecosystems || [],
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

    useDidUpdate(() => table.resetRowSelection(), [ecosystems]);
    useLockScrollbar(tableSettings.enableFullScreen);

    // Early return if no business data
    if (!businessData) {
        return null;
    }

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
                                            Ecosystem List
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
                                            onRefresh={fetchEcosystems}
                                            businessName={businessData?.business_name || "Unknown Business"}
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
                                                <Spinner color="primary" />
                                                <span className="ml-3 text-gray-600 dark:text-dark-300">Loading ecosystems...</span>
                                            </div>
                                        ) : error ? (
                                            <div className="text-center py-8">
                                                <div className="text-error dark:text-error-light mb-4">{error}</div>
                                                <Button onClick={fetchEcosystems} size="sm">
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
                                                                                <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                    <p className="text-lg font-medium text-gray-700 dark:text-dark-50">
                                                        No Ecosystems found
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-dark-200">
                                                        {globalFilter ? `No results found for "${globalFilter}"` : `No ecosystems exist yet for ${businessData?.business_name || "this business"}.`}
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
        open={partnershipDetailsOpen}
        onClose={() => setPartnershipDetailsOpen(false)}
        ecosystemData={selectedEcosystem}
        businessData={businessData}
    />
</>
);
}

EcosystemModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    businessData: PropTypes.object,
};
