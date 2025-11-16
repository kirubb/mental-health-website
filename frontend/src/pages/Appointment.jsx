import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { useContext, useState } from 'react';
import { assets } from '../assets/assets_frontend/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import {toast} from 'react-toastify'
import axios from 'axios';

const Appointment = () => {

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate()
  const {docId} = useParams();
  const {doctors, currencySymbol, backendUrl, token, getDoctorsData} = useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots]= useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const bookAppointment = async () => {
    if(!token) {
      toast.warn('Login to Book Appointment')
      return navigate('/login')

    }

    if (!slotTime) {
      toast.warn("Please select a time slot.");
      return;
    }

    if (!docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
      toast.warn("Please select a valid date.");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].dateTime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;


      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  

  useEffect(() => { 
    fetchDocInfo()
  },[doctors,docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  },[docInfo])

  useEffect(() => {
  },[docInfo])

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(d => d._id === docId);
    setDocInfo(docInfo);
  }

  const getAvailableSlots = () => {
    // Reset the slots at the beginning
    setDocSlots([]);

    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const endTime = new Date(currentDate);
        endTime.setHours(21, 0, 0, 0); // End time is 9:00 PM for the given day

        // Set the starting time for slot generation
        if (i === 0) { // Special logic only for today
            const now = new Date();
            // If it's already past 9 PM, no slots are available for today
            if (now >= endTime) {
                setDocSlots(prev => [...prev, []]); // Add an empty array for today
                continue; // Skip to the next day in the loop
            }
            // Start from the next half-hour mark, but not before 10 AM
            currentDate.setHours(Math.max(10, now.getHours()));
            if (now.getMinutes() > 30) {
                currentDate.setHours(currentDate.getHours() + 1);
                currentDate.setMinutes(0);
            } else {
                currentDate.setMinutes(30);
            }
        } else {
            // For future days, always start at 10:00 AM
            currentDate.setHours(10, 0, 0, 0);
        }

        const timeSlots = [];
        // Generate slots only if the start time is before the end time
        while (currentDate < endTime) {
            const formattedTime = currentDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          // add slot to array
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }
          // Increment current time by 30 minutes
          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        // Add the generated slots (even if empty) to the state
        setDocSlots(prev => [...prev, timeSlots]);
    }
};

  

  

  return docInfo && (
    <div>
      {/* Display doctor information */}
      <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt={docInfo.name} />
          </div>
          
          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            {/* Doc info : name, degree and experience */}
            <p className=" flex items-center gap-2 text-2xl font-medium text-fuchsia-900 ">
            {docInfo.name} 
            <img className='w-5' src={assets.verified_icon} alt="verified icon" /> 
            </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-500'>
              <p>
                {docInfo.degree} - {docInfo.speciality}
                <button className=" py-0.5 px-2 ml-2 border text-xs rounded-full">
                  {docInfo.experience}
                </button>
              </p>
            </div>

            {/* Doctor about */}
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-fuchsia-900 mt-3'>
                About <img src={assets.info_icon} alt="info-icon" />
              </p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
                {docInfo.about}
              </p>
            </div>

            <p className='text-fuchsia-900 font-medium mt-4'>
              Appointement Fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
            </p>

          </div>
      </div>
      
    {/* ---- MODIFICATION START ----
    Show booking UI only if doctor is available 
    */}

    {/* Check the doctor's is_available field first */}
    {docInfo.is_available ? (
      
      /* If true, show the entire booking UI */
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-500'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.map((item, index) => {
              // If there are no slots for this day, render nothing.
              if (item.length === 0) {
                return null;
              }
              // Otherwise, render the date circle.
              return (
                <div 
                  onClick={() => setSlotIndex(index)} 
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? "bg-primary text-white" : "border border-gray-200"}`} 
                  key={index} >
                  <p>
                    {daysOfWeek[item[0].dateTime.getDay()]}
                  </p>
                  <p>
                    {item[0].dateTime.getDate()}
                  </p>
                </div>
              );
            })
          }
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4 show-scrollbar">
        {/* First, check if the selected day's slot array exists and is not empty */}
        {docSlots[slotIndex] && docSlots[slotIndex].length > 0 ? (
          // If it exists, map over the slots and display them
          docSlots[slotIndex].map((item, index) => (
            <p 
              onClick={() => setSlotTime(item.time)}
              key={index}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 mb-1 rounded-full cursor-pointer ${
                item.time === slotTime
                  ? "bg-primary text-white"
                  : "text-gray-500 border border-gray-300"
              }`}
            >
              {item.time.toLowerCase()}
            </p>
          ))
        ) : (
          // If there are no slots, display a message
          <p>
            No available slots for this day.
          </p>
        )}
        </div>

        <button onClick={bookAppointment} className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6">Book an Appointment</button>

      </div>
    ) : (
      /* If false, show the "not available" message */
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-500'>
        <p className='text-red-500 font-semibold text-lg'>
          This doctor is not available for appointments at this time.
        </p>
      </div>
    )}

    {/* ---- MODIFICATION END ---- */}


    {/* Listing related doctors */}

    <RelatedDoctors docId={docId} speciality={docInfo.speciality} />

  </div>
  )
}

export default Appointment