import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all align-top disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        primary: 'border border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        default: 'border bg-background shadow-xs hover:border-primary hover:text-primary',
        dashed: 'border border-dashed bg-background shadow-xs hover:border-primary hover:text-primary',
        text: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:text-primary/70',
      },
      size: {
        default: 'h-8 px-4 py-2 has-[>svg]:px-3',
        small: 'h-6 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        large: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
