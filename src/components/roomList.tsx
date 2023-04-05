import { Room } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { TenMillion } from "~/pages";
import { toast } from "react-hot-toast";
import { useInfo } from "~/utils/userInfoStore";
export default function RoomList({
  room,
  on,
  setOn,
  refetch,
}: {
  room: Room;
  on: boolean;
  setOn: (bol: boolean) => void;
  refetch: () => void;
}) {
  const utils = api.useContext();
  const router = useRouter();
  const userInfo = useInfo((state) => state.userInfo);
  const { mutate: editMutation } = api.rooms.editRoomTitle.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onMutate: (changedRoomTitle) => {
      const prevData = utils.rooms.getAllRooms.getData();
      //TODO Change roomId

      const changedRoom = {
        roomId: TenMillion, //fake for now
        title: changedRoomTitle.title,
        createdAt: new Date(Date.now()), //fake for now
        userId: userInfo.userId,
        updatedAt: new Date(Date.now()), //fake for now
      } as Room;
      utils.rooms.getAllRooms.setData(undefined, (prevData) => [
        changedRoom,
        ...(prevData ?? []),
      ]);

      return {
        prevData,
      };
    },
    onError: (err, changedRoomTitle, ctx) => {
      toast.error("Unable To Update The Title");
      utils.rooms.getAllRooms.setData(undefined, ctx?.prevData);
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

  return (
    <div
      className="my-2 border-2"
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
          <div className="mr-auto">title:-{room.title}</div>
          {TenMillion !== room.roomId && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!on) {
                  resetTrue();
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
          className={`${edit ? "block" : "hidden"} border-2`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            className="border-2"
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
            className="m-2 border-2"
          >
            save
          </button>
          <button
            onClick={() => {
              resetFalse();
            }}
            className="m-2 border-2"
          >
            cancel
          </button>
        </div>
      </div>
      <div className="flex ">
        <div className="mr-auto">{typeof room.createdAt}</div>
        <div>{typeof room.updatedAt}</div>
      </div>
    </div>
  );
}
// const MemoizedRoom = memo(Room, (prevChat, NextChat) => {
//   let res = _.isEqual(prevChat, NextChat);
//   console.log(res);
//   return res;
// });
