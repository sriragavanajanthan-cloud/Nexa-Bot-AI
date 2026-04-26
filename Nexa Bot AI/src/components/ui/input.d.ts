declare module "@/components/ui/input" {
    import { InputHTMLAttributes } from "react";
    
    export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
      className?: string;
    }
    
    export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
  }