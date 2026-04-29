import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />
      <main className="flex-1 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

