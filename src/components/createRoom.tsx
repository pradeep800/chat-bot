import { Room } from "@prisma/client";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { TenMillion } from "~/pages";
import { noOfRoomForPagination } from "~/staticVeriable/paginationRoom";
import { api } from "~/utils/api";
// import useRainbow from "~/utils/useRainbow";
import { useInfo } from "~/utils/userInfoStore";

export default function CreateRooms({
  title,
  setTitle,
  hasMore,
  setHasMore,
  searching,
  setSearching,
}: {
  title: string;
  setTitle: (str: string) => void;
  hasMore: boolean;
  setHasMore: (has: boolean) => void;
  searching: boolean;
  setSearching: (has: boolean) => void;
}) {
  const utils = api.useContext();
  const userInfo = useInfo((state) => state.userInfo);
  /*
   * Search Mutation
   */
  const { mutate: searchForTitle } = api.rooms.searchRooms.useMutation({
    onSuccess: (foundRooms) => {
      setSearching(false);
      setHasMore(foundRooms.length === noOfRoomForPagination ? true : false);
      utils.rooms.get15Rooms.setData(undefined, foundRooms);
    },
  });
  /*
   * create Room
   */
  const { mutate: createRoomMutation } = api.rooms.createRoom.useMutation({
    onSuccess: (data) => {
      const prevRooms = utils.rooms.get15Rooms.getData();
      prevRooms?.shift();
      const newRooms = [data, ...(prevRooms ?? [])];
      utils.rooms.get15Rooms.setData(undefined, () => newRooms);
      searchForTitle({ substring: title });
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

  const searchRoom = useCallback(
    _.debounce((title: string) => {
      console.log(title);
      searchForTitle({ substring: title });
    }, 500),
    []
  );
  useEffect(() => {
    searchRoom(title);
    setSearching(true);
  }, [title]);
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
        Create Room
      </button>
    </div>
  );
}
