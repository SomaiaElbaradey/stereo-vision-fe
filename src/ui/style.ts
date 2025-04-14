import styled, { css } from "styled-components";

export type StyledButtonProps = {
    variant?: "secondary" | "primary" | "outlined" | "disabled-contained";
    size?: "xl" | "lg" | "md" | "sm" | "xsm";
    isAuto?: boolean;
    disabled?: boolean;
};

export const StyledButton = styled.button<StyledButtonProps>`
    border: none;
    padding: 16px 32px;
    width: ${(props) => (props.isAuto ? "auto" : "292px")};
    height: 52px;
    font: inherit;
    cursor: pointer;
    outline: inherit;
    background-color: #5ece7b;
    color: white;

    ${({ variant }) => {
        switch (variant) {
            case "secondary":
                return css`
                    background-color: #1d1f22;
                `;
            case "outlined":
                return css`
                    background-color: transparent;
                    border: 1px solid #292929;
                    color: #292929;
                    &:hover,
                    &:active {
                        color: white;
                        background-color: #292929;
                    }
                `;
            case "disabled-contained":
                return css`
                    background-color: #a6a6a633;
                    color: #a6a6a6;
                    border: 1px solid #a6a6a6;
                `;
            case "primary":
            default:
                return css`
                    background-color: #5ece7b;
                    margin: 5px;
                `;
        }
    }}

    ${({ size, isAuto }) => {
        switch (size) {
            case "xl":
                return css`
                    width: 200px;
                    height: 47px;
                `;
            case "lg":
                return css`
                    width: 170px;
                    height: 47px;
                `;
            case "sm":
                return css`
                    width: 45px;
                    height: 45px;
                `;
            case "xsm":
                return css`
                    width: 24px;
                    height: 24px;
                `;
            case "md":
            default:
                return css`
                    width: 63px;
                    height: 45px;
                    ${isAuto && "width: auto; margin: 0.3rem"}
                `;
        }
    }}
`;
