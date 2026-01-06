import * as React from "react"
import { cn } from "../../lib/utils"

// A simplified Select that uses native select but looks roughly like shadcn
const Select = React.forwardRef(({ className, ...props }, ref) => (
    <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          ref={ref}
          {...props}
        />
        {/* Simple chevron icon could go here if we wanted to be fancy, but keeping it simple for native */}
    </div>
))
Select.displayName = "Select"

export { Select }
