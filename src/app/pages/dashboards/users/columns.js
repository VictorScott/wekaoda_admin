import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";
import {NameCell, StatusCell} from "./rows.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor((row) => row.name, {
        id: "full_name",
        header: "Name",
        label: "Full Name",
        cell: NameCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.email, {
        id: "email",
        header: "Email",
        label: "Email",
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        label: "Status",
        cell: StatusCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.is_logged_in, {
        id: "is_logged_in",
        header: "Logged In",
        label: "Logged In",
        cell: info => info.getValue() ? "Yes" : "No",
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.occupation, {
        id: "occupation",
        header: "Occupation",
        label: "Occupation",
    }),
    columnHelper.accessor(row => row.last_login_at, {
        id: "last_login_at",
        header: "Last Login",
        label: "Last Login",
        cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString() : 'Never',
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        label: "Actions",
        cell: RowActions,
    }),
];
