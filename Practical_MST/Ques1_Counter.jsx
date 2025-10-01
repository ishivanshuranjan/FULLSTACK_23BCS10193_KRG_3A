import React, { useState } from "react";
import "tailwindcss";

function App() {
  const [Counter, setCounter] = useState(0);

  const Increment = () => Counter < 10 && setCounter(Counter + 1);
  const Decrement = () => Counter > 0 && setCounter(Counter - 1);
  const Reset = () => setCounter(0);

  return (
    <div className="flex flex-col min-h-screen w-screen bg-gradient-to-r from-blue-100 via-teal-100 to-rose-100 transition-all duration-500">
      <div className="flex grow items-center justify-center">
        <div className="w-full max-w-sm p-12 bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl text-center mx-auto transition-all duration-500">
          <h1
            className="text-5xl font-semibold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent tracking-wide mb-8
                       animate-pulse drop-shadow-[0_1px_8px_rgba(76,125,194,0.25)] transition-all duration-300 select-none"
          >
            Counter : {Counter}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={Increment}
              className="px-6 py-3 bg-gradient-to-r from-teal-200 to-blue-200 text-blue-800 font-semibold rounded-xl shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
            >
              Increment
            </button>
            <button
              onClick={Decrement}
              className="px-6 py-3 bg-gradient-to-r from-rose-100 to-pink-200 text-pink-800 font-semibold rounded-xl shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
            >
              Decrement
            </button>
            <button
              onClick={Reset}
              className="px-6 py-3 bg-gradient-to-r from-gray-200 to-teal-100 text-teal-700 font-semibold rounded-xl shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none"
            >
              Reset
            </button>
          </div>
          {Counter === 10 && (
            <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-500 to-pink-400 animate-pulse mt-4 select-none">
              🌱 Limit reached—take a breather!
            </p>
          )}
        </div>
      </div>
      <footer className="w-full py-4 bg-transparent flex items-center justify-center">
        <p className="text-gray-500 text-base animate-fade-in">
          Designed by{" "}
          <span className="font-bold bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-x transition-all duration-500">
            Shivanshu Ranjan
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
