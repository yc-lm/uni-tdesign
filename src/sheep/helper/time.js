import dayjs from 'dayjs';

/* eslint-disable */
export const typeNumber = {
    type1: 'YYYY-MM-DD',
    type2: 'YYYY-MM-DD HH:mm:ss',
    type3: 'HH:mm:ss',
    type4: 'HH:mm',
    type5: 'YYYYMMDD',
    type6: 'MM-DD HH:mm',
    type7: 'YYYY-MM-DD HH:mm',
};

/**
 * @returns {Boolean} 判断当前日期是否为今天
 * @param str
 */
export function isToday(str) {
    let d = new Date(str?.replace(/-/g, '/')),
        todaysDate = new Date();
    return d.setHours(0, 0, 0, 0) === todaysDate.setHours(0, 0, 0, 0);
}

/**
 * @returns {String}  距离当前过去多少分钟、小时、天
 * @param dateTimeStamp 传入时间
 * @param type
 */
export function formatStatus(dateTimeStamp, type = false) {
    const d = dayjs(dateTimeStamp).valueOf();
    const now = dayjs(new Date()).valueOf();
    const diff = (now - d) / 1000;
    if (diff < 60) {
        return '刚刚';
    }
    if (type) {
        if (diff < 60 * 6) {
            // 6分钟内
            return Math.floor(diff / 60) + '分钟前';
        } else {
            return getTimeStamp(dateTimeStamp);
        }
    } else {
        return Math.floor(diff / 60) + '分钟前';
    }
}

/**
 * @returns {String}  当天返回HH:mm
 * @param dateTimeStamp 传入时间
 */
export function getTimeStamp(dateTimeStamp) {
    const type = isToday(dateTimeStamp) ? typeNumber.type4 : typeNumber.type7;
    return dayjs(dateTimeStamp, type).format(type);
}

//时间戳转成星期
export function getTimeWeek(dateTimeStamp) {
    console.log(dayjs(dateTimeStamp).format('d'));
    return weekDate(dayjs(dateTimeStamp).format('d'));
}

export function weekDate(val) {
    switch (val) {
        case '0':
            return '周日';
        case '1':
            return '周一';
        case '2':
            return '周二';
        case '3':
            return '周三';
        case '4':
            return '周四';
        case '5':
            return '周五';
        default:
            return '周六';
    }
}

export function timeFormat(time, type = 2) {
    if (!time) {
        return time;
    }
    const numberKey = `type${type}`;
    return dayjs(time).format(typeNumber[numberKey]);
}

export function getTimeTypeStamp(dateTimeStamp, type = 'type1') {
    return dayjs(dateTimeStamp, typeNumber[type]).format(typeNumber[type]);
}

export function getCurrentWeek() {
    return [
        dayjs().startOf('week').format(typeNumber.type1),
        dayjs().endOf('week').format(typeNumber.type1),
    ];
}
export function getCurrentMonth() {
    return [
        dayjs().startOf('month').format(typeNumber.type1),
        dayjs().endOf('month').format(typeNumber.type1),
    ];
}
export function concatHms2Date(start, end, isHms) {
    if (isHms && start && end) {
        start = `${start} 00:00:00`;
        end = `${end} 23:59:59`;
    }
    return { start, end };
}
/**
 * 根据tag获取对应的时间范围
 * @param {string} tag   可选值：today,week,month
 * @param {boolean} isHms 是否携带时分秒，默认值true
 * @return Array
 */
export function getDatetimeByKeyword(tag, isHms = true) {
    let start = '';
    let end = '';
    switch (tag) {
        case 'today':
            start = timeFormat(new Date(), 1);
            end = timeFormat(new Date(), 1);
            break;
        case 'week':
            const weekInfo = getCurrentWeek();
            start = weekInfo[0];
            end = weekInfo[1];
            break;
        case 'month':
            const monthInfo = getCurrentMonth();
            start = monthInfo[0];
            end = monthInfo[1];
            break;
        default:
            break;
    }

    if (isHms && start && end) {
        start = `${start} 00:00:00`;
        end = `${end} 23:59:59`;
    }

    const dateInfo = concatHms2Date(start, end, isHms);

    return [dateInfo.start, dateInfo.end];
}
