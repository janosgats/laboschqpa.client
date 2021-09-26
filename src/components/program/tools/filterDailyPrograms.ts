import {Program} from "~/model/usergeneratedcontent/Program";
import TimeSpan from "~/utils/TimeSpan";

export default function filterDailyPrograms(allPrograms: Program[], date: Date): Program[] {
    const nextDate = new Date(+date + TimeSpan.day);
    const overlapDate = new Date(+date + 5 * TimeSpan.hour);

    const filteredPrograms
        = allPrograms.filter(
            (p) =>
                (new Date(p.startTime) >= date && new Date(p.startTime) < nextDate) ||
                (new Date(p.startTime) < date && new Date(p.endTime) > overlapDate)
        )
        .sort((a, b) => +a.startTime - +b.startTime);

    return filteredPrograms
}