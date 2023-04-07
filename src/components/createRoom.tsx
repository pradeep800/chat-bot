import { Room } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { TenMillion } from "~/pages";
import { api } from "~/utils/api";
import { useInfo } from "~/utils/userInfoStore";

export default function CreateRooms({
  on,
  setOn,
}: {
  on: boolean;
  setOn: (on: boolean) => void;
}) {
  const utils = api.useContext();
  const userInfo = useInfo((state) => state.userInfo);
  const [title, setTitle] = useState("");
  const [edit, setEdit] = useState(false);
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
  function resetFalse() {
    setEdit(false);
    setOn(false);
    setTitle("");
  }
  function resetTrue() {
    setEdit(true);
    setOn(true);
    setTitle("");
  }
  function createRoom() {
    createRoomMutation({ title: title });
    resetFalse();
  }
  return (
    <>
      <div
        onClick={() => {
          if (!on) {
            resetTrue();
          } else {
            toast.error("something is is Editing....");
          }
        }}
      >
        addRoom
      </div>
      <div
        className={`${edit ? "block" : "hidden"} border border-gray-200 p-4`}
      >
        <input
          className={`border-2 `}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <button onClick={createRoom}>save</button>
        <button
          onClick={() => {
            resetFalse();
          }}
        >
          cancel
        </button>
      </div>
    </>
  );
}
