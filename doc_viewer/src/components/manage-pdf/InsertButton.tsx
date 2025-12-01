import React from "react";
import controlPoint from "../../assets/icons/control_point.svg";

interface InsertButtonProps {
    onInsert: () => void;
    title?: string;
}
const InsertButton: React.FC<InsertButtonProps> = ({ onInsert, title }) => (
    <button
        onClick={onInsert}
        className="flex items-center justify-center"
        title={title ?? "Insert pages here"}
        style={{ width: '16.6px', height: '216px' }}
    >
        <img src={controlPoint} alt="Insert pages" style={{ width: '13.3px', height: '13.3px'}} />
    </button>
);
export default InsertButton;
