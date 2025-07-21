'use client';

import { useState, useCallback } from 'react';

// Modal management hook
export function useModal() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleClose = useCallback(() => {
        setOpen(false);
        setIsSubmitting(false);
    }, []);
    
    const handleOpen = useCallback(() => setOpen(true), []);
    
    return { 
        open, 
        setOpen, 
        isSubmitting, 
        setIsSubmitting, 
        handleClose, 
        handleOpen 
    };
}