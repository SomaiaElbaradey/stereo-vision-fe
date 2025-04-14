import React from 'react'
import { StyledButton, StyledButtonProps } from './style';

export type ButtonProps = StyledButtonProps &
    React.HTMLAttributes<HTMLButtonElement>;

export default function Button({
    variant,
    size,
    children,
    isAuto,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <StyledButton isAuto={isAuto} variant={variant} size={size} disabled={disabled} {...props}>
            {children}
        </StyledButton>
    )
}