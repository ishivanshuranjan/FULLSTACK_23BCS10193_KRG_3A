import UserProfile from './UserProfile';

export default function Icon({ username }) {
  return (
    <div className="mt-4">
      <p className="text-xl font-medium text-blue-600 mb-2">
        🔔 Notification Icon
      </p>
      <UserProfile username={username} />
    </div>
  );
}
