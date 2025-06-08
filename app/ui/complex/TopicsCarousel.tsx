import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Topic } from "@/model/Topic";
import { GetTopicsResponse, TomeAPI } from "@/api/TomeAPI";

/**
 * The TopicsCarousel component displays a carousel of topics. 
 * 
 * Each topic is represented by a card that shows the topic's title, short description, and the number of flashcards it contains. It also shows the last date in which the topic was reviewed and the last score. 
 * 
 * The carousel MUST always show three cards at a time on the screen. The central one is bigger and highlighted, while the other two (left and right) are smaller and less prominent.
 * Use react-slick for the carousel functionality.
 * Use tailwind for styling.
 * Use TomeAPI to fetch the topics with the getTopics() method.
 */
interface TopicsCarouselProps {
    onCentralCardClick?: (topic: Topic) => void;
}

const TopicsCarousel: React.FC<TopicsCarouselProps> = ({ onCentralCardClick }) => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        new TomeAPI().getTopics().then((data: GetTopicsResponse) => {
            setTopics(data.topics);
            setLoading(false);
        });
    }, []);

    const settings = {
        centerMode: true,
        centerPadding: "0px",
        slidesToShow: 3,
        infinite: topics.length > 3,
        speed: 500,
        arrows: false,
        dots: false,
        beforeChange: (_: number, next: number) => {
            setCurrent(next);
            setClicked(false);
        },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    centerMode: true,
                    centerPadding: "0px",
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    centerMode: true,
                    centerPadding: "0px",
                },
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">Loading topics...</span>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">No topics found.</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8">
            <div className="overflow-visible">
                <Slider {...settings}>
                    {topics.map((topic, idx) => {
                        const isCenter =
                            idx === current ||
                            (topics.length < 3 && idx === 1);

                        return (
                            <div key={topic.code} className="px-[1px]">
                                <div
                                    className={`
                                        transition-all duration-200
                                        ${isCenter
                                            ? `scale-100 bg-cyan-100 border-1 border-cyan-600 z-10 cursor-pointer
                                               ${clicked ? "active:scale-95 animate-press" : ""}`
                                            : "scale-85 bg-gray-100 border border-gray-200 opacity-80"
                                        }
                                        rounded-lg flex flex-col items-center
                                    `}
                                    style={{
                                        minHeight: "140px",
                                        maxWidth: "260px",
                                        margin: "0 auto",
                                        boxShadow: isCenter
                                            ? "0 8px 32px rgba(59,130,246,0.15)"
                                            : "0 2px 8px rgba(0,0,0,0.05)",
                                    }}
                                    onClick={
                                        isCenter
                                            ? () => {
                                                setClicked(true);
                                                if (onCentralCardClick) {
                                                    onCentralCardClick(topic);
                                                }
                                                setTimeout(() => setClicked(false), 150);
                                            }
                                            : undefined
                                    }
                                >
                                    <div className="text-sm font-bold mb-4 text-center px-2 pt-4">{topic.title}</div>
                                    {/* <p className="text-gray-600 text-xs mb-4 text-center">{topic.description}</p> */}
                                    <div className="flex flex-col items-center w-full flex-1">
                                        <div className="flex flex-col items-center mb-2 flex-1">
                                            <div className="w-8 h-8 flex items-center justify-center rounded-full border border-cyan-300 text-cyan-700 font-bold text-sm">
                                                {topic.lastScore !== null && topic.lastScore !== undefined
                                                    ? `${parseFloat((topic.lastScore * 100).toFixed(1))}`
                                                    : "N/A"}
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1">last score</span>
                                            <span className="text-xs font-bold">
                                                {topic.lastReviewedOn
                                                    ? new Date(topic.lastReviewedOn).toLocaleString("en-US", {
                                                        day: "2-digit",
                                                        month: "short",
                                                    })
                                                    : "Never"}
                                            </span>
                                        </div>
                                        <div className="flex w-full justify-end items-end pr-3 pb-2 mt-auto">
                                            <span className="bg-cyan-200 text-cyan-800 text-2xs font-semibold rounded-full px-2 py-[2px] shadow-sm">
                                                {idx + 1} / {topics.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <style jsx global>{`
                                    .animate-press {
                                        animation: pressAnim 150ms cubic-bezier(0.4,0,0.2,1);
                                    }
                                    @keyframes pressAnim {
                                        0% { transform: scale(1); }
                                        50% { transform: scale(0.95); }
                                        100% { transform: scale(1); }
                                    }
                                `}</style>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </div>
    );
};

export default TopicsCarousel;
