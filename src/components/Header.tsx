export default function Header({ user }: { user: User }) {
  return (
    <div>
      <span>
        {user.firstName} {user.lastName}
      </span>
      {/* ... остальной JSX */}
    </div>
  );
} 