import { Room } from "@prisma/client";
import { type NextPage } from "next";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import * as _ from "lodash";
import { useInfo } from "~/utils/userInfoStore";
import RoomList from "~/components/roomList";

export const TenMillion = 100000000;
const Home: NextPage = () => {
  const utils = api.useContext();
  const userInfo = useInfo((state) => state.userInfo);
  const {
    data: rooms,
    isLoading,
    refetch,
  } = api.rooms.getAllRooms.useQuery(undefined, { staleTime: Infinity });
  const { mutate: createRoomMutation } = api.rooms.createRoom.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onMutate: async (newRoomTitle) => {
      await utils.rooms.getAllRooms.cancel();
      const prevData = utils.rooms.getAllRooms.getData();
      //TODO Change room Id
      const newRoom = {
        roomId: TenMillion,
        title: newRoomTitle.title,
        createdAt: new Date(Date.now()),
        userId: userInfo.userId,
        updatedAt: new Date(Date.now()),
      } as Room;
      utils.rooms.getAllRooms.setData(undefined, (prevData) => [
        newRoom,
        ...(prevData ?? []),
      ]);

      return {
        prevData,
      };
    },
    onError: (err, newRoomTitle, ctx) => {
      utils.rooms.getAllRooms.setData(undefined, ctx?.prevData);
      toast.error("Unable To Create Room");
    },
  });
  const [title, setTitle] = useState("");
  const [on, setOn] = useState(false);
  const [edit, setEdit] = useState(false);
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

  if (isLoading && !rooms) {
    return <div>loading....</div>;
  }

  return (
    <div>
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
      <div className={`${edit ? "block" : "hidden"}`}>
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

      <div>allRoom</div>

      {rooms?.map((room) => {
        return (
          <RoomList
            room={room}
            key={room.roomId}
            on={on}
            setOn={setOn}
            refetch={() => void refetch()}
          />
        );
      })}
    </div>
  );
};

export default Home;
