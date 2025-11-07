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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Add Prescription</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={onCancel} className="py-2 px-4 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-primary text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
