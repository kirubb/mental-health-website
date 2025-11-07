import React, { useState } from "react";

const PrescriptionModal = ({ appointmentId, onSave, onCancel }) => {
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    const prescription = `Medication: ${medication}, Dosage: ${dosage}, Frequency: ${frequency}, Notes: ${notes}`;
    onSave(appointmentId, prescription);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-50">
      <div className=" bg-white w-1/2 max-w-md p-6 rounded-xl shadow-xl border border-fuchsia-700">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Add Prescription
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex mt-4 justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="py-2 px-4 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
