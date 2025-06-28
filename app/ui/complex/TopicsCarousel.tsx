import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GetTopicsResponse, TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import LeafSVG from "../graphics/icons/LeafSVG";
import { calculateFreshness } from "@/utils/TopicUtil";

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

        new TomeTopicsAPI().getTopics().then((data: GetTopicsResponse) => {
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
        <div className="w-full max-w-4xl mx-auto">
            <div className="overflow-visible">
                <Slider {...settings}>
                    {topics.map((topic, idx) => {
                        
                        const isCenter = idx === current || (topics.length < 3 && idx === 1);

                        // Calculate the "freshness" of the topic, based on the last practice date
                        const freshness = calculateFreshness(topic);

                        return (
                            <div key={topic.id} className="px-[1px] py-8">
                                <div
                                    className={`
                                        transition-all duration-200
                                        ${isCenter
                                            ? `scale-100 bg-cyan-100 border-1 border-cyan-600 z-10 cursor-pointer ${clicked ? "active:scale-95 animate-press" : ""}`
                                            : "scale-85 bg-cyan-100 border border-cyan-600 opacity-100"
                                        }
                                        rounded-lg flex flex-col items-center
                                    `}
                                    style={{
                                        minHeight: "120px",
                                        maxWidth: "260px",
                                        margin: "0 auto",
                                        boxShadow: isCenter
                                            ? "0 8px 32px rgba(29, 86, 179, 0.5)"
                                            : "0 2px 8px rgba(0,0,0,0.2)",
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
                                    <div className="text-base text-cyan-800 font-bold mb-4 text-center px-2 pt-4">{topic.name}</div>
                                    {/* <p className="text-cyan-700 text-xs mb-4 text-center">{topic.description}</p> */}
                                    <div className="flex w-full px-2 flex-1 items-end">
                                        <TopicProgressBar current={freshness} max={100} />
                                    </div>
                                    <div className="flex flex-col items-center w-full flex-1">
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

function TopicProgressBar({ current, max }: { current: number, max: number }) {

    let height = 10;
    let iconHeight = 14;
    let barHeight = 12;
    const targetProgress = (current / max) * 100; // Set target percentage (0 to 100)

    return (
        <div className="flex flex-row w-full items-center">
            <div className="flex items-center fill-cyan-600" style={{height: iconHeight, width: iconHeight, marginRight: 4}}>
                <LeafSVG/>
            </div>
            <div className="w-full relative" style={{ height: height }}>
                <div className="bg-cyan-700 w-full h-full rounded-full" style={{ zIndex: 1 }} ></div>
                {current > 4 && <div className="bg-cyan-500 absolute h-full rounded-full" style={{ width: `${targetProgress}%`, top: 0, zIndex: 2 }}></div>}
            </div>
        </div>
    )
}

export default TopicsCarousel;
