import { Practice } from "@/model/Practice";
import * as d3 from "d3";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

/**
 * This component draws a SVG graph that shows a line chart of the score of each historical practice.
 * 
 * The width is the full width of the container div. 
 * The height is fixed. 
 * 
 * The x axis should be the date, while the y axis the score.
 * 
 * For each local maximum there should be a label with the score above the data point.
 * For each local minimum there should be a label with the score below the data point.
 */
export function PracticeHistoryGraph({ historicalPractices }: { historicalPractices: Practice[] }) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const height = 300;
    const margin = { top: 40, right: 10, bottom: 40, left: 10 };

    useEffect(() => {
        function handleResize() {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!historicalPractices || historicalPractices.length === 0 || width === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Parse dates and scores
        const data = historicalPractices
            .map(d => ({
                date: moment(d.finishedOn!, 'YYYYMMDD').toDate(),
                score: d.score ?? 0 // Default to 0 if undefined
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date) as [Date, Date])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.score) ?? 100])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Line
        const line = d3.line<{ date: Date; score: number }>()
            .x(d => x(d.date))
            .y(d => y(d.score));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#a5f3fc") // Tailwind's cyan-200 hex value
            .attr("stroke-width", 2)
            .attr("d", line);

        // Points
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.score!))
            .attr("r", 4)
            .attr("fill", "#a5f3fc");

        // Find local maxima
        const localMaxima = data
            .map((d, i, arr) => {
                if (arr.length === 1) return false;
                if (i === 0) return d.score > arr[i + 1].score;
                if (i === arr.length - 1) return d.score > arr[i - 1].score;
                return d.score > arr[i - 1].score && d.score > arr[i + 1].score;
            })
            .map((isMax, i) => isMax ? data[i] : null)
            .filter(Boolean) as { date: Date; score: number }[];

        // Find local minima
        const localMinima = data
            .map((d, i, arr) => {
                if (arr.length === 1) return false;
                if (i === 0) return d.score < arr[i + 1].score;
                if (i === arr.length - 1) return d.score < arr[i - 1].score;
                return d.score < arr[i - 1].score && d.score < arr[i + 1].score;
            })
            .map((isMin, i) => isMin ? data[i] : null)
            .filter(Boolean) as { date: Date; score: number }[];

        // Labels for local maxima
        svg.selectAll("text.local-max-label")
            .data(localMaxima)
            .enter()
            .append("text")
            .attr("class", "local-max-label")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.score) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#0e7490") // Tailwind's cyan-700 hex value
            .attr("font-size", 10)
            .attr("font-weight", "bold")
            .text(d => d.score);

        // Labels for local minima
        svg.selectAll("text.local-min-label")
            .data(localMinima)
            .enter()
            .append("text")
            .attr("class", "local-min-label")
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.score) + 18)
            .attr("text-anchor", "middle")
            .attr("fill", "#0e7490") // Tailwind's cyan-700 hex value
            .attr("font-size", 10)
            .attr("font-weight", "bold")
            .text(d => d.score);

    }, [historicalPractices, width, height]);

    if (historicalPractices.length < 2) return (
        <div ref={containerRef}  className="flex justify-center items-center text-gray-700 uppercase text-base" style={{ width: "100%", height: 300 }}>
            Not enough data yet
        </div>
    )

    return (
        <div ref={containerRef} style={{ width: "100%" }}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                style={{ display: "block", width: "100%", height }}
            />
        </div>
    );
}
