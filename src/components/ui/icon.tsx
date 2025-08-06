import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Icon variants using class-variance-authority
const iconVariants = cva(
  'ds-icon',
  {
    variants: {
      size: {
        xs: 'ds-icon-xs',
        sm: 'ds-icon-sm',
        md: 'ds-icon-md',
        lg: 'ds-icon-lg',
        xl: 'ds-icon-xl',
        '2xl': 'ds-icon-2xl',
      },
      strokeWidth: {
        thin: 'ds-icon-thin',
        normal: 'ds-icon-normal',
        thick: 'ds-icon-thick',
      },
      iconColor: {
        primary: 'ds-icon-primary',
        secondary: 'ds-icon-secondary',
        success: 'ds-icon-success',
        warning: 'ds-icon-warning',
        danger: 'ds-icon-danger',
        info: 'ds-icon-info',
        muted: 'ds-icon-muted',
      },
    },
    defaultVariants: {
      size: 'md',
      strokeWidth: 'normal',
    },
  }
);

export interface IconProps
  extends Omit<React.SVGAttributes<SVGElement>, 'color'>,
    VariantProps<typeof iconVariants> {
  children: React.ReactNode;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, strokeWidth, iconColor, children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(iconVariants({ size, strokeWidth, iconColor, className }))}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {children}
      </svg>
    );
  }
);
Icon.displayName = 'Icon';

export { Icon, iconVariants };