import Image from "next/image";
import deletePhoto from "~/images/delete.png";
import editPhoto from "~/images/edit.png";
export default function Skeleton() {
  return (
    <div
      role="status"
      className="md:p-6 m-auto  my-2 animate-pulse space-y-4 divide-y divide-gray-200 rounded border border-gray-200 p-4 shadow dark:divide-gray-700 dark:border-gray-700"
    >
      <div className=" flex items-center justify-between">
        <div>
          <div className="h-3.5 w-[200px] rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-2.5   mt-3 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
}
