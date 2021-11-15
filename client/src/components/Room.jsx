/*-------------------------Imports */
import React from "react";
import { useState, useEffect } from "react";
import "../styles/main.css";
import NavBar from "./NavBar";
import { io } from "socket.io-client";

/*-------------------------Function for Room */
function Room() {
  // use URL to get room name
  const roomName = window.location.pathname.split("/")[3];
  const roomNameCorrect = roomName.replace(/-/g, " ");
  const username = window.location.pathname.split("/")[1];

  //setting up state variables
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(roomNameCorrect);

  // const socket = io("http://localhost:8000");
  // socket.on("connect", () => {
  //   console.log(`You connected with id: ${socket.id}`);
  // });

  // socket.on("receive-message", (message) => {
  //   let correctedRoomName = roomName.toLowerCase();
  //   fetch(`/allmessages/${correctedRoomName}`)
  //     .then((res) => res.json())
  //     .then((chatArray) => {
  //       setMessages(chatArray);
  //       console.log(chatArray);
  //     });
  // });

  //useEffect attempt to limit socket.io firing multiple times. This works on multiple fires on the front end, but still firing x4 on the server side.
  const socket = io("http://localhost:8000");
  useEffect(() => {
    //.on watching for connect event and console logging in the browser the generated socket id
    socket.on("connect", () => {
      console.log(`You connected with id: ${socket.id}`);
    });

    //.on watching for the receive-message evt that is triggered in the back end server
    socket.on("receive-message", (message) => {
      //re-fetching the messages and using the state variable setting to trigger the components to rerender in the return
      let correctedRoomName = roomName.toLowerCase();
      fetch(`/allmessages/${correctedRoomName}`)
        .then((res) => res.json())
        .then((chatArray) => {
          setMessages(chatArray);
          console.log(chatArray);
        });
    });
  }, []);

  //evt handler for submission of a message
  const socketSubmit = (evt) => {
    //creating a var for the msg value from our form using dot notation
    const message = evt.target.msg.value;
    //.emit to send the message through the websocket, to trigger a .on in the back end
    socket.emit("send-message", message);
  };

  // This useEffect fires on URL-change (which happens when a user navigates to a chat room). It populates previous messages for that room.
  useEffect(() => {
    // fetching data from the database:
    let correctedRoomName = roomName.toLowerCase();
    fetch(`/allmessages/${correctedRoomName}`)
      .then((res) => res.json())
      .then((chatArray) => {
        setMessages(chatArray);
        console.log(chatArray);
      });
  }, [roomName]); // END useEffect

  // This useEffect is initiated on URL-change, but due to setInterval, the fetch is delayed by 10 seconds due to the setInterval, then data is fetched every 10 seconds.
  // useEffect(() => {
  //   let correctedRoomName = roomName.toLowerCase();
  //   const interval = setInterval(() => {
  //     fetch(`/allmessages/${correctedRoomName}`)
  //       .then((res) => res.json())
  //       .then((chatArray) => {
  //         setMessages(chatArray);
  //         console.log(chatArray);
  //       });
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [roomName]);

  //generating submit path for form based on the roomName const variable
  let submitPath = `/submit/${roomName.toLowerCase()}`;

  return (
    <>
      <div id="room-wrapper">
        <div className="room-item">
          <h1>{roomNameCorrect}</h1>
        </div>
        {/* Chat Box, with different formatting for alternating messages for readability */}
        <div className="message-area">
          {messages.map(function (msg, index) {
            if (index % 2 === 0) {
              return (
                <div className="even-message">
                  {msg.author} : {msg.msg}
                </div>
              );
            } else {
              return (
                <div className="odd-message">
                  {msg.author} : {msg.msg}
                </div>
              );
            }
          })}
        </div>
        {/* Letting the user know current username and text field to type and submit message */}
        <div class-name="submit-message">
          <h3>Submit a Message</h3>
          <h4>You are signed in as: {username}</h4>
          <form method="POST" action={submitPath} onSubmit={socketSubmit}>
            <input type="hidden" name="author" value={username} />
            <label for="msg">Message:</label>
            <input
              type="text"
              name="msg"
              placeholder="Enter a message"
              className="userInput"
              maxLength="200"
            />
            <input type="submit" value="Submit" className="submitButton" />
          </form>
        </div>
        <div className="room-item">
          <NavBar username={username} setCurrentRoom={setCurrentRoom} />
        </div>
        {/* Link back to homepage */}
        <div className="room-item">
          <a href="/">Back to Home Page</a>
        </div>
      </div>
    </>
  );
}

export default Room;
