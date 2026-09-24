import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: DialogPrimitive.Popup.Props & { side?: "left" | "right" }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex h-full w-[min(100vw,300px)] flex-col bg-sidebar text-sidebar-foreground shadow-xl outline-none transition-transform duration-200",
          side === "left"
            ? "left-0 top-0 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
            : "right-0 top-0 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("sr-only", className)}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle }
