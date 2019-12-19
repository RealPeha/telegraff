export const bindArrow = (func, ...args) => (function() {eval(func.toString())(...args)})
