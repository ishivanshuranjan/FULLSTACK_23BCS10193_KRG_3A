import { useState } from "react";
import "tailwindcss";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
  });

  const [students, setStudents] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.course) {
      alert("Please fill all fields!");
      return;
    }

    setStudents((prev) => [...prev, formData]);
    setFormData({ name: "", email: "", course: "" });
  };

  const handleDelete = (index) => {
    setStudents((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen min-h-screen bg-gradient-to-br from-blue-100 via-teal-100 to-pink-100 p-8">
      <div className="bg-white bg-opacity-70 rounded-3xl shadow-2xl p-10 max-w-2xl w-full flex flex-col items-center"
        style={{
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        }}
      >
        <h2
          className="text-4xl font-extrabold mb-8 text-center"
          style={{
            background: "linear-gradient(90deg, #A7BFE8 0%, #fcb7b7 48%, #ffe5a3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0px 2px 10px #e3e3e3)"
          }}
        >
          Student Form 📋
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl bg-white bg-opacity-60 placeholder-opacity-80 placeholder-gray-400 p-4 focus:outline-none focus:ring-4 focus:ring-blue-200 transition text-gray-700"
          />
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-xl bg-white bg-opacity-60 placeholder-opacity-80 placeholder-gray-400 p-4 focus:outline-none focus:ring-4 focus:ring-blue-200 transition text-gray-700"
          />
          <input
            type="text"
            name="course"
            placeholder="Enter Course"
            value={formData.course}
            onChange={handleChange}
            className="w-full rounded-xl bg-white bg-opacity-60 placeholder-opacity-80 placeholder-gray-400 p-4 focus:outline-none focus:ring-4 focus:ring-blue-200 transition text-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-200 via-pink-200 to-green-100 text-blue-800 font-extrabold uppercase py-4 rounded-xl shadow-md hover:scale-105 transition"
            style={{
              boxShadow: "0 4px 12px 0 rgba(124, 160, 181, 0.12)",
            }}
          >
            Submit
          </button>
        </form>
        {students.length > 0 && (
          <table className="mt-12 w-full rounded-xl overflow-hidden shadow-lg text-blue-900 border border-blue-200 bg-white bg-opacity-60">
            <thead className="bg-gradient-to-r from-blue-100 via-pink-100 to-green-100">
              <tr>
                <th className="px-8 py-4 text-left">Name</th>
                <th className="px-8 py-4 text-left">Email</th>
                <th className="px-8 py-4 text-left">Course</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={i}
                  className={`border-b border-blue-200 ${
                    i % 2 === 0
                      ? "bg-white bg-opacity-40"
                      : "bg-white bg-opacity-20"
                  }`}
                >
                  <td className="px-8 py-4">{s.name}</td>
                  <td className="px-8 py-4">{s.email}</td>
                  <td className="px-8 py-4">{s.course}</td>
                  <td className="px-8 py-4 text-center">
                    <button
                      onClick={() => handleDelete(i)}
                      className="bg-gradient-to-r from-pink-200 to-blue-100 text-blue-700 font-bold py-1 px-4 rounded-lg shadow transition hover:scale-110"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <footer className="mt-8 w-full flex items-center justify-center text-gray-600 select-none">
        <p className="text-lg font-semibold drop-shadow-lg">
          Designed by{" "}
          <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x transition-all duration-1000">
            Shivanshu Ranjan
          </span>
        </p>
      </footer>
      <style>{`
        @keyframes gradient-x {
          0% {background-position: 0% 50%}
          50% {background-position: 100% 50%}
          100% {background-position: 0% 50%}
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
