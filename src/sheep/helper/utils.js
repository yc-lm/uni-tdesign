export function isArray(value) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(value);
  } else {
    return Object.prototype.toString.call(value) === '[object Array]';
  }
}

export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function isNumber(value) {
  return !isNaN(Number(value));
}

export function isFunction(value) {
  return typeof value == 'function';
}

export function isString(value) {
  return typeof value == 'string';
}

export function isEmpty(value) {
  if (isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0;
  }

  return value === '' || value === undefined || value === null;
}

export function isBoolean(value) {
  return typeof value === 'boolean';
}

export function last(data) {
  if (isArray(data) || isString(data)) {
    return data[data.length - 1];
  }
}

export function cloneDeep(obj) {
  const d = isArray(obj) ? obj : {};

  if (isObject(obj)) {
    for (const key in obj) {
      if (obj[key]) {
        if (obj[key] && typeof obj[key] === 'object') {
          d[key] = cloneDeep(obj[key]);
        } else {
          d[key] = obj[key];
        }
      }
    }
  }

  return d;
}

export function clone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}

export function deepMerge(a, b) {
  let k;
  for (k in b) {
    a[k] = a[k] && a[k].toString() === '[object Object]' ? deepMerge(a[k], b[k]) : (a[k] = b[k]);
  }
  return a;
}

export function contains(parent, node) {
  while (node && (node = node.parentNode)) if (node === parent) return true;
  return false;
}

export function orderBy(list, key) {
  return list.sort((a, b) => a[key] - b[key]);
}

export function deepTree(list) {
  const newList = [];
  const map = {};

  list.forEach((e) => (map[e.id] = e));

  list.forEach((e) => {
    const parent = map[e.parentId];

    if (parent) {
      (parent.children || (parent.children = [])).push(e);
    } else {
      newList.push(e);
    }
  });

  const fn = (list) => {
    list.map((e) => {
      if (e.children instanceof Array) {
        e.children = orderBy(e.children, 'orderNum');

        fn(e.children);
      }
    });
  };

  fn(newList);

  return orderBy(newList, 'orderNum');
}

export function revDeepTree(list = []) {
  const d = [];
  let id = 0;

  const deep = (list, parentId) => {
    list.forEach((e) => {
      if (!e.id) {
        e.id = id++;
      }

      e.parentId = parentId;

      d.push(e);

      if (e.children && isArray(e.children)) {
        deep(e.children, e.id);
      }
    });
  };

  deep(list || [], null);

  return d;
}

export function basename(path) {
  let index = path.lastIndexOf('/');
  index = index > -1 ? index : path.lastIndexOf('\\');
  if (index < 0) {
    return path;
  }
  return path.substring(index + 1);
}

export function isWxBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true;
  } else {
    return false;
  }
}

/**
 * @description 如果value小于min，取min；如果value大于max，取max
 * @param {number} min
 * @param {number} max
 * @param {number} value
 */
export function range(min = 0, max = 0, value = 0) {
  return Math.max(min, Math.min(max, Number(value)));
}

/**
 * 判断是否json
 * @param $string
 * @returns {boolean}
 */
export function isJson($string) {
  try {
    return typeof JSON.parse($string) == 'object';
  } catch (e) {
    console.log(e, $string);
    return false;
  }
}
/**
 * 判断是否合法ip
 * @param {string} ip
 * @returns {boolean}
 */
export function isIPv4Address(ip) {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

export function handleArrayParams(a, traditional) {
  var class2type = {};
  var toString = class2type.toString;
  var hasOwn = class2type.hasOwnProperty;

  function toType(obj) {
      if (obj ==null) {
          return obj +"";
      }
      // Support: Android <=2.3 only (functionish RegExp)
      return typeof obj ==="object" ||typeof obj ==="function" ?
          class2type[toString.call(obj)] ||"object" :
          typeof obj;
  }

  var isFunction =function isFunction(obj) {
      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj ==="function" &&typeof obj.nodeType !=="number";
  };

  var
      rbracket = /\[\]$/,
      rCRLF = /\r?\n/g,
      rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
      rsubmittable = /^(?:input|select|textarea|keygen)/i;

  function buildParams(prefix, obj, traditional, add) {
      var name;

      if (Array.isArray(obj)) {

          // Serialize array item.
          obj.forEach(function (v, i) {
              if (traditional || rbracket.test(prefix)) {

                  // Treat each array item as a scalar.
                  add(prefix, v);

              }else {

                  // Item is non-scalar (array or object), encode its numeric index.
                  buildParams(
                      prefix +"[" + (typeof v ==="object" && v !=null ? i :"" ) +"]",
                      v,
                      traditional,
                      add
                  );
              }
          });

      }else if (!traditional && toType(obj) ==="object") {

          // Serialize object item.
          for (name in obj) {
              buildParams(prefix +"[" + name +"]", obj[name], traditional, add);
          }

      }else {

          // Serialize scalar item.
          add(prefix, obj);
      }
  }

  // Serialize an array of form elements or a set of
  // key/values into a query string
  var param =function (a, traditional) {
      var prefix,
          s = [],
          add =function (key, valueOrFunction) {

              // If value is a function, invoke it and use its return value
              var value = isFunction(valueOrFunction) ?
                  valueOrFunction() :
                  valueOrFunction;

              s[s.length] = encodeURIComponent(key) +"=" +
                  encodeURIComponent(value ==null ?"" : value);
          };

      // If an array was passed in, assume that it is an array of form elements.
      if (Array.isArray(a)) {

          // Serialize the form elements
          a.forEach(function (item) {
              add(item.name, item.value);
          });

      }else {

          // If traditional, encode the "old" way (the way 1.3.2 or older
          // did it), otherwise encode params recursively.
          for (prefix in a) {
              buildParams(prefix, a[prefix], traditional, add);
          }
      }

      // Return the resulting serialization
      return s.join("&");
  };
  return param(a, traditional);
}

/**
 * 判断是否为空对象：是对象并且key长度不为0 是不为空，否则认为为空
 */
export function isEmptyObj(obj) {
  if (isObject(obj) && Object.keys(obj).length) {
    return false;
  }
  return true;
}

export function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined我就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== 'object') return obj;
  // 是对象的话就要进行深拷贝
  if (hash.get(obj)) return hash.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}

export function array_unique(arr) {
    return Array.from(new Set(arr));
}
