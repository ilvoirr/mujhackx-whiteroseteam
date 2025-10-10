// components/ui/button.tsx
import * as React from "react"; // Imports all exports from React as a namespace 'React'
import { Slot } from "@radix-ui/react-slot"; // Imports the 'Slot' component from Radix UI, used for flexible component rendering
import { cva, type VariantProps } from "class-variance-authority"; // Imports cva (class variance authority) for creating maintainable, customizable, and reusable class combinations, and VariantProps for type inference
import { cn } from "@/lib/utils"; // Imports a utility function 'cn' (likely for conditionally joining class names)

// Defines the base styles and variants for the button using cva
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Defines different button visual styles
      variant: {
        default: "bg-[#6c63fe] text-white hover:bg-[#5a57e6]", // Default button style with a specific background and hover effect
        outline:
          "bg-transparent border border-white text-white hover:bg-[#6c63fe] hover:text-white", // Outline button style with transparent background and white border
        ghost: "bg-transparent text-white hover:bg-[#6c63fe] hover:text-white", // Ghost button style with transparent background
        link: "underline-offset-4 hover:underline text-primary", // Link button style with underline on hover
      },
      // Defines different button sizes
      size: {
        default: "h-10 px-4 py-2", // Default button size
        sm: "h-9 rounded-md px-3", // Small button size
        lg: "h-11 rounded-md px-8", // Large button size
        icon: "h-10 w-10", // Icon button size (square)
      },
    },
    // Sets the default variant and size for the button
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Defines the props interface for the Button component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Inherits standard HTML button attributes
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // Optional prop to render the component as a child of another component (using Radix UI's Slot)
}

// Defines the Button component using React.forwardRef to allow ref forwarding
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Determines whether to render a 'Slot' component or a standard 'button' element
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))} // Applies combined class names based on variants and any additional class names
        ref={ref} // Forwards the ref to the underlying DOM element or component
        {...props} // Passes any other remaining props to the component
      />
    );
  }
);

// Sets the display name for the Button component, useful for debugging
Button.displayName = "Button";

// Exports the Button component and buttonVariants for use in other parts of the application
export { Button, buttonVariants };