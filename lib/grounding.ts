export type Ungrounded = {
kind: "phone" | "money" | "time";
value: string;
};
/**
* Returns every phone number, money amount and time that appears in the
* reply but does NOT appear in the fact sheet.
* An empty array means the reply is fully grounded.
*/
export function findUngrounded(reply: string, facts: string): Ungrounded[] {

    const ungrounded: Ungrounded[] = [];

    const normalisePhone = (value: string): string =>
    value.replace(/\D/g, "");

    const normaliseMoney = (value: string): string => {
    return value
        .toLowerCase()
        .replace(/£/g, "")
        .replace(/\bpounds?\b/g, "")
        .replace(/\s+/g, "")
        .replace(/,/g, "");
    };

    const normaliseTime = (value: string): string => {
    return value.replace(/\s+/g, "").toLowerCase();
    };

    // Example: 0800 555 0199
    const phoneRegex = /\b0\d{3}(?:[\s-]?\d){6,7}\b/g;

    // Examples:
    // £6
    // £25,000
    // 6 pounds
    // 35p
    const moneyRegex =
    /£\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s*(?:pounds?|pence|p)\b/gi;

    // Examples: 09:30, 16:30, 08:00
    const timeRegex = /\b(?:[01]\d|2[0-3]):[0-5]\d\b/g;

    const factPhones = (facts.match(phoneRegex) ?? []).map(normalisePhone);

    const factMoney = (facts.match(moneyRegex) ?? []).map(normaliseMoney);

    const factTimes = (facts.match(timeRegex) ?? []).map(normaliseTime);

    const replyPhones = reply.match(phoneRegex) ?? [];
    const replyMoney = reply.match(moneyRegex) ?? [];
    const replyTimes = reply.match(timeRegex) ?? [];

    //Phones comparision
    for (const phone of replyPhones) {
    if (!factPhones.includes(normalisePhone(phone))) {
        ungrounded.push({
        kind: "phone",
        value: phone,
        });
    }
    }

    // Money comparision
    for (const money of replyMoney) {
    if (!factMoney.includes(normaliseMoney(money))) {
        ungrounded.push({
        kind: "money",
        value: money,
        });
    }
    }

    // Time comparision
    for (const time of replyTimes) {
    if (!factTimes.includes(normaliseTime(time))) {
        ungrounded.push({
        kind: "time",
        value: time,
        });
    }
    }

    return ungrounded;
}