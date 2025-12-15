'use client'

import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

export function ProgressBar({ current, max, size, id, hideNumber = false }: { current: number, max: number, size?: "s" | "m", id?: string, hideNumber?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const drawProgress = () => {
        if (containerWidth === 0) return;

        let height = 20;
        let barHeight = 12;
        const targetProgress = (current / max) * 100; // Set target percentage (0 to 100)
        let borderRadius = 5; // Border radius for the rectangles

        if (size == 's') {
            height = 10
            barHeight = 4
            borderRadius = 3
        }

        const svg = d3.select(`#daily-progress-card${id}`)
            .attr("width", containerWidth)
            .attr("height", height);

        // Clear previous content to avoid duplicates
        svg.selectAll("*").remove();

        // Add background rect
        svg.append("rect")
            .attr("x", 0)
            .attr("y", (height - barHeight) / 2)
            .attr("width", containerWidth)
            .attr("height", barHeight)
            .attr("fill", "#0891b2") // Tailwind `bg-cyan-800`
            .attr("rx", borderRadius) // Apply horizontal rounding
            .attr("ry", borderRadius); // Apply vertical rounding

        // Add foreground rect (progress fill)
        svg.append("rect")
            .attr("x", 0)
            .attr("y", (height - barHeight) / 2)
            .attr("width", (targetProgress / 100) * containerWidth) // Dynamic width based on container
            .attr("height", barHeight)
            .attr("fill", "#d9f99d") // Tailwind `bg-green-400`
            .attr("rx", borderRadius) // Apply horizontal rounding
            .attr("ry", borderRadius); // Apply vertical rounding

    };

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);

        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
        drawProgress();
    }, [containerWidth, current]);

    return (
        <div className="w-full flex flex-row items-center">
            {(!size && !hideNumber) && 
                <div className='flex'>
                    <div className='text-lg px-2'>{current}<span className='text-sm'>/{max}</span></div>
                </div>
            }
            <div ref={containerRef} className="w-full">
                <svg id={`daily-progress-card${id}`}></svg>
            </div>
        </div>
    );
}
