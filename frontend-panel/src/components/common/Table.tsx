import React from "react";

interface TableProps {
  columns: Array<{
    key: string;
    title: string;
    render?: (value: any, record: any) => React.ReactNode;
  }>;
  data: any[];
  isLoading?: boolean;
  onRowClick?: (record: any) => void;
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  isLoading,
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full bg-white">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/90">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 last:border-b-0 hover:bg-primary-50/40 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(record)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-sm text-gray-700"
                >
                  {column.render
                    ? column.render(record[column.key], record)
                    : record[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
