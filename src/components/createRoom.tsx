import { Room } from "@prisma/client";
import _ from "lodash";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { TenMillion } from "~/pages";
import { api } from "~/utils/api";
// import useRainbow from "~/utils/useRainbow";
import { useInfo } from "~/utils/userInfoStore";

export default function CreateRooms() {
  const utils = api.useContext();
  // const colors = useRainbow({ intervalDelay: 100 });
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
  /*
   * Search Mutation
   */
  const { mutate: searchForTitle } = api.rooms.searchRooms.useMutation({
    onSuccess: (foundRooms) => {
      console.log(foundRooms);
    },
  });
  const searchRoom = useCallback(
    _.debounce((title: string) => {
      console.log(title);
      searchForTitle({ substring: title });
    }, 500),
    []
  );
  function createRoom() {
    createRoomMutation({ title: title });
    setTitle("");
  }
  // const colorKeys = Object.keys(colors);
  return (
    <div className="my-5 mt-6 flex justify-center">
      <input
        placeholder="Create Room & Search"
        className={`mr-3 grow-[1] rounded border-2 p-1`}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          searchRoom(e.target.value);
        }}
      />
      <button
        className="rounded bg-slate-300 p-1 hover:bg-slate-400"
        // style={{
        //   transition: `
        //   ${colorKeys[0]} ${100}ms linear,
        //   ${colorKeys[1]} ${100}ms linear,
        //   ${colorKeys[2]} ${100}ms linear
        // `,
        //   background: `
        //   radial-gradient(
        //     circle at top left,
        //     var(${colorKeys[2]}),
        //     var(${colorKeys[1]}),
        //     var(${colorKeys[0]})
        //   )
        // `,
        // }}
        onClick={() => {
          if (title) {
            createRoom();
          } else {
            toast.error("Write Title");
          }
        }}
      >
        Create Room
      </button>
    </div>
  );
}
