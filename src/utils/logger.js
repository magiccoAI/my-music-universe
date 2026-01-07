const isDevelopment = process.env.REACT_APP_NODE_ENV === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
};

// 将 logger 挂载到全局 window 对象，以便在原生 HTML 字符串回调中使用
if (typeof window !== 'undefined') {
  window.logger = logger;
}

export default logger;
