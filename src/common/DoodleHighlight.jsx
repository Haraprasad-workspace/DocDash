import { RoughNotation } from "react-rough-notation";

export const DoodleHighlight = ({ children, color = "#F59E0B", type = "underline", show = true }) => {
    return (
        <RoughNotation
            type={type}
            show={show}
            color={color}
            padding={5}
            animationDuration={1500}
            animationDelay={500}
            strokeWidth={2}
            iterations={3} // Makes it look sketchier
        >
            {children}
        </RoughNotation>
    );
};
