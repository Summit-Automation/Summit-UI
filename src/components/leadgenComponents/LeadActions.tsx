'use client';

import { Button } from "@/components/ui/button";
import { Plus, Bot, Download, Filter, RefreshCw } from "lucide-react";

interface LeadActionsProps {
  onNewLead: () => void;
  onAIGenerate: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
}

export default function LeadActions({ 
  onNewLead, 
  onAIGenerate, 
  onRefresh,
  onExport, 
  onFilter 
}: LeadActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex gap-3">
        <Button 
          onClick={onNewLead}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
        
        <Button 
          onClick={onAIGenerate}
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
        >
          <Bot className="mr-2 h-4 w-4" />
          AI Generate
        </Button>
      </div>
      
      <div className="flex gap-3 sm:ml-auto">
        {onRefresh && (
          <Button 
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
        
        {onFilter && (
          <Button 
            onClick={onFilter}
            variant="outline"
            size="sm"
            className="border-slate-200 hover:bg-slate-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        )}
        
        {onExport && (
          <Button 
            onClick={onExport}
            variant="outline"
            size="sm"
            className="border-slate-200 hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}