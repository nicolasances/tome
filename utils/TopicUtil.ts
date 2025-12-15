import { Topic } from "@/api/TomeTopicsAPI";
import moment from "moment";

/**
 * Calculates the freshness of the given topic. 
 * 
 * Freshness indicates how fresh the topic is in memory. 
 * It's a percentage. 
 * 
 * Right now it is calculated based on when the last practice was, following this logic: 
 * - After 5 days it will be 95% fresh. 
 * - After 10 days it will be 90% fresh. 
 * - After 20 days it will be 70% fresh. 
 * - After 30 days it will be 35% fresh. 
 * - After 45 days it will be 0% fresh. 
 * 
 * @param topic the topic
 */
export function calculateFreshness(topic: Topic) {

    if (!topic.lastPracticed) return 0;

    const now = moment();
    const lastPracticed = moment(topic.lastPracticed);
    const days = now.diff(lastPracticed, "days");

    if (days < 5) {
        // 100% to 95% over 0-5 days
        return 100 - ((days / 5) * 5);
    } else if (days < 10) {
        // 95% to 90% over 5-10 days
        return 95 - (((days - 5) / 5) * 5);
    } else if (days < 20) {
        // 90% to 70% over 10-20 days
        return 90 - (((days - 10) / 10) * 20);
    } else if (days < 30) {
        // 70% to 35% over 20-30 days
        return 70 - (((days - 20) / 10) * 35);
    } else if (days < 45) {
        // 35% to 0% over 30-45 days
        return 35 - (((days - 30) / 15) * 35);
    }

    return 0;

}
