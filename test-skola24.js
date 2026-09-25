
async function test() {
  const response = await fetch("https://web.skola24.se/api/services/skola24/get/timetable/viewer/units", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Scope": "8a22163c-8662-4535-9050-bc5e1923df48" },
    body: JSON.stringify({ getTimetableViewerUnitsRequest: { hostName: "malmo.skola24.se" } })
  });
  const data = await response.json();
  const unitGuid = data.data.getTimetableViewerUnitsResponse.units[0].unitGuid;
  
  const selResponse = await fetch("https://web.skola24.se/api/get/timetable/selection", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Scope": "8a22163c-8662-4535-9050-bc5e1923df48" },
    body: JSON.stringify({ hostName: "malmo.skola24.se", unitGuid: unitGuid, filters: { class: true, teacher: true, room: true } })
  });
  const selData = await selResponse.json();
  console.log("Keys:", Object.keys(selData.data));
  if (selData.data.teachers) console.log("Teachers length:", selData.data.teachers.length);
  if (selData.data.classes) console.log("Class 0:", selData.data.classes[0]);
}
test();

