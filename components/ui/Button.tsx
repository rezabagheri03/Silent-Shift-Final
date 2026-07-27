"use client";

import Link from "next/link";
import { forwardRef } from "react";

type Variant = "default" | "outline";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "leading" | "trailing";
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
};

type Props = ButtonProps | LinkProps;

const base =
  "inline-flex items-center justify-center gap-2 rounded-md text-d-button transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  default: "bg-brand text-brand-on hover:bg-brand-hover active:bg-[#B08B28]",
  outline:
    "border border-brand text-brand bg-transparent hover:bg-[rgba(212,175,55,0.08)] active:bg-[rgba(212,175,55,0.16)]",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-3",
  lg: "px-4 py-4 min-h-[56px]",
};

const Spinner = () => (
  <span
    className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
    aria-hidden="true"
  />
);

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, Props>(
  function Button(
    {
      variant = "default",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = "trailing",
      className = "",
      children,
      ...rest
    },
    ref
  ) {
    const classes = [
      base,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      className,
    ].join(" ");

    const inner = (
      <>
        {loading ? (
          <Spinner />
        ) : (
          icon && iconPosition === "leading" && <span aria-hidden="true">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && icon && iconPosition === "trailing" && (
          <span aria-hidden="true">{icon}</span>
        )}
      </>
    );

    if ("href" in rest && rest.href) {
      const { href, ...anchorRest } = rest as LinkProps;
      const isExternal = /^https?:\/\//.test(href);
      if (isExternal) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            {...anchorRest}
          >
            {inner}
          </a>
        );
      }
      return (
        <Link
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
        >
          {inner}
        </Link>
      );
    }

    const buttonProps = rest as ButtonProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={loading || buttonProps.disabled}
        {...buttonProps}
      >
        {inner}
      </button>
    );
  }
);
