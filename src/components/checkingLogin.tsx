import { useEffect, useRef, useState } from "react";

export default function CheckLogin() {
  const count = useRef(0);
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      count.current++;
      let str = "";
      for (let i = 0; i < (count.current % 3) + 1; i++) {
        str += ".";
      }
      setDots(str);
    }, 300);
    return () => clearInterval(interval);
  }, [dots, count]);
  return (
    <div
      className={`flex h-[90%] w-[100vw] flex-col items-center justify-center gap-3  text-2xl font-bold`}
    >
      <div
        className={`bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-2xl text-transparent`}
      >
        Checking Login {dots}
      </div>
    </div>
  );
}
