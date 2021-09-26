export default async function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}