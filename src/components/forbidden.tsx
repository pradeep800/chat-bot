import Image from "next/image";
import forbidden from "~/images/forbidden.gif";
export default function Forbidden() {
  return (
    <div className="flex h-[80vh] flex-col items-center  justify-center p-2">
      <Image src={forbidden} alt="forbidden photo" />
      <div className="text-1xl font-bold">Forbidden Page</div>
    </div>
  );
}
