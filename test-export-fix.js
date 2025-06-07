// Test script to verify ZoomMeetingEmbed export
import ZoomMeetingEmbed from "./src/components/User/Zoom/ZoomMeetingEmbed.jsx";

console.log("ZoomMeetingEmbed imported successfully:", typeof ZoomMeetingEmbed);
console.log("Component name:", ZoomMeetingEmbed.name);
console.log("Is function?", typeof ZoomMeetingEmbed === "function");

export { ZoomMeetingEmbed };
