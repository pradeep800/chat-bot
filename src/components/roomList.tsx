import { Room } from "@prisma/client";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { TenMillion } from "~/pages";
import { toast } from "react-hot-toast";
import { useInfo } from "~/utils/userInfoStore";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
interface RoomListSchema {
  room: Room;
  on: boolean;
  setOn: (bol: boolean) => void;
}
dayjs.extend(relativeTime);
export default function RoomList({ room, on, setOn }: RoomListSchema) {
  const utils = api.useContext();
  const router = useRouter();
  const userInfo = useInfo((state) => state.userInfo);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: editMutation } = api.rooms.editRoomTitle.useMutation({
    onSuccess: (updatedRoom) => {
      const prevRooms = utils.rooms.get15Rooms.getData();
      prevRooms?.shift();
      utils.rooms.get15Rooms.setData(undefined, () => [
        updatedRoom,
        ...(prevRooms ?? []),
      ]);
    },
    onMutate: (changedRoomTitle) => {
      const prevRooms = utils.rooms.get15Rooms.getData();
      //TODO Change roomId

      const changedRoom = {
        roomId: TenMillion, //fake for now
        title: changedRoomTitle.title,
        createdAt: new Date(Date.now()), //fake for now
        userId: userInfo.userId,
        updatedAt: new Date(Date.now()), //fake for now
      } as Room;
      const allRoomsWithoutUpdatedOne = prevRooms?.filter((roomData) => {
        return roomData.roomId !== room.roomId;
      });
      utils.rooms.get15Rooms.setData(undefined, () => [
        changedRoom,
        ...(allRoomsWithoutUpdatedOne ?? []),
      ]);
      return {
        prevRooms,
      };
    },
    onError: (err, changedRoomTitle, ctx) => {
      utils.rooms.get15Rooms.setData(undefined, () => ctx?.prevRooms);
      toast.error("Unable To Update The Title");
    },
  });

  const [title, setTitle] = useState(room.title);
  const [edit, setEdit] = useState(false);
  const resetTrue = () => {
    setEdit(true);
    setOn(true);
    setTitle(room.title);
  };
  const resetFalse = () => {
    setEdit(false);
    setOn(false);
    setTitle(room.title);
  };
  useEffect(() => {
    if (inputRef.current && edit) {
      // If input element exists and edit mode is on, focus on the input element
      inputRef.current.focus();
    }
  }, [edit]);

  return (
    <div
      className=" my-2 flex items-center rounded border border-gray-200 p-4 md:p-6"
      onClick={(e) => {
        if (room.roomId === TenMillion) {
          toast.error("Please Wait...");
          return;
        }

        void router.push(`/${room.roomId}`);
      }}
    >
      <div className="mr-4 sm:mr-auto">
        <div className={`${edit ? "hidden" : "block"} text-xl font-bold `}>
          {room.title}
        </div>
        <input
          ref={inputRef}
          className={`${
            edit ? "block" : "hidden"
          }   w-[100%] text-xl font-bold focus:border-transparent focus:outline-none `}
          value={title}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <div
          className="mr-auto text-base"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {dayjs(room.updatedAt).fromNow()}
        </div>
      </div>

      <div
        className=""
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {room.roomId !== TenMillion && (
          <button
            className={`${edit ? "hidden" : "flex"} `}
            onClick={(e) => {
              e.stopPropagation();
              if (!on) {
                resetTrue();
              } else {
                toast.error("You Cannot Update Multiple Rooms At Same Time");
              }
            }}
          >
            Edit
          </button>
        )}

        <div className={`${edit ? "flex" : "hidden"} gap-2 `}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              editMutation({ roomId: room.roomId, title });
              resetFalse();
            }}
          >
            save
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetFalse();
            }}
          >
            cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// const MemoizedRoom = memo(Room, (prevChat, NextChat) => {
//   let res = _.isEqual(prevChat, NextChat);
//   console.log(res);
//   return res;
// });
