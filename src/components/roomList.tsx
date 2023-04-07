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
      className=" my-2 rounded border border-gray-200 p-4"
      onClick={(e) => {
        if (room.roomId === TenMillion) {
          toast.error("Please Wait...");
          return;
        }

        void router.push(`/${room.roomId}`);
      }}
    >
      <div>
        <div className={`${edit ? "hidden" : "flex"} `}>
          <div className="m-1.5 mr-auto text-2xl font-bold">{room.title}</div>
          {TenMillion !== room.roomId && (
            <div
              className="text-xl font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                if (!on) {
                  resetTrue();
                  console.log(inputRef.current);
                } else {
                  toast.error("Complete Previous Editing..");
                }
              }}
            >
              edit
            </div>
          )}
        </div>

        <div
          className={`${edit ? "flex" : "hidden"} `}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            ref={inputRef}
            className="  mr-auto grow-[1] focus:border-transparent focus:outline-none"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <button
            onClick={() => {
              editMutation({ roomId: room.roomId, title });
              resetFalse();
            }}
            className="m-2 "
          >
            save
          </button>
          <button
            onClick={() => {
              resetFalse();
            }}
            className=" m-2"
          >
            cancel
          </button>
        </div>
      </div>
      <div className="flex ">
        <div className="mr-auto">{dayjs(room.createdAt).fromNow()}</div>
      </div>
    </div>
  );
}
// const MemoizedRoom = memo(Room, (prevChat, NextChat) => {
//   let res = _.isEqual(prevChat, NextChat);
//   console.log(res);
//   return res;
// });
