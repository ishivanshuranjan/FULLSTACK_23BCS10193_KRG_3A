import Icon from './Icon';

export default function Header({ username }) {
  return (
    <header className="bg-white w-4/5 md:w-2/3 lg:w-1/2 shadow-lg rounded-xl p-6 text-center">
      <h2 className="text-3xl font-semibold mb-4 text-purple-700">App Header</h2>
      <Icon username={username} />
    </header>
  );
}
