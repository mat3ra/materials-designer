/**
 * @summary Generates random alphanumeric string with a specified length.
 * Returns lowercase string which starts with letter.
 */
export function randomAlphanumeric(length: number): string {
    // numerical value – create random alphanumeric string
    // Start from char at position 2, because Math.random().toString(36) starts with "0."
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    // !!!IMPORTANT Random letter is required in generated string because of
    // issue https://exabyte.atlassian.net/browse/SOF-1719
    // Generated string is used for username generation. In case of random string contains only numbers
    // slug for default issue will be inappropriate (e.g., "user-1232" has "user" slug).
    return (
        randomLetter +
        Math.random()
            .toString(36)
            .substring(2, 2 + length - 1)
    );
}
