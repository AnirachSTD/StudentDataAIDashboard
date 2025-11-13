import React from 'react';

interface TableData {
    headers: string[];
    rows: string[][];
}

const TableRenderer: React.FC<{ table: TableData }> = ({ table }) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-border shadow-sm">
        <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
                <tr>
                    {table.headers.map((header, i) => (
                        <th key={i} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
                {table.rows.map((row, i) => (
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

const ChatMessageContent: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let tableLines: string[] = [];
    let keyIndex = 0;

    const parseAndPushTable = () => {
        if (tableLines.length > 1 && tableLines[1].includes('---')) {
            const headers = tableLines[0].split('|').slice(1, -1).map(h => h.trim());
            // Filter out empty rows that might result from trailing newlines
            const dataRows = tableLines.slice(2).filter(line => line.trim() !== '');
            const rows = dataRows.map(rowLine =>
                rowLine.split('|').slice(1, -1).map(cell => cell.trim())
            ).filter(row => row.length > 0 && row.some(cell => cell !== '')); // Ensure row is not empty

            if (headers.length > 0 && rows.length > 0) {
                 elements.push(<TableRenderer key={`table-${keyIndex++}`} table={{ headers, rows }} />);
            } else {
                 tableLines.forEach(line => elements.push(<p key={`text-${keyIndex++}`} className="text-sm">{line}</p>));
            }
        } else {
            tableLines.forEach(line => elements.push(<p key={`text-${keyIndex++}`} className="text-sm">{line}</p>));
        }
        tableLines = [];
    };

    for (const line of lines) {
        const trimmedLine = line.trim();
        const isTableLine = trimmedLine.startsWith('|') && trimmedLine.endsWith('|');

        if (isTableLine) {
            tableLines.push(trimmedLine);
        } else {
            if (tableLines.length > 0) {
                parseAndPushTable();
            }
            if (trimmedLine) {
                elements.push(<p key={`text-${keyIndex++}`} className="text-sm">{trimmedLine}</p>);
            }
        }
    }
    
    if (tableLines.length > 0) {
        parseAndPushTable();
    }

    if (elements.length === 0) {
        return <p className="text-sm">{text}</p>;
    }

    return <div className="space-y-2">{elements}</div>;
};

export default ChatMessageContent;