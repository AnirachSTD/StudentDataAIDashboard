import React from 'react';

interface DataTableProps {
    headers: string[];
    rows: (string | number)[][];
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
    return (
        <div className="overflow-x-auto my-2 rounded-lg border border-border shadow-sm">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-card-foreground">
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