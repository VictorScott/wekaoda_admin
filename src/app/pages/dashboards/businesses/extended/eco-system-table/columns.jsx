import { createColumnHelper } from "@tanstack/react-table";
import { Badge, Button } from "components/ui";
import { EyeIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

const columnHelper = createColumnHelper();

export const createColumns = () => [
    columnHelper.accessor("eco_code", {
        id: "eco_code",
        header: "Eco Code",
        label: "Eco Code",
        cell: ({ getValue }) => (
            <Badge color="info" size="sm" className="font-mono">
                {getValue()}
            </Badge>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor("ecosystem_name", {
        id: "ecosystem_name",
        header: "Ecosystem Name",
        label: "Ecosystem Name",
        cell: ({ getValue }) => (
            <span className="font-medium text-gray-900 dark:text-dark-100">
                {getValue()}
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor((row) => {
        // Determine which business is the partner and get its level
        // This will be the partner business level
        return row.partner_business_level || row.business_b?.business_level || row.business_a?.business_level;
    }, {
        id: "partner_business_level",
        header: "Business Level",
        label: "Business Level",
        cell: ({ getValue }) => {
            const level = getValue();
            const levelConfig = {
                'Anchor': { color: 'primary' },
                'Sub-Anchor': { color: 'info' },
                'Distributor': { color: 'success' },
                'Supplier': { color: 'warning' },
                'Stockiest': { color: 'secondary' },
                'Retailer': { color: 'neutral' }
            };
            const config = levelConfig[level] || { color: 'neutral' };
            
            return (
                <Badge color={config.color} size="sm">
                    {level || 'Unknown'}
                </Badge>
            );
        },
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor((row) => {
        // Determine which business is the partner
        return row.business_b?.business_name || row.business_a?.business_name;
    }, {
        id: "partner_business_name",
        header: "Partner Business",
        label: "Partner Business",
        cell: ({ getValue }) => (
            <span className="text-gray-700 dark:text-dark-200">
                {getValue()}
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor("loan_payment_cycle_days", {
        id: "loan_payment_cycle_days",
        header: "Credit Period",
        label: "Credit Period (Days)",
        cell: ({ getValue }) => (
            <span className="text-gray-700 dark:text-dark-200">
                {getValue()} days
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor("interest_rate", {
        id: "interest_rate",
        header: "Interest Rate",
        label: "Interest Rate (%)",
        cell: ({ getValue }) => (
            <span className="text-gray-700 dark:text-dark-200">
                {getValue()}%
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        label: "Status",
        cell: ({ getValue }) => {
            const status = getValue();
            const statusConfig = {
                active: {
                    text: "Active",
                    color: "success"
                },
                inactive: {
                    text: "Inactive",
                    color: "neutral"
                },
                suspended: {
                    text: "Suspended",
                    color: "error"
                }
            };

            const config = statusConfig[status] || statusConfig.inactive;

            return (
                <Badge color={config.color} size="sm">
                    {config.text}
                </Badge>
            );
        },
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.accessor("created_at", {
        id: "created_at",
        header: "Created Date",
        label: "Created Date",
        cell: ({ getValue }) => (
            <span className="text-gray-700 dark:text-dark-200">
                {dayjs(getValue()).format("MMM D, YYYY")}
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button
                variant="outlined"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    // Use a unique event identifier to prevent multiple modals
                    const eventId = `openPartnershipDetails_${row.original.id}_${Date.now()}`;
                    const event = new CustomEvent('openPartnershipDetails', {
                        detail: { 
                            ecosystemData: row.original,
                            eventId: eventId
                        }
                    });
                    window.dispatchEvent(event);
                }}
                className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            >
                <EyeIcon className="size-4" />
                <span>Details</span>
            </Button>
        ),
        enableSorting: false,
        enableColumnFilter: false,
    }),
];
