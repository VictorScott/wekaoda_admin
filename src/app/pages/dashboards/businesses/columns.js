import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";
import {
    NameCell,
    LevelCell,
    StatusCell,
    VerificationStatusCell,
} from "./rows";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor((row) => row.business_name, {
        id: "business_name",
        header: "Name",
        label: "Business Name",
        cell: NameCell,
    }),
    columnHelper.accessor((row) => row.business_level, {
        id: "business_level",
        header: "Level",
        label: "Level",
        cell: LevelCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.business_type, {
        id: "business_type",
        header: "Type",
        label: "Type",
    }),
    columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        label: "Status",
        cell: StatusCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.verification_status, {
        id: "verification_status",
        header: "Verification",
        label: "Verification",
        cell: VerificationStatusCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.display({
        id: "actions",
        header: "",
        label: "Row Actions",
        cell: RowActions,
    }),
];
