import React from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SearchFiltersProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-indigo-100/20 dark:border-indigo-900/20">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by gene name or genome..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="annotated">Annotated</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="length">Length</SelectItem>
                <SelectItem value="position">Position</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("grid")}
                className="rounded-none rounded-l-md"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => onViewModeChange("list")}
                className="rounded-none rounded-r-md"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;