import { Message } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { useInfo } from "~/utils/userInfoStore";
import robotPhoto from "~/images/robot.png";
import { useLayoutEffect } from "react";
import { useEffect } from "react";
import { useRef } from "react";
export default function Room() {
  const router = useRouter();
  const lastDiv = useRef<HTMLDivElement>(null);
  const [asking, setAsking] = useState(false);
  const userInfo = useInfo((state) => state.userInfo);
  const {
    data: chats,
    isLoading,
    refetch,
  } = api.conversations.allMessageOfRoom.useQuery({
    roomId: parseInt(router.query.roomid as string),
  });
  const { mutate } = api.conversations.askQuestion.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  const [question, setQuestion] = useState("");
  useEffect(() => {
    lastDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);
  if (isLoading) {
    return <div>loading....</div>;
  }
  function askQuestion() {
    setAsking(true);
    mutate({
      roomId: parseInt(router.query.roomid as string),
      question: question,
    });
    setQuestion("");
  }
  return (
    <div className="m-auto  max-w-[800px]">
      <div>{!chats?.length && <div>No Conversation Yet</div>}</div>

      {chats?.map((chat) => {
        return (
          <Message
            key={chat.messageId}
            chat={chat}
            profilePhoto={userInfo.profilePhoto}
          />
        );
      })}
      <div ref={lastDiv} className="h-10">
        .
      </div>
      <div className="fixed bottom-1 left-0 flex w-[80%]   translate-x-[10%] gap-3 bg-white lg:w-[60%]  lg:translate-x-[35%]   ">
        <input
          className="  grow-[2] border-2 p-2"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <button className="grow-[1] bg-blue-300 p-2" onClick={askQuestion}>
          Ask
        </button>
      </div>
    </div>
  );
}
function Message({
  chat,
  profilePhoto,
}: {
  chat: Message;
  profilePhoto: string;
}) {
  return (
    <div className="  m-2 border-2 p-2 ">
      <div className="flex gap-2">
        {chat.writer === "you" ? (
          <Image
            className=" rounded-full"
            alt="your photo"
            src={profilePhoto}
            width={30}
            height={30}
          />
        ) : (
          <Image src={robotPhoto} alt="robot" width={30} height={30} />
        )}

        <div>{chat.writer}</div>
      </div>

      <div>{chat.text}</div>
    </div>
  );
}
