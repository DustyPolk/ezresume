import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100"> {/* Changed to bg-slate-100 */}
      {/* <header>Header placeholder</header> */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Applied new classes */}
        {children}
      </main>
      {/* <footer>Footer placeholder</footer> */}
    </div>
  );
};

export default AppLayout;
