import sleep from "~/utils/sleep";

/**
 * @return if the condition became true before the time limit exceeded
 */
export default async function waitFor(supplyConditionToWaitForBecomeTrue: () => boolean,
                                      trialCount: number, millisBetweenTrials: number,
                                      extraWaitMillisIfActualWaitingHappened: number = 0): Promise<boolean> {
    let actualWaitingHappened = false;
    for (let i = 0; i < trialCount && !supplyConditionToWaitForBecomeTrue(); ++i) {
        actualWaitingHappened = true;
        await sleep(millisBetweenTrials);
    }

    if(actualWaitingHappened){
        await sleep(extraWaitMillisIfActualWaitingHappened);
    }

    return supplyConditionToWaitForBecomeTrue();
}