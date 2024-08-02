// 获取常用时间
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isNull from 'lodash/isNull';

dayjs.extend(duration);

export const FORMAT_TYPE = {
    TYPE_YMD_DIR: 'YYYY/MM/DD',
    TYPE_YMD: 'YYYY-MM-DD',
    TYPE_YMD_HMS: 'YYYY-MM-DD HH:mm:ss',
    TYPE_HMS: 'HH:mm:ss',
    TYPE_HMS_CHINESE: 'HH时mm分ss秒',
    TYPE_MS: 'mm:ss',
    TYPE_MS_CHINESE: 'mm分ss秒',
    TYPE_SS: 'ss',
    TYPE_SS_CHINESE: 'ss秒',
};

export const LAST_7_DAYS = [
    dayjs().subtract(7, 'day').format(FORMAT_TYPE.TYPE_YMD),
    dayjs().subtract(1, 'day').format(FORMAT_TYPE.TYPE_YMD),
];

export const LAST_30_DAYS = [
    dayjs().subtract(30, 'day').format(FORMAT_TYPE.TYPE_YMD),
    dayjs().subtract(1, 'day').format(FORMAT_TYPE.TYPE_YMD),
];

/**
 * 获取当前时间戳
 * @param {boolean} unix 是否返回unix时间戳
 */
export function getCurrentTimeInt(unix = true) {
    return unix ? dayjs().unix() : dayjs().valueOf();
}

/**
 * 封装格式化时间的方法
 * @param {object|string|number} date 传入的日期
 * @param {string} format 格式
 * @return string
 */
export function formatDateTime(date, format = FORMAT_TYPE.TYPE_YMD_HMS) {
    // 检查是否已经是一个 dayjs 对象
    if (!(date instanceof dayjs)) {
        // 如果是时间戳，直接使用 dayjs 解析
        if (typeof date === 'number') {
            const isUnix = date.toString()?.length < 13;
            date = isUnix ? dayjs.unix(date) : dayjs(date);
        } else if (typeof date === 'string') {
            // 自动判断字符串是否是 ISO 格式，然后解析
            date = dayjs(date);
        } else {
            // 如果是 Date 对象，使用 dayjs 包装
            date = dayjs(date);
        }
    }
    // 使用 format 方法进行格式化
    return date.format(format);
}

/**
 * 将视频时间转换为时分秒
 */
export function formatDurationTime(time, isMs = true, isFilterHour = false, isChinese = false) {
    // 如果是毫秒
    if (isMs) {
        time /= 1000;
    }

    let formatType = FORMAT_TYPE.TYPE_HMS;
    if (isFilterHour) {
        formatType = handleFormat(time, isChinese);
    }

    return dayjs.duration(time, isMs ? 'second' : 'millisecond').format(formatType);
}

// 将时间戳时间段转为时分秒
export function handleDuration(time: number[], isChinese = false) {
    return `${dayjs.duration(time[0] / 1000, 'second').format(handleFormat(time[0] / 1000, isChinese))}-${dayjs.duration(time[1] / 1000, 'second').format(handleFormat(time[1] / 1000, isChinese))}`;
}

export function handleFormat(value: number, isChinese = false) {
    if (value >= 60 && value < 3600) {
        return isChinese ? FORMAT_TYPE.TYPE_MS_CHINESE : FORMAT_TYPE.TYPE_MS;
    }
    if (value < 60) {
        return isChinese ? FORMAT_TYPE.TYPE_SS_CHINESE : FORMAT_TYPE.TYPE_SS;
    }
    return isChinese ? FORMAT_TYPE.TYPE_HMS_CHINESE : FORMAT_TYPE.TYPE_HMS;
}

/**
 * 基于指定时间增加|减少指定天数
 * @param {object|string|number|null} date 传入的日期
 * @param {number} addTime 传入的日期
 * @param {string|undefined} addUnit 增加时间类型
 * @param {string} format 格式
 * @return string
 */
export function addSpecificDate(date, addTime = 0, addUnit = 'day', format = FORMAT_TYPE.TYPE_YMD) {
    // 直接返回
    if (!addTime && addTime !== 0) {
        return date;
    }

    // 直接返回当前日期
    if (addTime === 0) {
        return date || dayjs(getCurrentTimeInt(false)).format(format);
    }

    if (isNull(date)) {
        date = getCurrentTimeInt(false);
    }
    // 创建一个指定时间的日期对象，例如 '2023-01-01'
    const specificDate = dayjs(date);
    console.log('specificDate', specificDate);
    // 增加 10 天 或者 减少
    // 判断是增加或者减少
    const isAdd = addTime > 0;
    // @ts-ignore
    const futureDate = isAdd
        ? specificDate.add(addTime, addUnit)
        : specificDate.subtract(Math.abs(addTime), addUnit);

    return futureDate.format(format);
}

/**
 * 比较时间大小
 */
export function compareDates(dateStr1, dateStr2) {
    // 将字符串转换为Date对象
    const date1 = dayjs(dateStr1);
    const date2 = dayjs(dateStr2);

    // 比较两个日期
    // 使用比较运算符比较两个dayjs对象
    if (date1.isAfter(date2)) {
        return -1;
    }
    if (date1.isBefore(date2)) {
        return 1;
    }
    return 0;
}
