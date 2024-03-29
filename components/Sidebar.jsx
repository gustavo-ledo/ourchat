import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { AiOutlineSearch } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import Image from "next/future/image";
import DefaultImage from "../public/images/default.png";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import Card from "./Card";
import { collection, doc, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import CardLoader from "./CardLoader";
import ChatCard from "./ChatCard";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [user, loading] = useAuthState(auth);
  // console.log(user);

  const logout = async () => {
    if (user) {
        await setDoc(
          doc(db, "users", user?.uid),
          {
            name: user?.displayName,
            email: user?.email,
            imageURL: user?.photoURL,
            online: false,
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      }
    await signOut(auth);
  };

  const usersRef = collection(db, "users");
  const [userSnapShots, loading2] = useCollection(usersRef);
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("users", "array-contains", user?.email));
  const [chatSnapShots, loading3] = useCollection(q);
  return (
    <div className="w-[400px] max-sm:w-[120px] h-screen p-5 bg-black border-r-2 border-neutral-900">
      <div className="flex items-center w-full space-x-4">
        <div>
          <button className="text-2xl group">
            <FiMenu />
            <div className="w-[300px] rounded-b-xl  rounded-tr-xl absolute bg-neutral-900 flex flex-col justify-center items-center p-5 top-16 left-12 backdrop-blur-sm -z-[1] opacity-0 group-focus:z-[1] group-focus:opacity-100">
              <div className="w-[100px] h-[100px] overflow-hidden rounded-full">
                <Image
                  src={user?.photoURL}
                  width={100}
                  height={100}
                  priority={true}
                  quality={100}
                  alt=""
                />
              </div>
              <div className="w-full">
                <h1 className="text-xl text-slate-50 my-2">@{user?.displayName}</h1>
                <div
                  className="text-xl bg-neutral-900 w-full  py-1 rounded-md transition-all duration-300 ease-in-out border-2 border-blue-700 text-blue-700 cursor-pointer hover:bg-blue-700 hover:text-white"
                  onClick={logout}
                >
                  Logout
                </div>
              </div>
            </div>
          </button>
        </div>
        <div className="relative w-full flex items-center">
          <div className="text-xl absolute left-3">
            <AiOutlineSearch />
          </div>
          <input
            type="text"
            className="border-2 bg-transparent w-full px-10 py-2 rounded-[10px] border-[#494949] outline-none focus:border-[#ffffff]"
            placeholder="Procure um amigo"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
          />
          {search.length > 0 && (
            <button
              className="absolute right-4 text-2xl"
              onClick={() => {
                setSearch("");
              }}
            >
              <IoMdClose />
            </button>
          )}
        </div>
      </div>
      <div
        className={
          search.length > 0
            ? "w-full h-screen overflow-y-auto mt-5 transition-all"
            : "w-full h-0 overflow-y-auto mt-5 transition-all"
        }
      >
        {!loading2 ? (
          userSnapShots?.docs?.map((item) => {
            const itemName = item?.data()?.name; // Realize verificações de nulo
            if (
              itemName && // Verifique se itemName está definido
              itemName.toLowerCase().includes(search.toLowerCase()) &&
              itemName !== user?.displayName
            ) {
              return (
                <Card
                  key={item.id}
                  name={item.data().name}
                  imageURL={item.data().imageURL}
                  email={item.data().email}
                  id={item.id}
                  setSearch={setSearch}
                />
              );
            }
          })
         
        ) : (
          <div>
            <CardLoader />
            <CardLoader />
            <CardLoader />
          </div>
        )}
      </div>
      <div className="w-full h-screen overflow-y-auto mt-2 transition-all">
        {!loading3 ? (
          chatSnapShots?.docs?.map((chat) => {
            return <ChatCard key={chat.id} chatData={chat} />;
          })
        ) : (
          <div>
            <CardLoader />
            <CardLoader />
            <CardLoader />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
