const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const sanitizeAppId = (value) => {
	if (!value || typeof value !== 'string') return value;
	const match = value.match(/[a-f0-9]{24}/i);
	return match ? match[0] : value.trim();
}

const sanitizeBaseUrl = (value) => {
	if (!value || typeof value !== 'string') return value;
	const trimmed = value.trim();
	const match = trimmed.match(/https?:\/\/[^\s{}"'`]+/i);
	const sanitized = match ? match[0] : trimmed;
	return sanitized.replace(/\/+$/, '');
}

const sanitizeParamValue = (paramName, value) => {
	if (paramName === 'app_id') return sanitizeAppId(value);
	if (paramName === 'app_base_url') return sanitizeBaseUrl(value);
	return value;
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = sanitizeParamValue(paramName, urlParams.get(paramName));
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}

	const sanitizedDefault = sanitizeParamValue(paramName, defaultValue);
	if (sanitizedDefault) {
		storage.setItem(storageKey, sanitizedDefault);
		return sanitizedDefault;
	}

	const storedValue = sanitizeParamValue(paramName, storage.getItem(storageKey));
	if (storedValue) {
		storage.setItem(storageKey, storedValue);
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
