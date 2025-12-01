import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import checkboxTick from "../../assets/icons/checkbox_tick.svg";
import checkboxUntick from "../../assets/icons/checkbox_untick.svg";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(props.checked);

  React.useEffect(() => {
    setIsChecked(props.checked);
  }, [props.checked]);

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      onCheckedChange={(checked) => {
        setIsChecked(checked);
        if (props.onCheckedChange) {
          props.onCheckedChange(checked);
        }
      }}
    >
      <img
        src={isChecked ? checkboxTick : checkboxUntick}
        alt="checkbox"
        style={{ width: '20px', height: '20px' }}
      />
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
