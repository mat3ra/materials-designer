import get from "lodash/get";
import { sprintf } from "sprintf-js";

import en from "./en/messages";

const messages = { en };

type Locale = keyof typeof messages;

/**
 * Reads the locale out of the query string. Anything that is not a known locale falls back to
 * English - including the common case of a query string that carries something else entirely,
 * such as the view settings MD is deep-linked with. Without the fallback those lookups miss,
 * `sprintf` is handed `undefined`, and every message renders as an empty string.
 */
function currentLocale(): Locale {
    const fromQuery = window.location.search.replace("?locale=", "");
    return fromQuery in messages ? (fromQuery as Locale) : "en";
}

export function displayMessage(key: string, ...args: unknown[]): string {
    return sprintf(get(messages[currentLocale()], key), ...args);
}
