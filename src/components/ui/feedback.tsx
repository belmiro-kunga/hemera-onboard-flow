import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Icon } from './icon';

// Notification variants
const notificationVariants = cva(
  'ds-notification',
  {
    variants: {
      variant: {
        success: 'ds-notification-success',
        error: 'ds-notification-error',
        info: 'ds-notification-info',
        warning: 'ds-notification-warning',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// Toast variants
const toastVariants = cva(
  'ds-toast',
  {
    variants: {
      variant: {
        success: 'ds-toast-success',
        error: 'ds-toast-error',
        info: 'ds-toast-info',
        warning: 'ds-toast-warning',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// Alert variants
const alertVariants = cva(
  'ds-alert',
  {
    variants: {
      variant: {
        success: 'ds-alert-success',
        error: 'ds-alert-error',
        info: 'ds-alert-info',
        warning: 'ds-alert-warning',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

// Icon mapping for different variants
const getVariantIcon = (variant: 'success' | 'error' | 'info' | 'warning') => {
  switch (variant) {
    case 'success':
      return CheckCircle;
    case 'error':
      return XCircle;
    case 'info':
      return Info;
    case 'warning':
      return AlertTriangle;
    default:
      return Info;
  }
};

// Notification Component
export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string;
  message: string;
  showIcon?: boolean;
  onClose?: () => void;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ className, variant = 'info', title, message, showIcon = true, onClose, ...props }, ref) => {
    const IconComponent = getVariantIcon(variant);

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant, className }))}
        {...props}
      >
        {showIcon && (
          <Icon size="sm" className="mt-0.5">
            <IconComponent />
          </Icon>
        )}
        <div className="flex-1">
          {title && <div className="ds-feedback-title">{title}</div>}
          <div className="ds-feedback-message">{message}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ds-feedback-close"
            aria-label="Close notification"
          >
            <Icon size="sm">
              <X />
            </Icon>
          </button>
        )}
      </div>
    );
  }
);
Notification.displayName = 'Notification';

// Toast Component
export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  message: string;
  showIcon?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'info', title, message, showIcon = true, onClose, actions, ...props }, ref) => {
    const IconComponent = getVariantIcon(variant);

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, className }))}
        {...props}
      >
        {showIcon && (
          <Icon size="sm" className="mt-0.5">
            <IconComponent />
          </Icon>
        )}
        <div className="flex-1">
          {title && <div className="ds-feedback-title">{title}</div>}
          <div className="ds-feedback-message">{message}</div>
          {actions && <div className="ds-feedback-actions">{actions}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ds-feedback-close"
            aria-label="Close toast"
          >
            <Icon size="sm">
              <X />
            </Icon>
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Alert Component
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  message: string;
  showIcon?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, message, showIcon = true, onClose, actions, ...props }, ref) => {
    const IconComponent = getVariantIcon(variant);

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, className }))}
        {...props}
      >
        {showIcon && (
          <Icon size="sm" className="mt-0.5">
            <IconComponent />
          </Icon>
        )}
        <div className="flex-1">
          {title && <div className="ds-feedback-title">{title}</div>}
          <div className="ds-feedback-message">{message}</div>
          {actions && <div className="ds-feedback-actions">{actions}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ds-feedback-close"
            aria-label="Close alert"
          >
            <Icon size="sm">
              <X />
            </Icon>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export {
  Notification,
  Toast,
  Alert,
  notificationVariants,
  toastVariants,
  alertVariants,
};