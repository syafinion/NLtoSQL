import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ checked, onCheckedChange, className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      className={className + ' rounded border-gray-300 text-blue-600 focus:ring-blue-500'}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 