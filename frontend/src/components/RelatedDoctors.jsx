import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ speciality, docId }) => {
  const { doctors } = useContext(AppContext);
  const [relDoc, setRelDoc] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsData = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setRelDoc(doctorsData);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl text-fuchsia-700 font-medium">
        Top Doctors to Book
      </h1>
      <p className="sm:w-1/3 text-center text-gray-500 text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((items, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${items._id}`);
              scrollTo(0, 0);
            }}
            className="border border-fuchsia-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img className="bg-fuchsia-100" src={items.image} alt="doc image" />

            <div className="p-4">
              <div
                className={`flex items-center gap-2 text-sm text-center ${
                  items.available ? "text-green-500" : "text-gray-500"
                }`}
              >
                <p
                  className={`w-2 h-2 ${
                    items.available ? "bg-green-500" : "bg-gray-500"
                  }  rounded-full`}
                >
                  {" "}
                </p>
                <p>{items.available ? "Available" : "Not Available"}</p>
              </div>
              <p className="font-medium text-lg text-fuchsia-900">
                {items.name}
              </p>
              <p className="text-fuchsia-700 text-sm">{items.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="bg-fuchsia-200 text-gray-800 px-12 py-3 rounded-full hover:scale-105 transition-all mt-10"
      >
        More
      </button>
    </div>
  );
};

export default RelatedDoctors;
