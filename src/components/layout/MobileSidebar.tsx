"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar"; 

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="left" className="p-0 border-r-0 w-72 bg-transparent text-[#1D1D1F]">
                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                <Sidebar className="w-full relative static z-auto" isMobile={true} />
            </SheetContent>
        </Sheet>
    );
}
