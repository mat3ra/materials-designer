import { sprintf } from "sprintf-js";

/**
 * Exports and downloads the content.
 * @param content Content to be saved in downloaded file
 * @param name File name to be written on disk.
 * @param extension File extension.
 */
export function exportToDisk(content: string, name = "file", extension = "txt") {
    const pom = document.createElement("a");
    pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    pom.setAttribute("download", sprintf(`%s.${extension}`, name));
    pom.click();
}
