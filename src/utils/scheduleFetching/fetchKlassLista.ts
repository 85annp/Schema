import { kommunToSkola24 } from "@/utils/sanitize/kommunToSkola24";

export default async function fetchKlassLista(
  kommun: string,
  unitGuid: string,
) {
  const response = await fetch(
    "https://web.skola24.se/api/get/timetable/selection",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Scope": "8a22163c-8662-4535-9050-bc5e1923df48",
      },
      body: JSON.stringify({
        hostName: `${kommunToSkola24(kommun)}.skola24.se`,
        unitGuid: unitGuid,
        filters: {
          class: true,
          course: false,
          group: false,
          period: false,
          room: true,
          student: false,
          subject: false,
          teacher: true,
        },
      }),
    }
  );
  const data = await response.json();
  
  const result: { id: string; name: string; type: string }[] = [];
  
  const add = (arr: any[], type: string) => {
    if (!arr) return;
    arr.forEach(item => {
      // Fallback strategies for finding the identifier
      let name = item.groupName || item.signature || item.id || item.name;
      if (!name && item.firstName) {
        name = `${item.firstName} ${item.lastName || ""}`.trim();
      }
      
      if (name) {
        result.push({ id: name, name, type });
      }
    });
  };

  if (data?.data) {
    add(data.data.classes, "Klass");
    add(data.data.teachers, "Lärare");
    add(data.data.rooms, "Sal");
  }

  // Sortera listan alfabetiskt
  result.sort((a, b) => a.name.localeCompare(b.name));
  
  return result;
}
