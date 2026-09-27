export const toCents = (amount) => {
    if (amount === null || amount === undefined || amount === '') return amount ?? null;
    return Math.round(Number(amount) * 100);
};

export const toQuetzales = (cents) => {
    if (cents === null || cents === undefined) return cents;
    return Number(cents) / 100;
};

export const centsMapToQuetzales = (centsMap = {}) => {
    const result = {};
    for (const key of Object.keys(centsMap)) {
        result[key] = toQuetzales(centsMap[key]);
    }
    return result;
};
