document.addEventListener("DOMContentLoaded", function () {
  const cardContainer = document.getElementById("card-container");
  const messageInput = document.getElementById("message-input");
  const characterCountDisplay = document.getElementById("word-count");
  const submitButton = document.getElementById("submit-button");
  let currentCardIndex = 0;
  let messagesData = [];

  const maxCharacters = 300;

  function updateCharacterCount() {
    const characterCount = messageInput.value.length;
    characterCountDisplay.textContent = `${characterCount}/${maxCharacters} characters`;

    if (characterCount > maxCharacters) {
      characterCountDisplay.style.color = "red";
      submitButton.disabled = true;
    } else {
      characterCountDisplay.style.color = "#555";
      submitButton.disabled = false;
    }
  }

  messageInput.addEventListener("input", updateCharacterCount);

  function fetchMessages() {
    fetch("http://localhost:3000/messages")
      .then((response) => response.json())
      .then((data) => {
        messagesData = data;
        cardContainer.innerHTML = "";
        data.forEach((message, index) => {
          createCard(message, index, data.length);
        });
        currentCardIndex = 0;
      })
      .catch((error) => console.error("Error fetching messages:", error));
  }

  function createCard(message, index, totalMessages) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
            <h3>${message.username}</h3>
            <div class="card-content">${message.message}</div>
            <small>${message.datetime}</small>
            <span class="read-more">Read More</span>
        `;

    const cardContent = card.querySelector(".card-content");
    const readMore = card.querySelector(".read-more");

    card.style.zIndex = totalMessages - index;
    cardContainer.appendChild(card);

    if (index === 0) {
      card.classList.add("active");
    }

    if (cardContent.scrollHeight > cardContent.clientHeight) {
      readMore.classList.add("visible");
    }

    readMore.addEventListener("click", () => {
      cardContent.classList.toggle("expanded");
      readMore.textContent = cardContent.classList.contains("expanded")
        ? "Read Less"
        : "Read More";
    });

    let startX, startY, endX, endY;
    card.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    card.addEventListener("touchmove", function (e) {
      endX = e.touches[0].clientX;
      endY = e.touches[0].clientY;

      let deltaX = endX - startX;
      let deltaY = endY - startY;

      card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    card.addEventListener("touchend", function () {
      if (Math.abs(endX - startX) > 100) {
        handleCardSwipe(card, endX - startX);
      } else {
        card.style.transform = "";
      }
    });
  }

  function handleCardSwipe(card, direction = 100) {
    card.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    card.style.transform = `translateX(${direction > 0 ? "100%" : "-100%"})`;
    card.style.opacity = "0";

    setTimeout(() => {
      card.classList.add("hidden");
      card.classList.remove("active");
      cardContainer.removeChild(card);

      currentCardIndex++;
      if (currentCardIndex < messagesData.length) {
        const nextCard = document.querySelector(".card:not(.hidden)");
        if (nextCard) {
          nextCard.classList.add("active");
        }
      } else {
        alert("You've reached the end!");
        fetchMessages();
      }
    }, 500);
  }

  document.addEventListener("keydown", function (e) {
    const activeCard = document.querySelector(".card.active");

    if (!activeCard) return;

    if (e.key === "ArrowRight") {
      handleCardSwipe(activeCard, 100);
    } else if (e.key === "ArrowLeft") {
      handleCardSwipe(activeCard, -100);
    }
  });

  submitButton.addEventListener("click", function () {
    const message = messageInput.value.trim();
    const characterCount = message.length;

    if (characterCount > maxCharacters) {
      alert(`Your message exceeds the ${maxCharacters} characters limit.`);
      return;
    }

    if (message === "") {
      alert("Please enter a message.");
      return;
    }

    fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Message sent successfully!");
        messageInput.value = "";
        updateCharacterCount();
        fetchMessages();
      })
      .catch((error) => console.error("Error sending message:", error));
  });

  fetchMessages();
  updateCharacterCount();
});
