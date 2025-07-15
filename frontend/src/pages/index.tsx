import { useState } from "react";
import Layout from "../components/Layout";
import HomePage from "../components/HomePage";
import GenreExplorer from "../components/GenreExplorer";
import BookSearch from "../components/BookSearch";
import PopularBooks from "../components/PopularBooks";
import Analytics from "../components/Analytics";

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={setCurrentPage} />;
      case 'genres':
        return <GenreExplorer />;
      case 'search':
        return <BookSearch />;
      case 'popular':
        return <PopularBooks />;
      case 'analytics':
        return <Analytics />;
      default:
        return <HomePage onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}
