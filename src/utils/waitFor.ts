import sleep from "~/utils/sleep";

/**
 * @return if the condition became true before the time limit exceeded
 */
export default async function waitFor(supplyConditionToWaitForBecomeTrue: () => boolean,
                                      trialCount: number, millisBetweenTrials: number): Promise<boolean> {
    for (let i = 0; i < trialCount && !supplyConditionToWaitForBecomeTrue(); ++i) {
        await sleep(millisBetweenTrials);
    }

    return supplyConditionToWaitForBecomeTrue();
}