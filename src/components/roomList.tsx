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
      const prevRooms = utils.rooms.getRooms.getData();
      prevRooms?.shift();
      utils.rooms.getRooms.setData(undefined, () => [
        updatedRoom,
        ...(prevRooms ?? []),
      ]);
    },
    onMutate: (changedRoomTitle) => {
      const prevRooms = utils.rooms.getRooms.getData();

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
      utils.rooms.getRooms.setData(undefined, () => [
        changedRoom,
        ...(allRoomsWithoutUpdatedOne ?? []),
      ]);
      return {
        prevRooms,
      };
    },
    onError: (err, changedRoomTitle, ctx) => {
      utils.rooms.getRooms.setData(undefined, () => ctx?.prevRooms);
      toast.error("Unable To Update The Title");
    },
  });
  const { mutate: deleteRoom } = api.rooms.deleteRoom.useMutation({
    onMutate: (deletedRoom) => {
      const prevRoom = utils.rooms.getRooms.getData();
      const optimisticUpdate = prevRoom?.filter((oldRoom) => {
        return oldRoom.roomId !== room.roomId;
      });
      utils.rooms.getRooms.setData(undefined, () => optimisticUpdate);
      return { prevRoom };
    },
    onError: (err, notDeletedRoom, ctx) => {
      toast.error("Unable To Delete Rooms");
      if (ctx && ctx.prevRoom) {
        utils.rooms.getRooms.setData(undefined, () => ctx.prevRoom);
      }
    },
  });
  const [title, setTitle] = useState(room.title);
  const [edit, setEdit] = useState(false);
  useEffect(() => {
    if (inputRef.current && edit) {
      // If input element exists and edit mode is on, focus on the input element
      inputRef.current.focus();
    }
  }, [edit]);

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
      className=" my-2 flex items-center rounded border border-gray-200 p-4 md:p-6"
      onClick={(e) => {
        if (room.roomId === TenMillion) {
          toast.error("Please Wait...");
          return;
        }

        void router.push(`/${room.roomId}`);
      }}
    >
      <div className=" mr-auto">
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
                  toast.error("You Cannot Edit Multiple Rooms At Same Time");
                }
              }}
            >
              <Image
                className="w-5 sm:w-7"
                src={editPhoto}
                alt="edit button"
                width={30}
              />
            </button>
            <button
              title="Button For Delete The Room"
              onClick={Delete}
              className={`${edit ? "hidden" : "flex"}  p-2`}
            >
              <Image
                className="w-5 sm:w-7"
                placeholder="blur"
                src={deletePhoto}
                alt="delete button photo"
                // width={30}
              />
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
            <Image
              className="w-5 sm:w-7"
              src={savePhoto}
              alt="save button Photo"
              width={30}
            />
          </button>
          <button
            title="Button For Canceling The Changes"
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              resetFalse();
            }}
          >
            <Image
              className="w-5 sm:w-7"
              src={cancelPhoto}
              alt="cancel button Photo"
              width={30}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
