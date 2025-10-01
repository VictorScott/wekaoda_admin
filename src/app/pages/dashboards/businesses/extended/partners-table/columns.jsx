import { createColumnHelper } from "@tanstack/react-table";
import { Badge, Button } from "components/ui";
import { EyeIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";

const columnHelper = createColumnHelper();

export const createColumns = (onViewDetails) => [
    columnHelper.display({
        id: "actions",
        header: "Actions",
        label: "Row Actions",
        cell: ({ row }) => (
            <div className="flex justify-center">
                <Button
                    size="sm"
                    onClick={() => onViewDetails(row.original)}
                    className="inline-flex items-center"
                >
                    <EyeIcon className="size-4 mr-1" />
                    Details
                </Button>
            </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
    }),

    columnHelper.accessor("business_name", {
        id: "business_name",
        header: "Business Name",
        label: "Business Name",
        cell: ({ row }) => (
            <div>
                <div className="font-medium text-gray-900 dark:text-dark-100">
                    {row.original.business_name}
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-300">
                    {row.original.business_level}
                </div>
            </div>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),

    columnHelper.accessor("business_email", {
        id: "business_email",
        header: "Email",
        label: "Business Email",
        cell: ({ getValue }) => (
            <span className="text-gray-900 dark:text-dark-100">
                {getValue()}
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),

    columnHelper.accessor("registration_number", {
        id: "registration_number",
        header: "Registration",
        label: "Registration Number",
        cell: ({ getValue }) => (
            <span className="text-gray-900 dark:text-dark-100">
                {getValue() || 'N/A'}
            </span>
        ),
        enableSorting: true,
        enableColumnFilter: true,
    }),

    columnHelper.accessor((row) => row.business_level, {
        id: "business_level",
        header: "Level",
        label: "Business Level",
        cell: ({ getValue }) => {
            const level = getValue();
            const color = level === 'Anchor' ? 'primary' : level === 'Supplier' ? 'success' : 'neutral';
            return (
                <Badge color={color} size="sm">
                    {level}
                </Badge>
            );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),

    columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Business Status",
        label: "Business Status",
        cell: ({ getValue }) => {
            const status = getValue();
            const statusConfig = {
                active: { color: 'success', label: 'Active' },
                suspended: { color: 'error', label: 'Suspended' },
                inactive: { color: 'neutral', label: 'Inactive' },
                pending: { color: 'warning', label: 'Pending' }
            };
            
            const config = statusConfig[status] || { color: 'neutral', label: status || 'Unknown' };
            return (
                <Badge color={config.color} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),

    columnHelper.accessor((row) => row.partnership_status, {
        id: "partnership_status",
        header: "Partnership",
        label: "Partnership Status",
        cell: ({ getValue }) => {
            const status = getValue();
            const statusConfig = {
                active: { color: 'success', label: 'Active' },
                suspended: { color: 'error', label: 'Suspended' },
                inactive: { color: 'neutral', label: 'Inactive' },
                pending: { color: 'warning', label: 'Pending' }
            };
            
            const config = statusConfig[status] || { color: 'neutral', label: status || 'Unknown' };
            return (
                <Badge color={config.color} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),

    columnHelper.accessor("partnership_created_at", {
        id: "partnership_created_at",
        header: "Partnership Date",
        label: "Partnership Created Date",
        cell: ({ getValue }) => {
            const date = getValue();
            return date ? dayjs(date).format('MMM DD, YYYY') : 'N/A';
        },
        enableSorting: true,
        enableColumnFilter: false,
    }),
];
