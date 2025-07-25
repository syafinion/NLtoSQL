import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label ref={ref} className={className + ' text-sm font-medium text-gray-700'} {...props} />
));

Label.displayName = 'Label';

export { Label }; 