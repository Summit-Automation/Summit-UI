'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    itemName: string;
    isDeleting?: boolean;
    error?: string | null;
}

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    description, 
    itemName,
    isDeleting = false,
    error = null
}: DeleteConfirmationModalProps) {
    const [confirmationText, setConfirmationText] = useState('');
    
    const isConfirmationValid = confirmationText === itemName;

    const handleConfirm = () => {
        if (isConfirmationValid) {
            onConfirm();
        }
    };

    const handleClose = () => {
        setConfirmationText('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
                            <p className="text-sm text-slate-400">This action cannot be undone</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <p className="text-slate-300">{description}</p>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm font-medium">
                                ⚠️ Warning: This will permanently delete all associated data including tasks, time entries, and comments.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300 font-medium">
                            Type &ldquo;<span className="font-mono text-red-400">{itemName}</span>&rdquo; to confirm:
                        </Label>
                        <Input
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder={`Type ${itemName} here`}
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
                            disabled={isDeleting}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-700/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!isConfirmationValid || isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Forever
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}