export const getAge = (dobString?: string): string => {
    if (!dobString) return 'N/A';
    try {
        const dob = new Date(dobString);
        if (isNaN(dob.getTime())) return 'N/A';
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        return `${Math.abs(ageDate.getUTCFullYear() - 1970)} years old`;
    } catch {
        return 'N/A';
    }
};

export const parseOversToBalls = (oversString?: string): number => {
    if (typeof oversString !== 'string' || !oversString) return 0;
    const parts = oversString.split('.');
    const whole = parseInt(parts[0], 10) || 0;
    const partial = parseInt(parts[1], 10) || 0;
    return (whole * 6) + partial;
};

export const ballsToOvers = (balls: number): string => {
    if (!balls) return '0.0';
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
};
