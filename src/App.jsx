import { useState, useEffect } from 'react';
import { Search, Book, Star, Info, Loader } from 'lucide-react';

export default function BookRecommendationApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userInterests, setUserInterests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const popularInterests = [
    'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography',
    'History', 'Philosophy', 'Self-Help', 'Adventure', 'Thriller',
    'Horror', 'Poetry', 'Science', 'Travel', 'Fiction'
  ];

  const buildQuery = () => {
    const search = searchTerm.trim();
    if (search && userInterests.length) return `${search} ${userInterests.join(' ')}`;
    if (search) return search;
    if (userInterests.length) return userInterests.join(' ');
    return 'popular';
  };

  const fetchBooks = async () => {
    const query = encodeURIComponent(buildQuery());
    const apiUrl = `https://openlibrary.org/search.json?q=${query}&limit=12&cache=${Math.random().toString(36).substring(7)}`;

    setLoading(true);
    setError(null);
    setNoResults(false);

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();

      if (!data.docs || data.docs.length === 0) {
        setRecommendations([]);
        setNoResults(true);
        return;
      }

      const books = data.docs
        .filter(book => book.key)
        .map(book => ({
          id: book.key,
          title: book.title || 'Unknown Title',
          author: book.author_name?.[0] || 'Unknown Author',
          cover: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : '/api/placeholder/180/280',
          year: book.first_publish_year || 'Unknown',
          genres: book.subject_facet?.slice(0, 3) || [],
          rating: ((Math.random() * 2) + 3).toFixed(1),
          description: book.first_sentence?.[0] || 'No description available.'
        }));

      setRecommendations(books);
    } catch (err) {
      console.error(err);
      setError('Failed to load book recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, userInterests]);

  const toggleInterest = (interest) => {
    setUserInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleFavorite = (book) => {
    setFavoriteBooks(prev =>
      prev.some(b => b.id === book.id) ? prev.filter(b => b.id !== book.id) : [...prev, book]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBooks(); // optional: force fetch on submit
  };

  const BookCard = ({ book }) => {
    const isFavorite = favoriteBooks.some(b => b.id === book.id);
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col">
        <img src={book.cover} alt={book.title} className="h-64 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-1 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-sm">{book.rating}/5</span>
            <span className="ml-auto text-sm text-gray-500">{book.year}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {book.genres.map((genre, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {genre}
              </span>
            ))}
          </div>
          <button onClick={() => setSelectedBook(book)} className="mt-auto text-sm text-blue-600 flex items-center cursor-pointer">
            <Info className="w-4 h-4 mr-1 " /> More Info
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 flex justify-center items-center">
          <Book className="mr-2" /> BookRecommend
        </h1>
        <p className="text-gray-600">Discover books based on your interests</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
            />
            <Search className="absolute top-3.5 left-3 w-4 h-4 text-gray-400" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
            Find Books
          </button>
        </form>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Pick your interests:</h3>
          <div className="flex flex-wrap gap-2">
            {popularInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                  userInterests.includes(interest)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <Loader className="mx-auto animate-spin w-6 h-6 mb-2" /> Loading books...
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : noResults ? (
        <p className="text-center text-gray-500">No books found. Try a different search or interest.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
     {selectedBook && (
  <>
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={() => setSelectedBook(null)}
    />

    {/* Side Drawer */}
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 shadow-xl transform transition-transform duration-300 translate-x-0 overflow-y-auto">
      <div className="p-6 flex flex-col h-full">
        {/* Close Button */}
        <button
          onClick={() => setSelectedBook(null)}
          className="self-end text-gray-500 hover:text-gray-700 mb-4"
        >
          Close
        </button>

        {/* Book Cover */}
        <img
          src={selectedBook.cover}
          alt={selectedBook.title}
          className="w-full h-64 object-cover rounded mb-4"
        />

        {/* Book Info */}
        <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
        <p className="text-gray-600 mb-1">Author: {selectedBook.author}</p>
        <p className="text-gray-600 mb-1">Published: {selectedBook.year}</p>
        <p className="text-gray-600 mb-3">Rating: {selectedBook.rating}/5</p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedBook.genres.map((genre, idx) => (
            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {genre}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700">{selectedBook.description}</p>
      </div>
    </div>
  </>
)}


    </div>
  );
}
