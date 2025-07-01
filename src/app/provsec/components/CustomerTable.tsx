"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { Customer, CustomerResponse } from "@/types/customer";

const CustomerTable = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // 定义列
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "Invoice ID",
      enableSorting: false,
      size: 80,
      minSize: 80,
      maxSize: 80,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "first_name",
      header: "First Name",
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("first_name") || "-"}</div>
      ),
    },
    {
      accessorKey: "middle_name",
      header: "Middle Name",
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("middle_name") || "-"}</div>
      ),
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("last_name") || "-"}</div>
      ),
    },
    {
      accessorKey: "attendee_name",
      header: "attendee Name",
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("attendee_name") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      size: 200,
      minSize: 200,
      maxSize: 250,
      cell: ({ row }) => (
        <div className="truncate">{row.getValue("email") || "-"}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: false,
      size: 130,
      minSize: 130,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("phone") || "-"}</div>
      ),
    },
    {
      accessorKey: "affiliation",
      header: "Affiliation",
      enableSorting: false,
      size: 150,
      minSize: 150,
      maxSize: 200,
      cell: ({ row }) => (
        <div className="truncate">{row.getValue("affiliation") || "-"}</div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 150,
      cell: ({ row }) => (
        <div className="truncate">{row.getValue("position") || "-"}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      size: 100,
      minSize: 100,
      maxSize: 100,
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        return <div>{status === 1 ? "Paid" : "Unpaid"}</div>;
      },
    },
    {
      accessorKey: "create_date",
      header: "Created Date",
      size: 120,
      minSize: 120,
      maxSize: 120,
      cell: ({ row }) => {
        const date = row.getValue("create_date") as string;
        return (
          <div className="text-sm text-gray-600">
            {date ? new Date(date).toLocaleDateString("en-UK") : "-"}
          </div>
        );
      },
    },
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        pageSize: pagination.pageSize.toString(),
        search: globalFilter,
        sortBy: sorting.length > 0 ? sorting[0].id : "id",
        sortOrder:
          sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc",
      });

      const response = await fetch(`/api/customers?${params}`);
      const result: CustomerResponse = await response.json();

      setData(result.data);
      setTotal(result.pagination.total || 0);
      setTotalPages(result.pagination.totalPages || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 监听状态变化
  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, sorting]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
    columnResizeMode: "onChange",
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table style={{ tableLayout: "fixed", width: "100%" }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          maxWidth: header.getSize(),
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center space-x-1 ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <div className="flex flex-col">
                                {{
                                  asc: <ChevronUp className="h-3 w-3" />,
                                  desc: <ChevronDown className="h-3 w-3" />,
                                }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDown className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          maxWidth: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页控件 */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total {total} records, Page {pagination.pageIndex + 1} of{" "}
            {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={
                      pagination.pageIndex + 1 === pageNumber
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => table.setPageIndex(pageNumber - 1)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTable;
