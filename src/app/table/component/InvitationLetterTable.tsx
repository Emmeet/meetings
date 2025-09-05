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
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Download,
} from "lucide-react";
import {
  AsiacryptVisaRequest,
  AsiacryptVisaRequestResponse,
} from "@/types/asiacrypt";
import * as XLSX from "xlsx";

const InvitationLetterTable = () => {
  const [data, setData] = useState<AsiacryptVisaRequest[]>([]);
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
  const [isExporting, setIsExporting] = useState(false);

  // 定义列
  const columns: ColumnDef<AsiacryptVisaRequest>[] = [
    {
      accessorKey: "id",
      header: "ID",
      size: 80,
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 100,
    },
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "middle_name",
      header: "Middle Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 220,
    },
    {
      accessorKey: "date_of_birth",
      header: "Date of Birth",
      cell: ({ row }) => {
        const date = row.getValue("date_of_birth") as string;
        return (
          <div className="text-sm text-gray-600">
            {date ? new Date(date).toLocaleDateString("en-UK") : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
    },
    {
      accessorKey: "institute",
      header: "Institute",
      size: 220,
      cell: ({ row }) => {
        const value = row.getValue("institute") as string;
        const display =
          value && value.length > 20 ? value.slice(0, 20) + "..." : value;
        return (
          <div title={value} className="truncate max-w-[180px]">
            {display || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "paper_title",
      header: "Paper Title",
      size: 220,
      cell: ({ row }) => {
        const value = row.getValue("paper_title") as string;
        const display =
          value && value.length > 20 ? value.slice(0, 20) + "..." : value;
        return (
          <div title={value} className="truncate max-w-[180px]">
            {display || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "academic_profile",
      header: "Academic Profile",
      size: 220,
      cell: ({ row }) => {
        const value = row.getValue("academic_profile") as string;
        const display =
          value && value.length > 20 ? value.slice(0, 20) + "..." : value;
        return (
          <div title={value} className="truncate max-w-[180px]">
            {display || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "conference_interests",
      header: "Conference Interests",
      size: 220,
      cell: ({ row }) => {
        const value = row.getValue("conference_interests") as string;
        const display =
          value && value.length > 20 ? value.slice(0, 20) + "..." : value;
        return (
          <div title={value} className="truncate max-w-[180px]">
            {display || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "iacr_experience",
      header: "IACR Experience",
      size: 220,
      cell: ({ row }) => {
        const value = row.getValue("iacr_experience") as string;
        const display =
          value && value.length > 20 ? value.slice(0, 20) + "..." : value;
        return (
          <div title={value} className="truncate max-w-[180px]">
            {display || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "create_date",
      header: "Created Date",
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
        type: "0",
      });

      const response = await fetch(`/api/asiacrypt-visa-request?${params}`);
      const result: AsiacryptVisaRequestResponse = await response.json();

      setData(result.data);
      setTotal(result.pagination.total || 0);
      setTotalPages(result.pagination.totalPages || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 导出Excel函数
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/asiacrypt-visa-request/export?type=0");
      const result = await response.json();

      if (result.success && result.data) {
        // 创建工作簿
        const workbook = XLSX.utils.book_new();

        // 将数据转换为工作表
        const worksheet = XLSX.utils.json_to_sheet(result.data);

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Asiacrypt Visa Request"
        );

        // 生成文件名（包含当前日期）
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD格式
        const filename = `asiacrypt_visa_request_${dateStr}.xlsx`;

        // 下载文件
        XLSX.writeFile(workbook, filename);
      } else {
        console.error("Export failed:", result.error);
        alert("Export failed, please try again later");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed, please try again later");
    } finally {
      setIsExporting(false);
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
                placeholder="Search..."
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

export default InvitationLetterTable;
