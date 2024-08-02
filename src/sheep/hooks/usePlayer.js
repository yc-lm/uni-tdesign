import { computed } from 'vue';
import sheep from '@/sheep';
export const BASE_CHANNEL_PREFIX = 'channel-id';
export const DEVICE_INIT_STATUS = '连接中...';
export const DEVICE_NO_RECORDER_TIP = '未接入录播设备';

export function wrapperChannelId(id) {
    return `${BASE_CHANNEL_PREFIX}-${id}`;
}
// 视频宽高比
export const WIDTH_HEIGHT_RATIO = 16 / 9;

export const KEEP_ALIVE_TIME = 30 * 1000;
// 高码流level
export const STREAM_LEVEL_HIGH = 'high';
// 地码流level
export const STREAM_LEVEL_LOW = 'low';
export const STREAM_LEVEL_OBJ = {
    STREAM_LEVEL_HIGH,
    STREAM_LEVEL_LOW,
};
export const STATUS_CN_LIST = [
    { key: 'OK', value: '' },
    { key: 'NONE', value: '未绑定设备...' },
    { key: 'SEND_OK', value: '画面正在发送中...' },
    { key: 'SEND_FAILED', value: '获取数据失败' },
    { key: 'UNKNOWN', value: '设备未开机' },
];

// 获取状态显示的提示
export function getStreamPushStatusName(key = '') {
    const obj = STATUS_CN_LIST.find((item) => item.key === key) || {};
    return obj.value ? obj.value : '';
}
// 请求机位
export function wsGetCameraInfo(roomId, userId = '', type = 0) {
    const params = {
        room_id: roomId,
    };

    if (userId) {
        params.user_id = userId;
    }

    if (type) {
        params.type = type;
    }

    return {
        request: 'get-camera-info',
        data: params,
    };
}

// 请求推流
export function wsWatchVideoRequire(data) {
    return {
        request: 'watch-video-require',
        data: data,
    };
}
export function wsWatchVideoKeepalive(data) {
    return {
        request: 'watch-video-keepalive',
        data: data,
    };
}

export function compatibilityCameraName(item, originalKey = 'camera_name', aliasKey = 'alias') {
    return item.hasOwnProperty(aliasKey) && item[aliasKey] ? item[aliasKey] : item[originalKey];
}

// 解析camera消息
export function parseCameraMsg(data) {
    return data?.camera_info || [];
}

/**
 * 兼容是否有录播字段
 */
export function compatibilityRecorderPeriod(
    dataList,
    roomId,
    level = STREAM_LEVEL_OBJ.STREAM_LEVEL_LOW,
) {
    return dataList.map((item) => {
        // camera是可变的，每台设备可能不一致
        // 使用name作为唯一值，弃用了
        // 使用channel_id作为唯一值
        const channelId = wrapperChannelId(item?.channel_id ? item?.channel_id : item?.name);
        const aliasName = compatibilityCameraName(item, 'name');
        return {
            ...item,
            device_uuid: item.uuid,
            has_recorder: true,
            room_id: roomId,
            level,
            uuid: channelId,
            alias_name: aliasName,
        };
    });
}

export function selectFlvUrl(item, index) {
    //low >=0 high = -1
    if (index >= 0) {
        if (index <= 3) {
            return replaceFlvUrlPort(item['flv_url']);
        } else {
            return replaceFlvUrlPort(item['flv_url2']);
        }
    } else {
        return replaceFlvUrlPort(item['flv_url']);
    }
}

export function replaceFlvUrlPort(url) {
    if (!String.prototype.includes.call(url, 'https')) {
        url = url.replace(/http/, 'https');
    }
    url = url.replace(/8060/, '8061');
    url = url.replace(/8090/, '8091');
    return url;
}

//解析播放地址
export function parseUrls(urls, model, channel = '') {
    const urlObj = baseParse(urls);
    if (!Object.keys(urlObj).length) {
        return {};
    }
    let currentModeVideoList = [];
    if (channel) {
        currentModeVideoList =
            urlObj[model] && urlObj[model][channel] ? urlObj[model][channel] : currentModeVideoList;
    }

    const modelTypes = Object.keys(urlObj);

    const modelTypeList = modelTypes.map((item) => {
        return {
            type: item,
            name: getModelNameByType(item),
        };
    });

    if (!currentModeVideoList) {
        currentModeVideoList = [];
    }

    return {
        videoList: currentModeVideoList,
        modelTypeList,
        originalObj: urlObj,
        lowVideoList: urlObj[model],
    };
}

export function baseParse(urls) {
    try {
        if (!urls) {
            return {};
        }
        return JSON.parse(urls);
    } catch (e) {
        console.log('parseUrls', e);
        return {};
    }
}

export function getModelNameByType(type) {
    const find = videoModelKeyMap().find((item) => item.key === type);
    return find.value;
}

export function getUniqueKey(temp) {
    const { camera_name, channel_id } = temp;
    return wrapperChannelId(channel_id ? channel_id : camera_name);
}

export function videoModelKeyMap() {
    return [
        { key: URL_RESOURCE_TYPE_OBJ.MU, value: '电影模式' },
        { key: URL_RESOURCE_TYPE_OBJ.RU, value: '资源模式' },
    ];
}

export const URL_RESOURCE_TYPE_OBJ = {
    MU: 'MU',
    RU: 'RU',
};

export function setPictureOrder(dataList, nameKey = 'name') {
    dataList = dataList.map((item) => {
        return {
            ...item,
            order_index: getLiveItemOrder(item, nameKey),
        };
    });

    // 执行排序,升序
    return sort2DArray(dataList, 'order_index', true);
}

export function getLiveItemOrder(current, compareKey = 'name') {
    const list = getLivePictureOrder();
    const find = list.find((item) => item.key === current[compareKey]);
    return find ? find?.order : PICTURE_MAX_ORDER;
}

export function getLivePictureOrder() {
    return [
        { key: '主讲全景', order: 1 },
        { key: '听众全景', order: 2 },
        { key: 'VGA', order: 3 },
        { key: '主讲特写', order: 4 },
        { key: '听众特写', order: 5 },
        { key: '板书', order: 6 },
        { key: '教室巡视', order: 7 },
        { key: '导播', order: 8 },
    ];
}
export const PICTURE_MAX_ORDER = 100;

export function sort2DArray(array, key, ascending) {
    return array.sort((a, b) => {
        if (ascending) {
            return a[key] - b[key];
        } else {
            return b[key] - a[key];
        }
    });
}

export const URL_CHANNEL_OBJ = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
};

export const VIDEO_BUTTON_HEIGHT = 52;

export function useVideo() {
    // 获取屏幕宽度
    const viewWidth = computed(() => sheep.$platform.device?.windowWidth);
    // 视频高度
    const videoHeight = computed(() => {
        const ratioHeight = viewWidth.value / WIDTH_HEIGHT_RATIO;
        // 兼容未获取到的情况，按设计图默认高度
        return ratioHeight ? ratioHeight : 225;
    });
    const withButtonHeight = computed(() => {
        return {
            height: `${videoHeight.value + VIDEO_BUTTON_HEIGHT}px`,
        };
    });
    return {
        VIDEO_BUTTON_HEIGHT,
        viewWidth,
        videoHeight,
        withButtonHeight
    };
}
