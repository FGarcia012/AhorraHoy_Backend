export const FREQUENCY_MULTIPLIERS = {
    DAILY: 365,
    WEEKLY: 52,
    MONTHLY: 12,
    BIMONTHLY: 6,
    SEMESTERLY: 2,
    YEARLY: 1
};

export const normalizeToAnnual = (amount, frequency) => {
    const multiplier = FREQUENCY_MULTIPLIERS[frequency];
    return multiplier ? Number(amount) * multiplier : null;
};

export const normalizeToMonthly = (amount, frequency) => {
    const annual = normalizeToAnnual(amount, frequency);
    return annual === null ? null : annual / 12;
};
