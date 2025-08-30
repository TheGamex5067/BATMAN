import React, { useState } from "react";
import { useDCCU } from "@/state/dccu"; // Ensure this import is correct
function DCCU() {
  const { data, addFuture } = useDCCU(); // Access data and addFuture function
  const [movieName, setMovieName] = useState("");
  const [movieType, setMovieType] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const handleAddMovie = () => {
    if (movieName.trim() && movieType.trim() && movieDescription.trim()) {
      const newMovie = {
        name: movieName,
        type: movieType,
        description: movieDescription,
      };
      addFuture(newMovie); // Call the function to add the movie
      // Clear the fields after submission
      setMovieName("");
      setMovieType("");
      setMovieDescription("");
    } else {
      alert("All fields are required."); // Alert if fields are empty
    }
  };
  return (
    <div>
      <h1>Add Movie</h1>
      <input
        type="text"
        value={movieName}
        onChange={(e) => setMovieName(e.target.value)}
        placeholder="Movie Name"
      />
      <input
        type="text"
        value={movieType}
        onChange={(e) => setMovieType(e.target.value)}
        placeholder="Movie Type"
      />
      <textarea
        value={movieDescription}
        onChange={(e) => setMovieDescription(e.target.value)}
        placeholder="Movie Description"
      />
      <button onClick={handleAddMovie}>Add Movie</button>
      {/* Optionally, display current movies if needed */}
      <div>
        {data &&
          data.map((movie, index) => (
            <div key={index}>
              <h2>{movie.name}</h2>
              <p>Type: {movie.type}</p>
              <p>{movie.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
export default DCCU;
