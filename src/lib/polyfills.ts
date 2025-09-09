/**
 * Polyfills para funcionalidades modernas en navegadores antiguos
 */

import { BrowserCapabilities } from './browser-capabilities';

/**
 * Polyfill para fetch API
 */
export function polyfillFetch(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof fetch === 'undefined') {
        // Implementación básica de fetch usando XMLHttpRequest
        (window as any).fetch = function(url: string, options: any = {}) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.open(options.method || 'GET', url);
                
                // Configurar headers
                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                // Configurar credenciales
                if (options.credentials === 'include') {
                    xhr.withCredentials = true;
                }
                
                xhr.onload = function() {
                    const response = {
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: new Headers(),
                        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
                        text: () => Promise.resolve(xhr.responseText)
                    };
                    resolve(response);
                };
                
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                
                xhr.ontimeout = function() {
                    reject(new Error('Request timeout'));
                };
                
                // Configurar timeout
                if (options.timeout) {
                    xhr.timeout = options.timeout;
                }
                
                xhr.send(options.body || null);
            });
        };
    }
}

/**
 * Polyfill para Promise
 */
export function polyfillPromise(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof Promise === 'undefined') {
        // Implementación básica de Promise
        (window as any).Promise = function(executor: any) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];
            
            function resolve(result: any) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = result;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function reject(error: any) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = error;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }
            
            function handle(handler: any) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }
            
            this.then = function(onFulfilled: any, onRejected: any) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(result: any) {
                            try {
                                resolve(onFulfilled ? onFulfilled(result) : result);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(error: any) {
                            try {
                                resolve(onRejected ? onRejected(error) : error);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };
            
            this.catch = function(onRejected: any) {
                return this.then(null, onRejected);
            };
            
            try {
                executor(resolve, reject);
            } catch (ex) {
                reject(ex);
            }
        };
        
        // Métodos estáticos de Promise
        (window as any).Promise.resolve = function(value: any) {
            return new Promise(function(resolve) {
                resolve(value);
            });
        };
        
        (window as any).Promise.reject = function(reason: any) {
            return new Promise(function(resolve, reject) {
                reject(reason);
            });
        };
        
        (window as any).Promise.all = function(promises: any[]) {
            return new Promise(function(resolve, reject) {
                const results: any[] = [];
                let completed = 0;
                
                promises.forEach(function(promise, index) {
                    promise.then(function(result: any) {
                        results[index] = result;
                        completed++;
                        if (completed === promises.length) {
                            resolve(results);
                        }
                    }).catch(reject);
                });
            });
        };
    }
}

/**
 * Polyfill para localStorage
 */
export function polyfillLocalStorage(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof localStorage === 'undefined') {
        // Implementación básica usando cookies como fallback
        const storage: { [key: string]: string } = {};
        
        (window as any).localStorage = {
            getItem: function(key: string) {
                return storage[key] || null;
            },
            setItem: function(key: string, value: string) {
                storage[key] = value;
                // También guardar en cookies como respaldo
                document.cookie = `localStorage_${key}=${encodeURIComponent(value)}; path=/`;
            },
            removeItem: function(key: string) {
                delete storage[key];
                document.cookie = `localStorage_${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            },
            clear: function() {
                Object.keys(storage).forEach(key => {
                    this.removeItem(key);
                });
            },
            length: 0,
            key: function(index: number) {
                const keys = Object.keys(storage);
                return keys[index] || null;
            }
        };
        
        // Cargar datos desde cookies al inicializar
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && name.startsWith('localStorage_')) {
                const key = name.replace('localStorage_', '');
                storage[key] = decodeURIComponent(value || '');
            }
        });
    }
}

/**
 * Polyfill para sessionStorage
 */
export function polyfillSessionStorage(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof sessionStorage === 'undefined') {
        // Implementación básica en memoria
        const storage: { [key: string]: string } = {};
        
        (window as any).sessionStorage = {
            getItem: function(key: string) {
                return storage[key] || null;
            },
            setItem: function(key: string, value: string) {
                storage[key] = value;
            },
            removeItem: function(key: string) {
                delete storage[key];
            },
            clear: function() {
                Object.keys(storage).forEach(key => {
                    delete storage[key];
                });
            },
            length: 0,
            key: function(index: number) {
                const keys = Object.keys(storage);
                return keys[index] || null;
            }
        };
    }
}

/**
 * Polyfill para atob (Base64 decode)
 */
export function polyfillAtob(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof atob === 'undefined') {
        (window as any).atob = function(str: string) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            let result = '';
            let i = 0;
            
            str = str.replace(/[^A-Za-z0-9+/]/g, '');
            
            while (i < str.length) {
                const encoded1 = chars.indexOf(str.charAt(i++));
                const encoded2 = chars.indexOf(str.charAt(i++));
                const encoded3 = chars.indexOf(str.charAt(i++));
                const encoded4 = chars.indexOf(str.charAt(i++));
                
                const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
                
                result += String.fromCharCode((bitmap >> 16) & 255);
                if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
                if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
            }
            
            return result;
        };
    }
}

/**
 * Polyfill para btoa (Base64 encode)
 */
export function polyfillBtoa(): void {
    if (typeof window === 'undefined') return; // Verificar que estamos en el navegador
    
    if (typeof btoa === 'undefined') {
        (window as any).btoa = function(str: string) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            let result = '';
            let i = 0;
            
            while (i < str.length) {
                const a = str.charCodeAt(i++);
                const b = i < str.length ? str.charCodeAt(i++) : 0;
                const c = i < str.length ? str.charCodeAt(i++) : 0;
                
                const bitmap = (a << 16) | (b << 8) | c;
                
                result += chars.charAt((bitmap >> 18) & 63);
                result += chars.charAt((bitmap >> 12) & 63);
                result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
                result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
            }
            
            return result;
        };
    }
}

/**
 * Polyfill para Object.assign
 */
export function polyfillObjectAssign(): void {
    if (typeof Object.assign === 'undefined') {
        Object.assign = function(target: any, ...sources: any[]) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            const to = Object(target);
            
            for (let index = 0; index < sources.length; index++) {
                const nextSource = sources[index];
                
                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            
            return to;
        };
    }
}

/**
 * Polyfill para Array.from
 */
export function polyfillArrayFrom(): void {
    if (typeof Array.from === 'undefined') {
        Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const C = this;
            const items = Object(arrayLike);
            
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            
            const mapFunction = mapFn !== undefined ? mapFn : false;
            const T = thisArg;
            const len = parseInt(items.length) || 0;
            const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
            
            let k = 0;
            let kValue;
            
            while (k < len) {
                kValue = items[k];
                if (mapFunction) {
                    A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
                } else {
                    A[k] = kValue;
                }
                k += 1;
            }
            
            A.length = len;
            return A;
        };
    }
}

/**
 * Aplica todos los polyfills necesarios basados en las capacidades del navegador
 */
export function applyPolyfills(capabilities: BrowserCapabilities): void {
    console.log('🔧 [POLYFILLS] Aplicando polyfills para navegador legacy...');
    
    // Polyfills básicos siempre necesarios
    polyfillObjectAssign();
    polyfillArrayFrom();
    
    // Polyfills condicionales basados en capacidades
    if (!capabilities.supportsPromises) {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para Promise');
        polyfillPromise();
    }
    
    if (!capabilities.supportsFetch) {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para Fetch');
        polyfillFetch();
    }
    
    if (!capabilities.supportsLocalStorage) {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para localStorage');
        polyfillLocalStorage();
    }
    
    if (!capabilities.supportsSessionStorage) {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para sessionStorage');
        polyfillSessionStorage();
    }
    
    // Polyfills para Base64 (siempre necesarios para JWT)
    if (typeof atob === 'undefined') {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para atob');
        polyfillAtob();
    }
    
    if (typeof btoa === 'undefined') {
        console.log('🔧 [POLYFILLS] Aplicando polyfill para btoa');
        polyfillBtoa();
    }
    
    console.log('✅ [POLYFILLS] Polyfills aplicados exitosamente');
}

/**
 * Verifica si se necesitan polyfills
 */
export function needsPolyfills(capabilities: BrowserCapabilities): boolean {
    return !capabilities.supportsPromises ||
           !capabilities.supportsFetch ||
           !capabilities.supportsLocalStorage ||
           !capabilities.supportsSessionStorage ||
           typeof atob === 'undefined' ||
           typeof btoa === 'undefined' ||
           typeof Object.assign === 'undefined' ||
           typeof Array.from === 'undefined';
}
