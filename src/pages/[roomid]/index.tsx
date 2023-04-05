import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";

export default function Room() {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  let {
    data: chats,
    isLoading,
    refetch,
  } = api.conversations.allMessageOfRoom.useQuery({
    roomId: parseInt(router.query.roomid as string),
  });
  let { mutate } = api.conversations.askQuestion.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const [question, setQuestion] = useState("");
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
    <div>
      <div>{!chats?.length && <div>No Conversation Yet</div>}</div>
      {chats?.map((chat) => {
        return (
          <div>
            <div>{chat.writer}</div>
            <div>{chat.text}</div>
          </div>
        );
      })}
      <div>
        <input
          className="border-2"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <button onClick={askQuestion}>Send</button>
      </div>
    </div>
  );
}
