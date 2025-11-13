import React, { useState, useEffect } from 'react';
import { Student } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import { BotIcon } from './components/icons/BotIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';

const App: React.FC = () => {
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleFileUpload = (data: Student[], name: string) => {
    setStudentData(data);
    setFileName(name);
  };

  const handleReset = () => {
    setStudentData([]);
    setFileName('');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BotIcon className="h-8 w-8 text-primary dark:text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">Student Data AI Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            {studentData.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-secondary dark:bg-gray-800 text-secondary-foreground dark:text-gray-200 hover:bg-secondary/80 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Upload New File
              </button>
            )}
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {studentData.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Analytics for <span className="text-primary dark:text-blue-400 font-bold">{fileName}</span></h2>
            </div>
            <Dashboard data={studentData} theme={theme} />
            <Chat data={studentData} />
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Powered by Anirach Mingkhwan CreativeLab-FITM</p>
      </footer>
    </div>
  );
};

export default App;