console.log("🔍 DEBUGGING ZOOM ISSUE - TOKEN CONFIGURATION");
console.log("================================================");

const fs = require("fs");

// Check CreateMeetingPage (old working flow)
const oldFlow = fs.readFileSync(
  "./src/pages/User/CreateMeetingPage.jsx",
  "utf8"
);
const oldCreateMatch = oldFlow.match(
  /endpoint:\s*["']meeting\/create["'][\s\S]*?requireToken:\s*(true|false)/
);
const oldSignatureMatch = oldFlow.match(
  /endpoint:\s*["']meeting\/signature["'][\s\S]*?requireToken:\s*(true|false)/
);

console.log("OLD WORKING FLOW (CreateMeetingPage):");
console.log(
  "- meeting/create requireToken:",
  oldCreateMatch ? oldCreateMatch[1] : "NOT FOUND"
);
console.log(
  "- meeting/signature requireToken:",
  oldSignatureMatch ? oldSignatureMatch[1] : "NOT FOUND"
);

// Check TutorClassroomPage (new flow)
const newFlow = fs.readFileSync(
  "./src/pages/User/TutorClassroomPage.jsx",
  "utf8"
);
const newCreateMatch = newFlow.match(
  /endpoint:\s*["']meeting\/create["'][\s\S]*?requireToken:\s*(true|false)/
);

console.log("\nNEW FLOW (TutorClassroomPage):");
console.log(
  "- meeting/create requireToken:",
  newCreateMatch ? newCreateMatch[1] : "NOT FOUND"
);

// Check TutorMeetingRoomPage
const meetingRoom = fs.readFileSync(
  "./src/pages/User/TutorMeetingRoomPage.jsx",
  "utf8"
);
const roomSignatureMatch = meetingRoom.match(
  /endpoint:\s*["']meeting\/signature["'][\s\S]*?requireToken:\s*(true|false)/
);

console.log(
  "- meeting/signature requireToken:",
  roomSignatureMatch ? roomSignatureMatch[1] : "NOT FOUND"
);

console.log("\n🔴 CRITICAL FINDING:");
console.log(
  "If old flow uses requireToken: true and new flow uses requireToken: false,"
);
console.log("this could be causing authentication issues!");
