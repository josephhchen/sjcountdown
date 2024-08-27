import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Countdown = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('countdownDate');
    return saved ? new Date(JSON.parse(saved)) : null;
  });
  const [timeLeft, setTimeLeft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('countdownDate', JSON.stringify(selectedDate));
      const updateTimer = () => {
        const now = new Date();
        const difference = selectedDate.getTime() - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("It's time!");
          setSelectedDate(null);
          localStorage.removeItem('countdownDate');
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [selectedDate]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    closeModal();
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#181818] text-white' : 'bg-white text-[#181818]'} flex flex-col items-center justify-center min-h-screen p-4 transition-colors duration-500`}>
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <button
          onClick={openModal}
          className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-white text-[#181818]' : 'bg-[#181818] text-white'} hover:opacity-80 transition-colors duration-300`}
        >
          Select Date
        </button>
        <button
          onClick={toggleTheme}
          className="text-2xl focus:outline-none"
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-8">Serina & Joe Reunion Countdown</h1>

      {selectedDate ? (
        <div className="text-center">
          <div className="text-6xl font-extrabold">{timeLeft}</div>
          <button
            onClick={() => {
              setSelectedDate(null);
              localStorage.removeItem('countdownDate');
            }}
            className={`mt-8 px-6 py-3 ${isDarkMode ? 'bg-white text-[#181818]' : 'bg-[#181818] text-white'} hover:opacity-80 rounded-full transition-colors duration-300`}
          >
            Reset Date
          </button>
        </div>
      ) : (
        <p className="text-lg mt-4">Please choose our reunion date!</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-[#282828] text-white' : 'bg-white text-[#181818]'} p-6 rounded-lg`}>
            <h2 className="text-2xl font-bold mb-4">Select a Date</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate || new Date()}
              className={`${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-100 text-[#181818]'} rounded-lg p-4`}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={closeModal}
                className={`px-4 py-2 rounded ${isDarkMode ? 'bg-[#383838] text-white' : 'bg-gray-300 text-[#181818]'} hover:opacity-80 transition-colors duration-300`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countdown;
