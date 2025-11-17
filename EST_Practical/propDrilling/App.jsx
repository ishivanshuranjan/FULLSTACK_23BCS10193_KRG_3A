import Header from './components/Header';

function App() {
  const username = "Shivanshu Ranjan"; // Data to drill down

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
      <Header username={username} />
    </div>
  );
}

export default App;
