import React from 'react';
import { clsx } from 'clsx';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className="relative w-full overflow-x-auto rounded-lg border border-slate-200">
      <table
        className={clsx('w-full caption-bottom text-sm text-left border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <thead className={clsx('bg-slate-50 border-b border-slate-200', className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tbody className={clsx('divide-y divide-slate-100 bg-white', className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tr
      className={clsx('transition-colors hover:bg-slate-50/70 data-[state=selected]:bg-slate-100', className)}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <th
      className={clsx(
        'h-11 px-4 text-left align-middle font-semibold text-xs text-slate-600 uppercase tracking-wider select-none',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <td className={clsx('p-4 align-middle text-slate-700 text-sm', className)} {...props}>
      {children}
    </td>
  );
};
