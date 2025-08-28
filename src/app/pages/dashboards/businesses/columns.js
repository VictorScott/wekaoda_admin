import { createColumnHelper } from "@tanstack/react-table";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import { RowActions } from "./RowActions";
import {
    NameCell,
    LevelCell,
    StatusCell,
} from "./rows";

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.display({
        id: "select",
        label: 'Row Selection',
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor((row) => row.name, {
        id: "name",
        header: "Name",
        label: 'Name',
        cell: NameCell,
    }),
    columnHelper.accessor((row) => row.level, {
        id: "level",
        header: "Level",
        label: 'Level',
        cell: LevelCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.category, {
        id: "type",
        header: "type",
        label: 'type',
    }),
    columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        label: 'Status',
        cell: StatusCell,
        filter: "searchableSelect",
        filterFn: "arrIncludesSome",
    }),
    columnHelper.display({
        id: "actions",
        header: "",
        label: 'Row Actions',
        cell: RowActions,
    }),
    columnHelper.accessor((row) => row.lesson_count, {
        id: "lesson_count",
        isHiddenColumn: true,
        filterFn: "inNumberRange",
        filter: "numberRange",
    }),
    columnHelper.accessor((row) => row.students, {
        id: "students",
        isHiddenColumn: true,
        filterFn: "inNumberRange",
        filter: "numberRange",
    }),
    columnHelper.accessor((row) => row.duration, {
        id: "duration",
        isHiddenColumn: true,
        filterFn: "inNumberRange",
        filter: "numberRange",
    }),
]
