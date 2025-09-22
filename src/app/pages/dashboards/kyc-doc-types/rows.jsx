import { Badge } from "components/ui";
import PropTypes from "prop-types";

export function DocumentNameCell({ getValue }) {
    const docName = getValue();
    
    return (
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <svg className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-dark-50">
                    {docName}
                </p>
            </div>
        </div>
    );
}

DocumentNameCell.propTypes = {
    getValue: PropTypes.func.isRequired,
};

export function RequirementLevelCell({ getValue }) {
    const level = getValue();
    
    const getVariant = (level) => {
        switch (level) {
            case 'mandatory':
                return 'error';
            case 'optional':
                return 'info';
            default:
                return 'secondary';
        }
    };

    return (
        <Badge variant={getVariant(level)} className="capitalize">
            {level}
        </Badge>
    );
}

RequirementLevelCell.propTypes = {
    getValue: PropTypes.func.isRequired,
};

export function BusinessTypeCell({ getValue, row }) {
    const businessType = getValue();
    const businessTypeName = row.original.business_type_name || businessType;
    
    const getBusinessTypeStyles = (type) => {
        switch (type) {
            case 'private_limited':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'public_limited':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'sole_proprietorship':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'partnership':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'non_profit':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100';
        }
    };
    
    return (
        <div className="flex items-center">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBusinessTypeStyles(businessType)}`}>
                {businessTypeName}
            </span>
        </div>
    );
}

BusinessTypeCell.propTypes = {
    getValue: PropTypes.func.isRequired,
    row: PropTypes.object.isRequired,
};

export function ExpiresTypeCell({ getValue }) {
    const expiresType = getValue();
    
    const getVariant = (type) => {
        switch (type) {
            case 'yes':
                return 'warning';
            case 'permanent':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const getDisplayText = (type) => {
        switch (type) {
            case 'yes':
                return 'Expires';
            case 'permanent':
                return 'Permanent';
            default:
                return type;
        }
    };

    return (
        <Badge variant={getVariant(expiresType)} className="capitalize">
            {getDisplayText(expiresType)}
        </Badge>
    );
}

ExpiresTypeCell.propTypes = {
    getValue: PropTypes.func.isRequired,
};
