
/**
 * Displays a bar with segments.
 * Segments can be either 2 or 3. 
 * Each segment can be selected.
 */
export function SegmentedBar({segments}: { segments: number[]}) {

    // Widths are calculated as percentages. It's an array of 3 elements. Each is the ratio of the i-th segment to the sum of all segments.
    const total = segments.reduce((acc, val) => acc + val, 0);
    const widths = segments.map(segment => `${(segment / total) * 100}%`);

    return (
        <div className="">
            <div className="flex w-full text-sm">
                <div className="flex items-center justify-center bg-amber-200 rounded-l-full py-1 text-center text-black" style={{width: widths[0]}}>O</div>
                <div className="flex items-center justify-center bg-cyan-400 py-1 text-center text-black" style={{width: widths[1]}}>R</div>
                <div className="flex items-center justify-center bg-cyan-700 rounded-r-full py-1 text-center text-white" style={{width: widths[2]}}>F</div>
            </div>
        </div>
    )

}
