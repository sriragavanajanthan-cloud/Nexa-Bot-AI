declare module "@/components/ui/button" {
  import { ButtonHTMLAttributes, ReactNode, RefAttributes } from "react";

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & RefAttributes<HTMLButtonElement>
  >;
}
