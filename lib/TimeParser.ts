import { monthName, weekdayName } from './i18n';

export type ParseErrorKey =
    | 'err_no_time'
    | 'err_unknown_token'
    | 'err_mixed_time'
    | 'err_need_time_of_day'
    | 'err_past';

export interface IParseSuccess {
    ok: true;
    when: Date; // absolute UTC instant
    usedServerTz: boolean;
}

export interface IParseFailure {
    ok: false;
    error: ParseErrorKey;
    token?: string;
}

export type ParseResult = IParseSuccess | IParseFailure;

const DURATION_RE = /^(?:\d+[smhdw])+$/i;
const DURATION_PART_RE = /(\d+)([smhdw])/gi;
const CLOCK_RE = /^(\d{1,2})(?::(\d{2}))?(am|pm)?$/i;

const UNIT_MS: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
};

const WEEKDAYS: Record<string, number> = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
};

/**
 * Parses the time portion of a /delay invocation.
 *
 * Accepts either a relative delay ("5m", "8h30m", "1h 30m") or a clock
 * expression ("8am tomorrow", "next monday 14:30", "noon today") in any
 * token order. Clock expressions resolve in the user's timezone via
 * utcOffsetHours; when that is undefined the server timezone is used and
 * usedServerTz is set so the caller can warn.
 */
export function parseTimeSpec(tokens: Array<string>, utcOffsetHours: number | undefined, now: Date): ParseResult {
    let durationMs = 0;
    let hasDuration = false;
    let clock: { hours: number, minutes: number } | undefined;
    let dayOffset: number | undefined;
    let weekday: number | undefined;
    let expectWeekday = false;

    for (const raw of tokens) {
        const token = raw.toLowerCase();

        if (expectWeekday) {
            if (WEEKDAYS[token] === undefined) {
                return { ok: false, error: 'err_unknown_token', token: raw };
            }
            weekday = WEEKDAYS[token];
            expectWeekday = false;
            continue;
        }

        if (DURATION_RE.test(token)) {
            hasDuration = true;
            let match = DURATION_PART_RE.exec(token);
            while (match) {
                durationMs += parseInt(match[1], 10) * UNIT_MS[match[2].toLowerCase()];
                match = DURATION_PART_RE.exec(token);
            }
            continue;
        }

        if (token === 'noon') {
            clock = { hours: 12, minutes: 0 };
            continue;
        }
        if (token === 'midnight') {
            clock = { hours: 0, minutes: 0 };
            continue;
        }
        if (token === 'today') {
            dayOffset = 0;
            continue;
        }
        if (token === 'tomorrow') {
            dayOffset = 1;
            continue;
        }
        if (token === 'next') {
            expectWeekday = true;
            continue;
        }
        if (WEEKDAYS[token] !== undefined) {
            weekday = WEEKDAYS[token];
            continue;
        }
        if (token === 'at' || token === 'on' || token === 'in') {
            continue; // connective noise words
        }

        const clockMatch = CLOCK_RE.exec(token);
        // require am/pm or an explicit colon so bare numbers stay errors
        if (clockMatch && (clockMatch[2] !== undefined || clockMatch[3] !== undefined)) {
            let hours = parseInt(clockMatch[1], 10);
            const minutes = clockMatch[2] ? parseInt(clockMatch[2], 10) : 0;
            const meridiem = clockMatch[3] ? clockMatch[3].toLowerCase() : undefined;
            if (hours > 23 || minutes > 59 || (meridiem && hours > 12)) {
                return { ok: false, error: 'err_unknown_token', token: raw };
            }
            if (meridiem === 'pm' && hours < 12) {
                hours += 12;
            }
            if (meridiem === 'am' && hours === 12) {
                hours = 0;
            }
            clock = { hours, minutes };
            continue;
        }

        return { ok: false, error: 'err_unknown_token', token: raw };
    }

    if (expectWeekday) {
        return { ok: false, error: 'err_need_time_of_day' };
    }

    const hasClockExpr = clock !== undefined || dayOffset !== undefined || weekday !== undefined;

    if (hasDuration && hasClockExpr) {
        return { ok: false, error: 'err_mixed_time' };
    }

    if (hasDuration) {
        if (durationMs <= 0) {
            return { ok: false, error: 'err_no_time' };
        }
        return { ok: true, when: new Date(now.getTime() + durationMs), usedServerTz: false };
    }

    if (!hasClockExpr) {
        return { ok: false, error: 'err_no_time' };
    }

    if (clock === undefined) {
        // "tomorrow" / "next monday" alone: refuse to guess a time of day
        return { ok: false, error: 'err_need_time_of_day' };
    }

    const usedServerTz = utcOffsetHours === undefined;
    const cal = makeCalendar(utcOffsetHours);
    const nowParts = cal.parts(now);

    let daysAhead: number;
    if (weekday !== undefined) {
        daysAhead = (weekday - nowParts.dow + 7) % 7;
        if (daysAhead === 0) {
            daysAhead = 7; // "monday"/"next monday" on a Monday means next week
        }
    } else if (dayOffset !== undefined) {
        daysAhead = dayOffset;
    } else {
        daysAhead = 0; // bare time: today, rolling to tomorrow if past
    }

    let when = cal.build(nowParts.year, nowParts.month, nowParts.day + daysAhead, clock.hours, clock.minutes);

    if (when.getTime() <= now.getTime()) {
        if (weekday === undefined && dayOffset === undefined) {
            when = cal.build(nowParts.year, nowParts.month, nowParts.day + 1, clock.hours, clock.minutes);
        } else {
            return { ok: false, error: 'err_past' };
        }
    }

    return { ok: true, when, usedServerTz };
}

interface ICalendarParts {
    year: number;
    month: number;
    day: number;
    dow: number;
}

/**
 * Wall-clock arithmetic in the user's timezone (fixed offset in hours,
 * fractional offsets like 5.5 supported) or, when offset is undefined,
 * in the server's local timezone.
 */
function makeCalendar(utcOffsetHours: number | undefined) {
    if (utcOffsetHours === undefined) {
        return {
            parts: (d: Date): ICalendarParts => ({
                year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), dow: d.getDay(),
            }),
            build: (year: number, month: number, day: number, hours: number, minutes: number): Date =>
                new Date(year, month, day, hours, minutes, 0, 0),
        };
    }
    const offsetMs = Math.round(utcOffsetHours * 60) * 60 * 1000;
    return {
        parts: (d: Date): ICalendarParts => {
            const wall = new Date(d.getTime() + offsetMs);
            return {
                year: wall.getUTCFullYear(), month: wall.getUTCMonth(), day: wall.getUTCDate(), dow: wall.getUTCDay(),
            };
        },
        build: (year: number, month: number, day: number, hours: number, minutes: number): Date =>
            new Date(Date.UTC(year, month, day, hours, minutes, 0, 0) - offsetMs),
    };
}

/** Formats an instant as the user's wall-clock time, e.g. "Monday 13 Jul 2026, 08:00". */
export function formatWhen(when: Date, utcOffsetHours: number | undefined, lang: string): string {
    const shifted = utcOffsetHours === undefined
        ? when
        : new Date(when.getTime() + Math.round(utcOffsetHours * 60) * 60 * 1000);

    const dow = utcOffsetHours === undefined ? shifted.getDay() : shifted.getUTCDay();
    const day = utcOffsetHours === undefined ? shifted.getDate() : shifted.getUTCDate();
    const month = utcOffsetHours === undefined ? shifted.getMonth() : shifted.getUTCMonth();
    const year = utcOffsetHours === undefined ? shifted.getFullYear() : shifted.getUTCFullYear();
    const hours = utcOffsetHours === undefined ? shifted.getHours() : shifted.getUTCHours();
    const minutes = utcOffsetHours === undefined ? shifted.getMinutes() : shifted.getUTCMinutes();

    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${weekdayName(lang, dow)} ${day} ${monthName(lang, month)} ${year}, ${hh}:${mm}`;
}

/** Formats a duration compactly, e.g. "2d 4h", "1h 30m", "45s". */
export function formatDuration(ms: number): string {
    const totalSeconds = Math.max(1, Math.round(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: Array<string> = [];
    if (days) {
        parts.push(`${days}d`);
    }
    if (hours) {
        parts.push(`${hours}h`);
    }
    if (minutes && !days) {
        parts.push(`${minutes}m`);
    }
    if (seconds && !days && !hours) {
        parts.push(`${seconds}s`);
    }
    return parts.join(' ') || '0s';
}
