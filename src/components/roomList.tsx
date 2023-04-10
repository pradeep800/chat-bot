import { Room } from "@prisma/client";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { TenMillion } from "~/pages";
import cancelPhoto from "~/images/cancel.png";
import deletePhoto from "~/images/delete.png";
import editPhoto from "~/images/edit.png";
import savePhoto from "~/images/save.png";

import { toast } from "react-hot-toast";
import { useInfo } from "~/utils/userInfoStore";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
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
  const { mutate: deleteRoom } = api.rooms.deleteRoom.useMutation({
    onMutate: (deletedRoom) => {
      const prevRoom = utils.rooms.get15Rooms.getData();
      const optimisticUpdate = prevRoom?.filter((oldRoom) => {
        return oldRoom.roomId !== room.roomId;
      });
      utils.rooms.get15Rooms.setData(undefined, () => optimisticUpdate);
      return { prevRoom };
    },
    onError: (err, notDeletedRoom, ctx) => {
      toast.error("Unable To Delete Rooms");
      if (ctx && ctx.prevRoom) {
        utils.rooms.get15Rooms.setData(undefined, () => ctx.prevRoom);
      }
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

  function Delete() {
    const is = confirm("Are You Sure You want To Delete This Room");
    if (is) {
      deleteRoom({ roomId: room.roomId });
    }
  }
  return (
    <div
      className=" md:p-6 my-2 flex items-center rounded border border-gray-200 p-4"
      onClick={(e) => {
        if (room.roomId === TenMillion) {
          toast.error("Please Wait...");
          return;
        }

        void router.push(`/${room.roomId}`);
      }}
    >
      <div className="mr-auto">
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
        <div className="mr-auto text-base">
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
          <div className="flex gap-1">
            <button
              title="Button For Editing the Room Details"
              className={`${edit ? "hidden" : "flex"} p-2 `}
              onClick={(e) => {
                e.stopPropagation();
                if (!on) {
                  resetTrue();
                } else {
                  toast.error("You Cannot Update Multiple Rooms At Same Time");
                }
              }}
            >
              <Image src={editPhoto} alt="edit button" width={30} />
            </button>
            <button
              title="Button For Delete The Room"
              onClick={Delete}
              className={`${edit ? "hidden" : "flex"} p-2 `}
            >
              <Image src={deletePhoto} alt="delete button photo" width={30} />
            </button>
          </div>
        )}

        <div className={`${edit ? "flex" : "hidden"} gap-2 `}>
          <button
            title="Button For Saving The Changes"
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              editMutation({ roomId: room.roomId, title });
              resetFalse();
            }}
          >
            <Image src={savePhoto} alt="save button Photo" width={30} />
          </button>
          <button
            title="Button For Canceling The Changes"
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              resetFalse();
            }}
          >
            <Image src={cancelPhoto} alt="cancel button Photo" width={30} />
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
