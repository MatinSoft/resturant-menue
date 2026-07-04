// Logo Component
const Logo = () => (
  <svg viewBox="0 0 50 50" className="w-10 h-10 md:w-12 md:h-12">
    <circle
      cx="25"
      cy="25"
      r="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-gold-600"
    />
    <path
      d="M15 20 Q25 10 35 20"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      className="text-gold-600"
    />
    <path
      d="M15 30 Q25 40 35 30"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      className="text-gold-600"
    />
    <circle
      cx="25"
      cy="25"
      r="3"
      fill="currentColor"
      className="text-gold-600"
    />
  </svg>
);

export default Logo;
