import { useState } from "react";
import { useDispatch } from "react-redux";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button, GhostSpinner } from "components/ui";
import { toast } from "sonner";
import { deleteKYCDocType, fetchKYCDocTypes } from "store/slices/kycDocTypesSlice";
import PropTypes from "prop-types";

export function SelectedRowsActions({ table }) {
    const dispatch = useDispatch();
    const [isDeleting, setIsDeleting] = useState(false);
    
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCount = selectedRows.length;

    if (selectedCount === 0) {
        return null;
    }

    const handleBulkDelete = async () => {
        const selectedDocTypes = selectedRows.map(row => row.original);
        const docTypeNames = selectedDocTypes.map(dt => dt.doc_name).join(", ");
        
        if (!confirm(`Are you sure you want to delete ${selectedCount} document type(s)?\n\n${docTypeNames}`)) {
            return;
        }

        setIsDeleting(true);
        
        try {
            const deletePromises = selectedDocTypes.map(docType => 
                dispatch(deleteKYCDocType(docType.id)).unwrap()
            );

            const results = await Promise.allSettled(deletePromises);
            
            const successful = results.filter(result => result.status === 'fulfilled' && result.value.success !== false);
            const failed = results.filter(result => result.status === 'rejected' || result.value.success === false);

            if (successful.length > 0) {
                toast.success(`${successful.length} document type(s) deleted successfully!`);
            }

            if (failed.length > 0) {
                toast.error(`Failed to delete ${failed.length} document type(s).`);
            }

            // Refresh the table data
            dispatch(fetchKYCDocTypes());
            
            // Clear selection
            table.resetRowSelection();
            
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while deleting document types.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-dark-500 dark:bg-dark-800 sm:px-5">
            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-100">
                    {selectedCount} selected
                </span>
            </div>
            
            <div className="flex items-center space-x-2">
                <Button
                    onClick={() => table.resetRowSelection()}
                    variant="outlined"
                    size="sm"
                    disabled={isDeleting}
                >
                    Clear Selection
                </Button>
                
                <Button
                    onClick={handleBulkDelete}
                    color="error"
                    size="sm"
                    disabled={isDeleting}
                    className="flex items-center space-x-2"
                >
                    {isDeleting ? (
                        <GhostSpinner className="size-4 border-2 border-white/30 border-t-white" />
                    ) : (
                        <TrashIcon className="size-4" />
                    )}
                    <span>{isDeleting ? "Deleting..." : "Delete Selected"}</span>
                </Button>
            </div>
        </div>
    );
}

SelectedRowsActions.propTypes = {
    table: PropTypes.object.isRequired,
};
