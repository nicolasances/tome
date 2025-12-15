import React from "react";


/**
 * This component is a graphical representation of a week. 
 * 
 * It represents the week as follows: 
 * - 1 row (on the top) with 1 square, centered
 * - 2 rows of 3 squares
 * 
 * Squares all have the same size.
 * Each square can be filled or not. 
 * 
 * The component receives a prop `filled` which is an array of booleans indicating whether each square is filled.
 * 
 * Tailwind CSS classes are used for styling.
 */
interface WeekSquareProps {
    filled: boolean[];
}

const WeekSquare: React.FC<WeekSquareProps> = ({ filled }) => {
    // filled[0] = bottom row, left
    // filled[1] = bottom row, middle
    // filled[2] = bottom row, right
    // filled[3] = middle row, left
    // filled[4] = middle row, middle
    // filled[5] = middle row, right
    // filled[6] = top row, center

    const renderSquare = (isFilled: boolean, key: number) => (
        <div
            key={key}
            className={`w-3 h-3 border rounded-xs mx-0.1 my-0.1 flex-shrink-0 ${
                isFilled ? "bg-lime-300" : "bg-cyan-700"
            }`}
        />
    );

    return (
        <div className="flex flex-col items-center">
            {/* Top row */}
            <div className="flex justify-center">
                {renderSquare(filled[6] ?? false, 6)}
            </div>
            {/* Middle row */}
            <div className="flex justify-center">
                {Array.from({ length: 3 }).map((_, i) =>
                    renderSquare(filled[i + 3] ?? false, i + 3)
                )}
            </div>
            {/* Bottom row */}
            <div className="flex justify-center">
                {Array.from({ length: 3 }).map((_, i) =>
                    renderSquare(filled[i] ?? false, i)
                )}
            </div>
        </div>
    );
};

export default WeekSquare;