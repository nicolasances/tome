'use client'

import { TomeTopicsAPI, Topic } from "@/api/TomeTopicsAPI";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

// List of all available icons in public/images/topics
const AVAILABLE_ICONS = [
    'ancient-columns.svg',
    'battle.svg',
    'china.svg',
    'colosseum.svg',
    'crown.svg',
    'economy.svg',
    'fleur-de-lis.svg',
    'france.svg',
    'helicopter.svg',
    'italy.svg',
    'knight-2.svg',
    'knight-black-chess-piece.svg',
    'knight-helmet.svg',
    'knight.svg',
    'missile.svg',
    'obelisk.svg',
    'pope.svg',
    'sledgehammer.svg',
    'sword-2.svg',
    'sword-hilt.svg',
    'sword.svg',
    'tank.svg',
    'war-axe.svg',
    'war-tank.svg',
    'warrior.svg',
    'castle.svg',
    'castle-flag.svg',
    'london-bridge.svg',
    'uk.svg',
    'flower-tulip.svg',
    'king.svg',
    'spinning-sword.svg',
    'axe.svg',
    'branch.svg',
    'globe.svg',
    'explosion.svg',
];

export default function TopicIconPage() {

    const router = useRouter();
    const params = useParams();
    const { setConfig } = useHeader();

    const [topic, setTopic] = useState<Topic>();

    useEffect(() => {
        if (topic) {
            setConfig({
                title: `${topic.name}`,
                backButton: {
                    enabled: true,
                    onClick: () => { router.back() }
                },
                actions: undefined,
            });
        }
    }, [topic, setConfig, router]);

    const loadTopic = async () => {
        const topic = await new TomeTopicsAPI().getTopic(String(params.topicId));
        setTopic(topic);
    }

    useEffect(() => { loadTopic() }, []);

    const changeIcon = (iconPath: string) => {
        new TomeTopicsAPI().updateTopicIcon(String(params.topicId), iconPath).then(() => {
            router.back();
        })
    }

    if (!topic) return <></>

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full mb-8">
            <div className="text-base text-center mb-8 text-cyan-900">
                Select an icon for this topic
            </div>
            <div className="grid grid-cols-4 gap-4">
                {AVAILABLE_ICONS.map((icon) => {
                    const iconPath = `/images/topics/${icon}`;
                    const isSelected = topic.icon === iconPath;

                    return (
                        <button
                            key={icon}
                            onClick={() => changeIcon(iconPath)}
                            className={`
                                aspect-square rounded-lg p-3 
                                transition-all duration-200
                                ${isSelected ? 'bg-lime-200' : 'bg-cyan-700'}
                                active:scale-95
                            `}
                        >
                            <MaskedSvgIcon
                                src={iconPath}
                                alt={icon.replace('.svg', '')}
                                size="w-full h-full"
                                color="bg-cyan-400"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
