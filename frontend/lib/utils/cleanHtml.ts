
export function removeInlineStyles(html: string): string {
    let cleanHtml = html.replace(/style="[^"]*"/g, '');

    cleanHtml = cleanHtml.replace(
        /<a\b(?![^>]*\btarget=)([^>]*)>/gi,
        '<a target="_blank" rel="noopener noreferrer"$1>'
    );

    return cleanHtml;
}
//to remove extra styling from html content