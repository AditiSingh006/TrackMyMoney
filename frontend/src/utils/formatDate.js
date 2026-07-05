export function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

const timestamp = "1698192000000"; // Example timestamp
const formattedDate = formatDate(timestamp);
console.log(formattedDate); // Output: "24 Oct, 2023"