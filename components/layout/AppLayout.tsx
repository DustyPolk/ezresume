import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100"> {/* Optional: basic background color */}
      {/* <header>Header placeholder</header> */} {/* Optional: placeholder for future header */}
      <main className="container mx-auto p-4"> {/* Basic container and padding */}
        {children}
      </main>
      {/* <footer>Footer placeholder</footer> */} {/* Optional: placeholder for future footer */}
    </div>
  );
};

export default AppLayout;
