export default function Header({ username }) {
    return (
      <header className="header">
        <div className="user-info">Logged in as: <span className="username">{username}</span></div>
      </header>
    );
  }