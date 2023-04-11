import { Room } from "@prisma/client";
import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import * as _ from "lodash";
import RoomList from "~/components/roomList";
import InfiniteScroll from "react-infinite-scroll-component";
import { noOfRoomForPagination } from "~/staticVeriable/paginationRoom";
import Skeleton from "~/components/skeleton";
import CreateRooms from "~/components/createRoom";
import Loading from "~/components/loading";

export const TenMillion = 100000000;
const Home: NextPage = () => {
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");
  const [skeletonRoomLength] = useState(() => {
    const length =
      parseInt(localStorage.getItem("skeletonRoomLength") as string) || 2;
    return Math.min(length, 8);
  });
  const utils = api.useContext();
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

  const { mutate: searchNextRooms } = api.rooms.nextSearchRooms.useMutation({
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
  const [on, setOn] = useState(false);
  useEffect(() => {
    void refetch();
  }, []);

  useEffect(() => {
    if (!isLoading && JSON.stringify([]) === JSON.stringify(rooms)) {
      setHasMore(false);
    }
    if (rooms) {
      localStorage.setItem("skeletonRoomLength", rooms.length.toString());
    }
  }, [isLoading, rooms]);

  function NextRooms() {
    if (rooms) {
      const lastRoom = rooms[rooms.length - 1];
      if (lastRoom) {
        searchNextRooms({ substring: title, cursorId: lastRoom.roomId });
      } else {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  }

  if (!rooms) {
    const allSkeleton = new Array(skeletonRoomLength).fill(0);
    return (
      <>
        <div className="mx-auto max-w-[800px]">
          <CreateRooms
            title={title}
            setTitle={setTitle}
            hasMore={hasMore}
            setHasMore={setHasMore}
            searching={searching}
            setSearching={setSearching}
          />
          {allSkeleton.map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="m-auto max-w-[800px]">
      <CreateRooms
        title={title}
        setTitle={setTitle}
        setHasMore={setHasMore}
        hasMore={hasMore}
        searching={searching}
        setSearching={setSearching}
      />
      {searching && <div>searching...</div>}
      {rooms && rooms.length === 0 && (
        <div className="text-center">No Rooms</div>
      )}

      <InfiniteScroll
        dataLength={rooms.length}
        next={NextRooms}
        hasMore={hasMore}
        loader={<Loading hidden />}
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
