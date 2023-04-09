import { Room } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { TenMillion } from "~/pages";
import { api } from "~/utils/api";
import { useInfo } from "~/utils/userInfoStore";

export default function CreateRooms() {
  const utils = api.useContext();
  const userInfo = useInfo((state) => state.userInfo);
  const [title, setTitle] = useState("");
  const { mutate: createRoomMutation } = api.rooms.createRoom.useMutation({
    onSuccess: (data) => {
      const prevRooms = utils.rooms.get15Rooms.getData();
      prevRooms?.shift();
      const newRooms = [data, ...(prevRooms ?? [])];
      utils.rooms.get15Rooms.setData(undefined, () => newRooms);
    },
    onMutate: (newRoomTitle) => {
      //TODO Change room Id
      const newRoom = {
        roomId: TenMillion,
        title: newRoomTitle.title,
        createdAt: new Date(Date.now()),
        userId: userInfo.userId,
        updatedAt: new Date(Date.now()),
      } as Room;
      const prevRooms = utils.rooms.get15Rooms.getData();
      //check here
      utils.rooms.get15Rooms.setData(undefined, (old) => [
        newRoom,
        ...(old || []),
      ]);

      return {
        prevRooms,
      };
    },
    onError: (err, newRoomTitle, ctx) => {
      utils.rooms.get15Rooms.setData(undefined, (old) => ctx?.prevRooms);
      toast.error("Unable To Create Room");
    },
  });

  function createRoom() {
    createRoomMutation({ title: title });
    setTitle("");
  }
  return (
    <div className="my-5 mt-8 flex justify-center">
      <input
        className={`mr-3 rounded border-2`}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
      />
      <button
        className="rounded bg-slate-300 p-1 hover:bg-slate-400"
        onClick={() => {
          if (title) {
            createRoom();
          } else {
            toast.error("Write Title");
          }
        }}
      >
        addRoom
      </button>
    </div>
  );
}
