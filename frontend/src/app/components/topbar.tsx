export default function Topbar() {
    return (
      <header className="flex items-center justify-between h-14 px-4 border-b bg-white dark:bg-gray-800">
        <h1 className="font-semibold text-lg">SynthEd</h1>
        {/* placeholder for user avatar / settings */}
        <div className="rounded-full h-8 w-8 bg-gray-300 dark:bg-gray-700" />
      </header>
    );
  }
  