import { Room } from "@prisma/client";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import * as _ from "lodash";
import { useInfo } from "~/utils/userInfoStore";
import RoomList from "~/components/roomList";
import InfiniteScroll from "react-infinite-scroll-component";
import { noOfRoomForPagination } from "~/staticVeriable/paginationRoom";

export const TenMillion = 100000000;
const Home: NextPage = () => {
  const utils = api.useContext();
  const userInfo = useInfo((state) => state.userInfo);
  const {
    data: rooms,
    isLoading,
    refetch,
  } = api.rooms.get15Rooms.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnMount: true,
  });
  const [hasMore, setHasMore] = useState(true);
  /*
   * Fetching First 15 Rooms
   */
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
  const { mutate: getNext15Rooms } = api.rooms.getNext15Rooms.useMutation({
    onSuccess: (data) => {
      setHasMore(data.length === noOfRoomForPagination ? true : false);
      utils.rooms.get15Rooms.setData(undefined, (oldRooms) => [
        ...(oldRooms ?? []),
        ...data,
      ]);
    },
  });
  /*
   * title for creating new Room
   * on for checking if someone else is not editing another room
   * edit for Opening edit
   */
  const [title, setTitle] = useState("");
  const [on, setOn] = useState(false);
  const [edit, setEdit] = useState(false);
  useEffect(() => {
    void refetch();
  }, []);

  useEffect(() => {
    if (!isLoading && JSON.stringify([]) === JSON.stringify(rooms)) {
      setHasMore(false);
    }
  }, [isLoading]);
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
  function NextRooms() {
    if (rooms) {
      const lastRoom = rooms[rooms.length - 1];
      if (lastRoom) {
        getNext15Rooms({ cursorId: lastRoom.roomId });
      } else {
        setHasMore(false);
      }
    }
  }

  if (!rooms) {
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

      <div>rooms</div>
      <InfiniteScroll
        dataLength={rooms.length}
        next={NextRooms}
        hasMore={hasMore}
        loader={<div>loading...</div>}
        endMessage={<div></div>}
      >
        {rooms.map((room) => {
          return (
            <RoomList room={room} key={room.roomId} on={on} setOn={setOn} />
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Home;
