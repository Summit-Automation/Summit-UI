'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bot, Download, Filter, RefreshCw } from "lucide-react";

interface LeadActionsProps {
  onNewLead: () => void;
  onAIGenerate: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onFilter?: () => void;
}

function LeadActions({ 
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
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
        
        <Button 
          onClick={onAIGenerate}
          variant="outline"
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
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when callback functions haven't changed
export default React.memo(LeadActions);