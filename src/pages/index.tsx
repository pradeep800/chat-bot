import { Room } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import * as _ from "lodash";
const Home: NextPage = () => {
  const { data: rooms, isLoading, refetch } = api.rooms.getAllRooms.useQuery();
  const { mutate: createRoomMutation } = api.rooms.createRoom.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const [someInput, setSomeInput] = useState(false);
  const [title, setTitle] = useState("");
  const [on, setOn] = useState(false);
  const [edit, setEdit] = useState(false);
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

  if (isLoading && !rooms) {
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

      {rooms?.map((room) => {
        return (
          <Room
            room={room}
            key={room.roomId}
            on={on}
            setOn={setOn}
            refetch={() => void refetch()}
          />
        );
      })}
    </div>
  );
};
let a = 0;
function Room({
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
  const router = useRouter();
  const { mutate: editMutation } = api.rooms.editRoomTitle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const [title, setTitle] = useState(room.title);
  const [edit, setEdit] = useState(false);
  const resetTrue = () => {
    setEdit(true);
    setOn(true);
    setTitle(room.title);
  };
  console.log(a++);
  const resetFalse = () => {
    setEdit(false);
    setOn(false);
    setTitle(room.title);
  };

  return (
    <div
      className="my-2 border-2"
      onClick={(e) => {
        if (!on) {
          void router.push(`/${room.roomId}`);
        }
      }}
    >
      <div>
        <div className={`${edit ? "hidden" : "flex"} `}>
          <div className="mr-auto">title:-{room.title}</div>
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
export default Home;
