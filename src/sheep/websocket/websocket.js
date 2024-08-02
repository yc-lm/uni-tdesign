/*
	假设后端响应数据类型是这样的
	{
		request:'watch-video-require',
		data:{
			... 数据在这里
		}
	}
	*/
/** *
 * @description: WebSocket 单例模式
 * @author: lvhao
 */
class Socket {
    constructor(url = '') {
        this.socket = null; // socket实例
        this.isConnect = false; // 是否连接成功
        this.reconnectCount = 0; // 重连接次数
        this.reconnectTimer = null; // 重连定时器
        this.url = url;
        this.isHandClose = false; // 是否是手动关闭

        // 心跳定时器
        this.heartbeatInterval = null;

        // 收集事件绑定类型
        this._map = new Map();

        // 收集未连接成功要发送的消息
        this._sendArr = [];
    }

    // 连接
    connect(url = '') {
        // 覆盖实例化时的地址
        if (url) {
            this.url = url;
        }
        if (this.socket) return; // 正在连接
        // const Token = uni.getStorageSync('Token');
        this.socket = uni.connectSocket({
            url: this.url,
            header: {
                //   'wsToken': `Bearer ${Token}`,
                'content-type': 'application/json',
            },
            complete: () => {},
            multiple: true,
        });

        // 连接成功
        this.socket.onOpen(() => {
            console.log('websocket连接成功');
            this._onOpen();
        });
        // Socket 连接关闭事件
        this.socket.onClose(() => {
            console.log('websocket连接关闭了');
            this._onClose();
        });
        // 监听 Socket 错误事件
        this.socket.onError((err) => {
            console.log('websocket报错了', err);
            this._onError();
        });
        // 监听 WebSocket 接受到服务器的消息事件
        this.socket.onMessage((msg) => {
            this._onMessage(msg);
        });
    }

    // 连接成功 重置参数
    _onOpen() {
        this.isConnect = true; // 是否连接成功
        this.reconnectCount = 0; // 重置重连次数
        clearTimeout(this.reconnectTimer); // 清空重连定时器
        this.isHandClose = false; // 是否是手动关闭
        this._heartbeat(); // 开启心跳

        // 未发送的消息全部发送
        this._sendArr.forEach((item) => {
            this.send(item); // 发送消息
        });
        this._sendArr = [];
    }

    // 监听 WebSocket 连接关闭事件
    _onClose() {
        this.socket = null; // 清空soket
        this.isConnect = false; // 是否连接成功
        this._clearHeartbeat(); // 关闭心跳
        this._reconnect(); // 重新连接
    }

    // 监听 WebSocket 错误事件
    _onError() {}

    // 监听 WebSocket 接受到服务器的消息事件
    _onMessage(msg) {
        console.log('websocket收到的原始消息', msg);
        // let data = JSON.parse(msg.data);// 收到的数据
        // let receiveType = data.respond;// 收到的respond类型

        // 触发对应type类型事件  接受type为all时所有事件都会触发
        for (const entry of this._map.entries()) {
            // if (entry[1] === receiveType || entry[1] === 'all') {
            entry[0](msg);
            // }
        }
    }

    // 自动重连
    _reconnect() {
        if (this.isHandClose) return; // 手动关闭不重连
        if (this.socket) return; // 正在连接不处理
        if (this.reconnectCount < 10) {
            this.reconnectCount++;
            this.reconnectTimer = setTimeout(() => {
                console.log(`WebSocket 重连中，第 ${this.reconnectCount} 次尝试...`);
                this.connect(); // 连接
            }, 5000);
        } else {
            console.log('WebSocket 重连失败！');
        }
    }

    // 开启心跳
    _heartbeat() {
        this._clearHeartbeat(); // 关闭心跳
        // 心跳20000ms发送一次
        this.heartbeatInterval = setInterval(() => {
            this.send({ heart: 'ping' }); // 心跳内容
        }, 20000);
    }

    // 关闭心跳
    _clearHeartbeat() {
        clearInterval(this.heartbeatInterval);
    }

    // 发送消息
    send(msgObject) {
        // 当前未连接记录内容 队列中没有才放入 心跳除外
        if (!this.isConnect && msgObject.request?.request !== 'ping') {
            const hasEqualItem = this._sendArr.some(
                (item) => JSON.stringify(item) === JSON.stringify(msgObject),
            );
            if (!hasEqualItem) {
                this._sendArr.push(msgObject);
            }
            return;
        }
        this.socket.send({
            data: JSON.stringify(msgObject),
            success: (res) => {
                console.log('send=>', JSON.stringify(msgObject));
                console.log('发送成功', res);
            },
            fail: (err) => {
                console.log('发送失败', err);
            },
        });
    }

    // 接受信息  type 类型  fn 回调函数
    on(type, fn = () => {}) {
        this._map.set(fn, type);
    }

    // 关闭接受参数
    off(type, fn) {
        // 关闭参数
        if (arguments.length === 0) {
            // 清除全部
            this._map.clear();
        } else if (arguments.length === 1) {
            // 清除某个事件类型整体
            this._map.forEach((value, key) => {
                if (value === type) {
                    this._map.delete(key);
                }
            });
        } else {
            // 清除某个事件类型中某个回调
            if (this._map.get(fn) === type) {
                this._map.delete(fn);
            }
        }
    }

    // 关闭
    clearClose() {
        this.isHandClose = true; // 手动关闭
        clearTimeout(this.reconnectTimer); // 清空重连定时器
        if (this.socket && 'close' in this.socket) {
            this.socket.close(); // 关闭soket
        }
    }
}

export default new Socket();

// class WebSocketService {
//   constructor(url) {
//     this.url = url;
//     this.socket = null;
//     this.callbacks = new Map();
//     this.connect();
//   }
//
//   connect() {
//     this.socket = wx.connectSocket({
//       url: this.url,
//     });
//
//     this.socket.onOpen(() => {
//       console.log('WebSocket 连接成功');
//       this.triggerCallbacks('open', null);
//     });
//
//     this.socket.onError((error) => {
//       console.error('WebSocket 连接出错:', error);
//       this.triggerCallbacks('error', error);
//     });
//
//     this.socket.onMessage((message) => {
//       console.log('收到消息:', message);
//       this.triggerCallbacks('message', message);
//     });
//
//     this.socket.onClose(() => {
//       console.log('WebSocket 连接关闭');
//       this.triggerCallbacks('close', null);
//     });
//   }
//
//   send(message) {
//     if (this.socket && this.socket.readyState === wx.WebSocket.OPEN) {
//       this.socket.send({
//         data: message,
//       });
//     } else {
//       console.error('WebSocket 连接未打开或已关闭');
//     }
//   }
//
//   close() {
//     if (this.socket) {
//       this.socket.close();
//     }
//   }
//
//   on(event, callback) {
//     if (!this.callbacks.has(event)) {
//       this.callbacks.set(event, []);
//     }
//     this.callbacks.get(event).push(callback);
//   }
//
//   off(event, callback) {
//     const callbacks = this.callbacks.get(event) || [];
//     const index = callbacks.indexOf(callback);
//     if (index !== -1) {
//       callbacks.splice(index, 1);
//     }
//   }
//
//   triggerCallbacks(event, data) {
//     const callbacks = this.callbacks.get(event) || [];
//     callbacks.forEach((callback) => callback(data));
//   }
// }
//
// export default new WebSocketService('ws://172.16.135.110:8500');
