import React from 'react';

export const UserWarning: React.FC = () => (
  <section className="section">
    <p className="box is-size-4">
      Please register or log in to use the Todo app.
    </p>
    <p>The application needs a valid user ID saved in localStorage.</p>
  </section>
);
