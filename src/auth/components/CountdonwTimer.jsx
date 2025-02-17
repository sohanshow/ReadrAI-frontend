import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CountdownTimer = ({ duration, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="text-zinc-400 text-sm">
      Code expires in {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};

CountdownTimer.propTypes = {
  duration: PropTypes.number.isRequired,
  onExpire: PropTypes.func.isRequired,
};

export default CountdownTimer;
