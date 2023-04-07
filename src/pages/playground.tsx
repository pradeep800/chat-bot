import { api } from "~/utils/api";

export default function Playground() {
  const { data } = api.conversations.example.useQuery();
  console.log(data);
  return (
    <div>
      {JSON.stringify(data)}
      <div>
        if you seeing this please let me know this mean that i forget to put it
        off
      </div>
    </div>
  );
}
