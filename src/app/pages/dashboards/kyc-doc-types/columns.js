import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";
import { DocumentNameCell, RequirementLevelCell, BusinessTypeCell, ExpiresTypeCell } from "./rows.jsx";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.accessor((row) => row.doc_name, {
        id: "doc_name",
        header: "Document Name",
        label: "Document Name",
        cell: DocumentNameCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.requirement_level, {
        id: "requirement_level",
        header: "Requirement Level",
        label: "Requirement Level",
        cell: RequirementLevelCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.business_type, {
        id: "business_type",
        header: "Business Type",
        label: "Business Type",
        cell: BusinessTypeCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.expires_type, {
        id: "expires_type",
        header: "Expires",
        label: "Expires",
        cell: ExpiresTypeCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor(row => row.created_at, {
        id: "created_at",
        header: "Created",
        label: "Created",
        cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '-',
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
