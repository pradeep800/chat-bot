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
  } = api.rooms.get15Rooms.useQuery(undefined, { staleTime: Infinity });
  const [allRoom, setAllRoom] = useState<Room[]>([]);
  const [hasMore, setHasMore] = useState(true);
  /*
   * Fetching First 15 Rooms
   */
  const { mutate: createRoomMutation } = api.rooms.createRoom.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onMutate: async (newRoomTitle) => {
      await utils.rooms.get15Rooms.cancel();
      const prevRooms = utils.rooms.get15Rooms.getData();
      //TODO Change room Id
      const newRoom = {
        roomId: TenMillion,
        title: newRoomTitle.title,
        createdAt: new Date(Date.now()),
        userId: userInfo.userId,
        updatedAt: new Date(Date.now()),
      } as Room;
      setAllRoom([newRoom, ...(prevRooms ?? [])]);

      return {
        prevRooms,
      };
    },
    onError: (err, newRoomTitle, ctx) => {
      setAllRoom(ctx?.prevRooms ?? []);
      toast.error("Unable To Create Room");
    },
  });
  const { mutate: getNext15Rooms } = api.rooms.getNext15Rooms.useMutation({
    onSuccess: (data) => {
      console.log(data);
      setHasMore(data.length === noOfRoomForPagination ? true : false);
      setAllRoom((prev) => [...prev, ...data]);
    },
  });
  console.log(hasMore);
  /*
   * title for creating new Room
   * on for checking if someone else is not editing another room
   * edit for Opening edit
   */
  const [title, setTitle] = useState("");
  const [on, setOn] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    if (rooms) {
      setAllRoom(rooms ?? []);
    }
  }, [rooms]);
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
    const lastRoom = allRoom[allRoom.length - 1];
    if (lastRoom) {
      getNext15Rooms({ cursorId: lastRoom.roomId });
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

      <div>allRoom</div>
      <InfiniteScroll
        dataLength={allRoom.length}
        next={NextRooms}
        hasMore={hasMore}
        loader={<div>loading...</div>}
        endMessage={<div></div>}
      >
        {allRoom.map((room) => {
          return (
            <RoomList
              room={room}
              key={room.roomId}
              on={on}
              setOn={setOn}
              setAllRoom={setAllRoom}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default Home;
