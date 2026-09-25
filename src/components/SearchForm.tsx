"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSchools, getClasses } from "@/app/actions";
import { Search } from "lucide-react";

export default function SearchForm() {
  const router = useRouter();
  
  const [kommun, setKommun] = useState("");
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [unitGuid, setUnitGuid] = useState("");
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedKommun = localStorage.getItem("savedKommun");
    const savedSchool = localStorage.getItem("savedSchool");

    if (savedKommun) {
      setKommun(savedKommun);
      // Auto-fetch schools if a saved kommun exists
      const fetchInitialSchools = async () => {
        setLoadingSchools(true);
        const res = await getSchools(savedKommun.toLowerCase().trim());
        if (res.success && res.schools) {
          setSchools(res.schools);
          if (savedSchool && res.schools.find((s: any) => s.unitId === savedSchool)) {
            setSelectedSchool(savedSchool);
          }
        }
        setLoadingSchools(false);
      };
      fetchInitialSchools();
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (kommun) localStorage.setItem("savedKommun", kommun);
  }, [kommun]);

  useEffect(() => {
    if (selectedSchool) localStorage.setItem("savedSchool", selectedSchool);
  }, [selectedSchool]);

  // When user clicks 'Hämta skolor'
  const handleFetchSchools = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!kommun) return;
    setLoadingSchools(true);
    setSchools([]);
    setClasses([]);
    setSelectedSchool("");
    setSelectedClass("");
    
    const res = await getSchools(kommun.toLowerCase().trim());
    if (res.success && res.schools) {
      setSchools(res.schools);
    } else {
      alert("Hittade inga skolor för denna kommun.");
    }
    setLoadingSchools(false);
  };

  // When a school is selected
  useEffect(() => {
    if (!selectedSchool) return;
    
    const fetchSchoolClasses = async () => {
      setLoadingClasses(true);
      setClasses([]);
      setSelectedClass("");
      
      const school = schools.find((s) => s.unitId === selectedSchool);
      if (school) {
        setUnitGuid(school.unitGuid);
        const res = await getClasses(kommun.toLowerCase().trim(), school.unitGuid);
        if (res.success && res.classes) {
          setClasses(res.classes);
        }
      }
      setLoadingClasses(false);
    };
    
    fetchSchoolClasses();
  }, [selectedSchool, schools, kommun]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (kommun && selectedSchool && selectedClass) {
      const schoolObj = schools.find((s) => s.unitId === selectedSchool);
      const classObj = classes.find((c) => c.id === selectedClass);
      
      if (schoolObj && classObj) {
        router.push(
          `/?kommun=${encodeURIComponent(kommun)}&skola=${encodeURIComponent(
            schoolObj.unitId
          )}&id=${encodeURIComponent(classObj.id)}&unitGuid=${encodeURIComponent(
            schoolObj.unitGuid
          )}`
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Kommun (t.ex. "stockholm")</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border p-2 rounded-md"
            value={kommun}
            onChange={(e) => setKommun(e.target.value)}
            placeholder="Skriv din kommun..."
          />
          <button
            onClick={handleFetchSchools}
            disabled={!kommun || loadingSchools}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingSchools ? "Laddar..." : "Sök"}
          </button>
        </div>
      </div>

      {schools.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Välj skola</label>
          <select
            className="w-full border p-2 rounded-md"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">-- Välj skola --</option>
            {schools.map((s) => (
              <option key={s.unitGuid} value={s.unitId}>
                {s.unitId}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingClasses && <p className="text-sm text-gray-500 animate-pulse">Laddar klasser...</p>}

      {classes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Välj schema (Klass/Lärare/Sal)</label>
          <select
            className="w-full border p-2 rounded-md"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Välj --</option>
            {classes.map((c, idx) => (
              <option key={c.id + idx} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedClass}
        className="w-full bg-blue-600 text-white p-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
      >
        <Search size={18} />
        Visa schema
      </button>
    </form>
  );
}
