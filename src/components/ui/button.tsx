'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        "primary-blue":
          "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md",
        warning:
          "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md",
        info:
          "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md",
        "outline-destructive":
          "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950",
        "outline-success":
          "border border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950",
        "ghost-destructive":
          "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950",
        "ghost-success":
          "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          loading && "relative"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && (
              <span className="ml-2 text-sm">
                {loadingText}
              </span>
            )}
          </div>
        )}
        
        <div className={cn(
          "flex items-center justify-center gap-2",
          loading && "opacity-0"
        )}>
          {leftIcon && (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          )}
          
          {children}
          
          {rightIcon && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 