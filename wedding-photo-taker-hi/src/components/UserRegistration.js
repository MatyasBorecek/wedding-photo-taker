import React, { useState } from 'react';
import { registerDevice } from '../api/ApiHelper';

const UserRegistration = () => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerDevice(name);
      window.location.reload(); // Redirect to dashboard
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="registration">
      <h2>Welcome to Our Wedding!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};