import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { firestore } from '../../firebase'; // Import Firestore
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import Confetti from 'react-confetti'; // Import Confetti library
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const Countdown = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('00:00');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReunited, setIsReunited] = useState(false); // State to track reunion status
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const correctPassword = 'iloveserina'; // Replace with your actual password

  // Effect to listen for changes in the selected date and reunion status from Firestore
  useEffect(() => {
    const dateDocRef = doc(firestore, 'countdown', 'countdownDate');
    const statusDocRef = doc(firestore, 'countdown', 'countdownStatus');

    const unsubscribeDate = onSnapshot(dateDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const firestoreDate = docSnapshot.data().date;
        const dateTime = new Date(firestoreDate); // Convert stored string back to Date object
        setSelectedDateTime(dateTime);
        setSelectedDate(new Date(dateTime)); // Set selectedDate to the date part
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}`);
      } else {
        setSelectedDateTime(null);
      }
    });

    const unsubscribeStatus = onSnapshot(statusDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setIsReunited(docSnapshot.data().isReunited);
      } else {
        setIsReunited(false);
      }
    });

    return () => {
      unsubscribeDate();
      unsubscribeStatus();
    }; // Unsubscribe from Firestore listener on component unmount
  }, []);

  // Effect to handle countdown timer
  useEffect(() => {
    if (selectedDateTime) {
      const timer = setInterval(() => {
        const now = new Date();
        const difference = selectedDateTime.getTime() - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("It's time!");
          setIsReunited(true);
          setSelectedDateTime(null);
          // Update Firestore to reflect that the reunion has happened
          deleteDoc(doc(firestore, 'countdown', 'countdownDate'));
          setDoc(doc(firestore, 'countdown', 'countdownStatus'), { isReunited: true });
          clearInterval(timer); // Stop the timer
        }
      }, 1000); // Update countdown every second

      return () => clearInterval(timer); // Clear timer on component unmount or when selectedDateTime changes
    }
  }, [selectedDateTime]);

  //  Effect to initialize theme based on localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(newTheme)); // Save the theme preference in localStorage
  };

  const openModal = () => {
    setIsModalOpen(true);
    setPassword('');
    setIsAuthenticated(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleSubmitDateTime = async () => {
    if (selectedDate && selectedTime) {
      // Combine date and time into a single Date object
      const [hours, minutes] = selectedTime.split(':');
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(hours));
      newDateTime.setMinutes(parseInt(minutes));
      newDateTime.setSeconds(0);
      setSelectedDateTime(newDateTime);
      await setDoc(doc(firestore, 'countdown', 'countdownDate'), { date: newDateTime.toISOString() });
      await setDoc(doc(firestore, 'countdown', 'countdownStatus'), { isReunited: false });
      closeModal();
    } else {
      alert('Please select both date and time');
    }
  };

  const handlePassword = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password!');
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#181818] text-white' : 'bg-white text-[#181818]'} flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500`}>
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <button
          onClick={openModal}
          className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-white text-[#181818]' : 'bg-[#181818] text-white'} hover:opacity-80 transition-colors duration-300`}
        >
          {selectedDateTime || isReunited ? 'Reset Date' : 'Select Date'}
        </button>
        <button
          onClick={toggleTheme}
          className="text-2xl focus:outline-none"
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-8 text-center">Serina & Joe Reunion Countdown</h1>

      {isReunited ? (
        <>
          <Confetti 
            numberOfPieces={150} // Reduce the number of pieces
            gravity={0.3} // Control how fast the confetti falls
            friction={0.99} // Adjust friction for a slower speed
            wind={0} // Set wind to 0 to reduce calculations
          />          
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">We're reunited!</h2>
          </div>
        </>
      ) : selectedDateTime ? (
        <div className="text-center">
          <div className="text-6xl font-extrabold mb-4">{timeLeft}</div>
        </div>
      ) : (
        <p className="text-lg mt-4">Please choose our reunion date and time!</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-[#282828] text-white' : 'bg-white text-[#181818]'} p-6 rounded-lg w-80`}>
            {isAuthenticated ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Select a Date and Time</h2>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate || new Date()}
                  className={`${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-100 text-[#181818]'} rounded-lg p-4`}
                />
                <TimePicker
                  onChange={handleTimeChange}
                  value={selectedTime}
                  className={`${isDarkMode ? 'react-time-picker--dark' : ''} mt-4`}
                  clockIcon={null}
                  disableClock={true}
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-300 text-[#181818]'} hover:opacity-80 transition-colors duration-300`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDateTime}
                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-white text-[#181818]' : 'bg-[#181818] text-white'} hover:opacity-80 transition-colors duration-300`}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Enter Password</h2>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-100 text-[#181818]'}`}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-300 text-[#181818]'} hover:opacity-80 transition-colors duration-300`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePassword}
                    className={`px-4 py-2 rounded ${isDarkMode ? 'bg-white text-[#181818]' : 'bg-[#181818] text-white'} hover:opacity-80 transition-colors duration-300`}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown;
