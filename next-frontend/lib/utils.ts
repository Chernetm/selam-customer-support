export const formatListDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (isThisYear) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Jan 24"
    } else {
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' }); // "01/24/23"
    }
};
