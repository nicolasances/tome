import * as d3 from "d3";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

export interface DayStat {
    date: string;  // YYYYMMDD
    count: number;
}

/**
 * Bar chart showing the number of completed practice sessions per day.
 * Accepts data as props so it is testable in isolation.
 */
export function LanguageLearningWeeklyStats({ days }: { days: DayStat[] }) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const height = 160;
    const margin = { top: 20, right: 10, bottom: 30, left: 10 };

    useEffect(() => {
        function handleResize() {
            if (containerRef.current) setWidth(containerRef.current.offsetWidth);
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!days || days.length === 0 || width === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const innerWidth  = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(days.map(d => d.date))
            .range([0, innerWidth])
            .paddingInner(0.35)
            .paddingOuter(0.15);

        const maxCount = Math.max(1, d3.max(days, d => d.count) ?? 0);
        const y = d3.scaleLinear()
            .domain([0, maxCount])
            .range([innerHeight, 0]);

        const baseline = y(0);

        // Bars — start at baseline height=0 then animate up
        const bars = g.selectAll<SVGRectElement, DayStat>("rect.bar")
            .data(days)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.date)!)
            .attr("width", x.bandwidth())
            .attr("y", baseline)
            .attr("height", 0)
            .attr("fill", "#155e75")
            .attr("rx", 3);

        bars.transition()
            .duration(600)
            .ease(d3.easeCubicOut)
            .attr("y", d => y(d.count))
            .attr("height", d => baseline - y(d.count));

        // X-axis day labels
        g.selectAll<SVGTextElement, DayStat>("text.day-label")
            .data(days)
            .enter()
            .append("text")
            .attr("class", "day-label")
            .attr("x", d => x(d.date)! + x.bandwidth() / 2)
            .attr("y", innerHeight + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .attr("font-size", 11)
            .text(d => moment(d.date, 'YYYYMMDD').format('ddd'));

    }, [days, width]);

    if (days.length === 0) {
        return (
            <div
                ref={containerRef}
                className="flex items-center justify-center text-sm text-muted-foreground"
                style={{ width: "100%", height }}
            >
                No data yet
            </div>
        );
    }

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
