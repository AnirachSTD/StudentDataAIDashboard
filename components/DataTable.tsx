import React from 'react';

interface DataTableProps {
    headers: string[];
    rows: (string | number)[][];
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
    return (
        <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;