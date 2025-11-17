export default function UserProfile({ username }) {
  return (
    <div className="p-4 mt-2 bg-blue-50 rounded-lg border border-blue-300 shadow-sm">
      <h4 className="text-xl font-bold text-blue-800">User Profile</h4>
      <p className="text-lg text-gray-700 mt-1">
        Username: <span className="font-semibold text-purple-700">{username}</span>
      </p>
    </div>
  );
}
