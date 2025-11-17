import { useState } from 'react';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center transform transition-all hover:scale-105">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-6">Count: {count}</h2>
        <button
          onClick={handleIncrement}
          className="px-8 py-4 text-xl font-semibold bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-transform duration-150"
        >
          Increment
        </button>
      </div>
    </div>
  );
}
