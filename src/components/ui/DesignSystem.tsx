import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Key,
  Laptop,
  Package,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wallet,
  Watch,
  X,
} from 'lucide-react';
import { resolveItemImage } from '../../data/itemAssets';
import type { ClaimStatus, ItemCategory, ItemStatus, ItemType, UserStatus } from '../../types';

// 1. Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'burgundy' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#172B45] text-white hover:bg-[#1E3758] border border-[#172B45] shadow-xs',
    secondary:
      'bg-white text-[#252A32] hover:bg-[#F8F6F0] border border-[#E8E4DA]',
    gold:
      'bg-[#B99A55] text-[#172B45] font-semibold hover:bg-[#AD8E4A] border border-[#B99A55]',
    burgundy:
      'bg-[#813D42] text-white hover:bg-[#6E3237] border border-[#813D42]',
    ghost:
      'bg-transparent text-[#252A32] hover:bg-[#E8E4DA]/40 border border-transparent',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A55] disabled:opacity-55 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};

// 2. Card Component (Single-Elevation Depth, Soft Warm Border)
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
      ? 'p-4'
      : padding === 'lg'
      ? 'p-7'
      : 'p-5 sm:p-6';

  return (
    <div
      className={`bg-white border border-[#E8E4DA] rounded-lg shadow-[0_1px_2px_rgba(23,43,69,0.04)] ${padClass} ${className}`}
    >
      {children}
    </div>
  );
};

// 3. StatusBadge Component (Crisp architectural tags—explicit text label, subtle border, zero neon/pills)
type BadgeStatus =
  | ItemType
  | ItemStatus
  | ClaimStatus
  | UserStatus
  | 'admin'
  | 'student';

const STATUS_STYLE_MAP: Record<
  BadgeStatus,
  { label: string; classes: string; icon?: React.ReactNode }
> = {
  lost: {
    label: 'Lost',
    classes: 'bg-[#F7ECEC] text-[#813D42] border-[#E5C8CA]',
  },
  found: {
    label: 'Found',
    classes: 'bg-[#EEF2F6] text-[#172B45] border-[#CFD8E3]',
  },
  open: {
    label: 'Open Case',
    classes: 'bg-[#F8F6F0] text-[#252A32] border-[#E8E4DA]',
  },
  claimed: {
    label: 'Claim in Review',
    classes: 'bg-[#F9F4E8] text-[#7D6124] border-[#E4D4AA]',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-[#F9F4E8] text-[#7D6124] border-[#E4D4AA]',
    icon: <Clock className="w-3 h-3" aria-hidden="true" />,
  },
  approved: {
    label: 'Approved',
    classes: 'bg-[#ECF5EF] text-[#215A38] border-[#C4DFCE]',
    icon: <CheckCircle2 className="w-3 h-3" aria-hidden="true" />,
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-[#F7ECEC] text-[#813D42] border-[#E5C8CA]',
    icon: <ShieldAlert className="w-3 h-3" aria-hidden="true" />,
  },
  returned: {
    label: 'Returned',
    classes: 'bg-[#172B45] text-[#F8F6F0] border-[#172B45]',
    icon: <RotateCcw className="w-3 h-3" aria-hidden="true" />,
  },
  archived: {
    label: 'Archived',
    classes: 'bg-[#F3F2EE] text-[#777777] border-[#E8E4DA]',
  },
  active: {
    label: 'Active',
    classes: 'bg-[#ECF5EF] text-[#215A38] border-[#C4DFCE]',
  },
  suspended: {
    label: 'Suspended',
    classes: 'bg-[#F7ECEC] text-[#813D42] border-[#E5C8CA]',
  },
  admin: {
    label: 'Administrator',
    classes: 'bg-[#F9F4E8] text-[#7D6124] border-[#E4D4AA]',
  },
  student: {
    label: 'Student',
    classes: 'bg-[#EEF2F6] text-[#172B45] border-[#CFD8E3]',
  },
};

export const StatusBadge: React.FC<{ status: BadgeStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const cfg = STATUS_STYLE_MAP[status] || {
    label: status,
    classes: 'bg-[#F8F6F0] text-[#252A32] border-[#E8E4DA]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase border rounded ${cfg.classes} whitespace-nowrap shrink-0 ${className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// 4. ItemThumbnail (Zero-Broken-Image Policy with category SVG fallback)
function CategoryFallbackIcon({ category }: { category: string }) {
  const cls = 'w-9 h-9 text-[#172B45]/45';
  switch (category as ItemCategory) {
    case 'Electronics':
      return <Laptop className={cls} strokeWidth={1.4} />;
    case 'Wallets & IDs':
      return <Wallet className={cls} strokeWidth={1.4} />;
    case 'Books & Notes':
      return <BookOpen className={cls} strokeWidth={1.4} />;
    case 'Accessories':
      return <Watch className={cls} strokeWidth={1.4} />;
    case 'Keys':
      return <Key className={cls} strokeWidth={1.4} />;
    case 'Bags & Apparel':
      return <Briefcase className={cls} strokeWidth={1.4} />;
    default:
      return <Package className={cls} strokeWidth={1.4} />;
  }
}

export const ItemThumbnail: React.FC<{
  imageKey?: string;
  imageUrl?: string;
  title: string;
  category: string;
  className?: string;
}> = ({ imageKey, imageUrl, title, category, className = '' }) => {
  const resolved = resolveItemImage(imageKey, imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F8F6F0] to-[#EAE5D9] text-center p-4 ${className}`}
      >
        <div className="w-16 h-16 rounded-full bg-white/80 border border-[#E8E4DA] flex items-center justify-center mb-2.5">
          <CategoryFallbackIcon category={category} />
        </div>
        <span className="text-xs font-medium text-[#777777] tracking-wide uppercase">
          {category}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={title}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

// 5. Modal Component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 'lg',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    maxWidth === 'md' ? 'max-w-md' : maxWidth === 'xl' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172B45]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-heading"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative z-10 w-full ${widthClass} bg-white border border-[#E8E4DA] rounded-lg shadow-xl max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#E8E4DA] bg-[#F8F6F0]/60">
          <div>
            <h3 id="modal-heading" className="font-serif text-xl font-semibold text-[#172B45]">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#777777] mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md text-[#777777] hover:text-[#252A32] hover:bg-[#E8E4DA]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 6. Empty State Component
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="bg-white border border-[#E8E4DA] rounded-lg py-14 px-6 text-center">
    <div className="w-12 h-12 rounded-full bg-[#F8F6F0] border border-[#E8E4DA] text-[#172B45] flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-serif text-lg font-semibold text-[#172B45]">{title}</h3>
    <p className="text-sm text-[#777777] max-w-md mx-auto mt-1.5 leading-relaxed">{description}</p>
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);

// 7. Loading Skeletons
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="bg-white border border-[#E8E4DA] rounded-lg overflow-hidden animate-pulse"
      >
        <div className="aspect-[4/3] bg-[#EAE5D9]" />
        <div className="p-5 space-y-3">
          <div className="h-3 w-1/3 bg-[#EAE5D9] rounded" />
          <div className="h-5 w-4/5 bg-[#EAE5D9] rounded" />
          <div className="h-3.5 w-2/3 bg-[#EAE5D9] rounded" />
        </div>
      </div>
    ))}
  </div>
);

// 8. Form Field Label Helper
export const FormLabel: React.FC<{
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}> = ({ htmlFor, required, children, hint }) => (
  <div className="mb-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[#252A32]">
      {children}
      {required && <span className="text-[#813D42] ml-1">*</span>}
    </label>
    {hint && <p className="text-xs text-[#777777] mt-0.5">{hint}</p>}
  </div>
);

export const inputBaseClasses =
  'w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E4DA] rounded-md text-[#252A32] placeholder:text-[#777777]/70 focus:outline-none focus:border-[#172B45] focus:ring-1 focus:ring-[#172B45] transition-colors';

// 9. Toast Notification Banner
export const ToastBanner: React.FC<{
  message: string;
  type?: 'success' | 'error';
  onDismiss: () => void;
}> = ({ message, type = 'success', onDismiss }) => (
  <div
    role="status"
    className={`fixed bottom-5 right-5 z-50 max-w-md flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm ${
      type === 'error'
        ? 'bg-[#813D42] text-white border-[#6E3237]'
        : 'bg-[#172B45] text-white border-[#172B45]'
    }`}
  >
    {type === 'error' ? (
      <ShieldAlert className="w-4 h-4 text-[#F8F6F0] shrink-0" />
    ) : (
      <Sparkles className="w-4 h-4 text-[#B99A55] shrink-0" />
    )}
    <span className="flex-1 leading-snug">{message}</span>
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss message"
      className="text-white/75 hover:text-white cursor-pointer"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);
