import { cn } from '@/lib/utils';
import { LoaderPinwheelIcon } from 'lucide-react';

export const Spinner = ({ className, ...props }) => (
  <LoaderPinwheelIcon
    className={cn('animate-spin', className)}
    {...props}
  />
);
