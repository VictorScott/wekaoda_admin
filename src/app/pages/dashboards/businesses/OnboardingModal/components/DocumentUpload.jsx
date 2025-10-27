import { CloudArrowUpIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { forwardRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import { PreviewImg } from "components/shared/PreviewImg";
import { Button, InputErrorMsg, Upload } from "components/ui";

const DocumentUpload = forwardRef(
    ({ value, onChange, label, labelProps, classNames, error }, ref) => {
        const { getRootProps, getInputProps, isDragReject, isDragAccept } =
            useDropzone({
                onDrop: useCallback((acceptedFiles) => {
                    const file = acceptedFiles[0];
                    if (file) {
                        onChange(file);
                    }
                }, [onChange]),
                accept: {
                    "image/png": [".png"],
                    "image/jpeg": [".jpeg", ".jpg"],
                    "application/pdf": [".pdf"],
                },
                multiple: false,
            });

        const onRemove = () => {
            onChange(null);
        };

        const isPDF = value?.type === "application/pdf";

        return (
            <div className="flex w-full flex-col">
                {label && (
                    <label
                        className={clsx("input-label", classNames?.label)}
                        {...labelProps}
                    >
                        {label}
                    </label>
                )}
                <div
                    className={clsx(
                        "h-72 w-full rounded-lg border-2 border-dashed border-current",
                        !isDragAccept &&
                        (isDragReject || error) &&
                        "text-error dark:text-error-light",
                        isDragAccept && "text-primary-600 dark:text-primary-500",
                        !isDragReject &&
                        !isDragAccept &&
                        !error &&
                        "text-gray-300 dark:text-dark-450",
                        classNames?.box
                    )}
                >
                    <Upload
                        inputProps={{ ...getInputProps() }}
                        {...getRootProps()}
                        ref={ref}
                    >
                        {({ ...props }) =>
                            value ? (
                                <div
                                    title={value.name}
                                    className="group relative h-full w-full rounded-lg ring-primary-600 ring-offset-4 ring-offset-white transition-all hover:ring-3 dark:ring-primary-500 dark:ring-offset-dark-700"
                                >
                                    <div className="h-full w-full overflow-hidden p-4">
                                        {isPDF ? (
                                            <div className="flex h-full flex-col items-center justify-center space-y-3 text-center">
                                                <div className="text-gray-400 dark:text-dark-300">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="h-12 w-12"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M19.5 14.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5h6.75M15 19.5l3 3 3-3m-3 3V10.5"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="text-sm font-medium text-gray-700 dark:text-dark-200">
                                                    {value.name}
                                                </div>
                                            </div>
                                        ) : (
                                            <PreviewImg
                                                className="m-auto h-full object-contain"
                                                file={value}
                                                alt={value.name}
                                            />
                                        )}
                                    </div>

                                    <div className="absolute -right-3 -top-4 flex items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-dark-700">
                                        <Button
                                            onClick={onRemove}
                                            className="size-6 shrink-0 rounded-full border p-0 dark:border-dark-450"
                                        >
                                            <XMarkIcon className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    unstyled
                                    className="h-full w-full shrink-0 flex-col space-x-2 px-3"
                                    {...props}
                                >
                                    <CloudArrowUpIcon className="pointer-events-none size-12" />
                                    <span className="pointer-events-none mt-2 text-gray-600 dark:text-dark-200">
                                        <span className="text-primary-600 dark:text-primary-400">
                                          Browse
                                        </span>
                                        <span> or drop your files here</span>
                                    </span>
                                </Button>
                            )
                        }
                    </Upload>
                </div>
                <InputErrorMsg
                    when={error && typeof error !== "boolean"}
                    className={classNames?.error}
                >
                    {error}
                </InputErrorMsg>
            </div>
        );
    }
);

DocumentUpload.displayName = "DocumentUpload";

DocumentUpload.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
    error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    label: PropTypes.node,
    labelProps: PropTypes.object,
    classNames: PropTypes.object,
};

export { DocumentUpload };
