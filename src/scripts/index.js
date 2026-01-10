/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getUserInfo, getCards, setUserInfo, setUserAvatar, addCard, deleteCardAPI, changeLikeCardStatus  } from './components/api.js';

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};


// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");

const infoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;

const userPreviewTemplate = document.querySelector(
  "#popup-info-user-preview-template"
).content;

const logo = document.querySelector(".logo");

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (title, value) => {
  const element = infoDefinitionTemplate.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = title;
  element.querySelector(".popup__info-description").textContent = value;
  return element;
};

const createUserPreview = (userName) => {
  const element = userPreviewTemplate.cloneNode(true);
  element.querySelector(".popup__list-item").textContent = userName;
  return element;
};

const renderLoading = (button, isLoading, defaultText) => {
  button.textContent = isLoading ? "Сохранение..." : defaultText;
};

const handleLogoClick = () => {
  usersStatsModalInfoList.innerHTML = "";
  usersStatsModalUsersList.innerHTML = "";

  getCards()
    .then((cards) => {
      usersStatsModalTitle.textContent = "Статистика пользователей";

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length)
      );

      const sortedCards = [...cards].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      usersStatsModalInfoList.append(
        createInfoString(
          "Первая создана:",
          formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt))
        )
      );

      usersStatsModalInfoList.append(
        createInfoString(
          "Последняя создана:",
          formatDate(new Date(sortedCards[0].createdAt))
        )
      );

      const usersMap = {};

      cards.forEach((card) => {
        const userId = card.owner._id;
        if (!usersMap[userId]) {
          usersMap[userId] = {
            name: card.owner.name,
            count: 0,
          };
        }
        usersMap[userId].count += 1;
      });

      const users = Object.values(usersMap);

      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", users.length)
      );

      const maxCards = Math.max(...users.map((user) => user.count));

      usersStatsModalInfoList.append(
        createInfoString("Максимум карточек от одного:", maxCards)
      );

      usersStatsModalText.textContent = "Все пользователи:";

      users.forEach((user) => {
        usersStatsModalUsersList.append(
          createUserPreview(user.name)
        );
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;

      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить");
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранить");
    });
};


const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector(".popup__button");
  submitButton.textContent = "Создание...";

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          currentUserId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          }
        )
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = "Создать";
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  deleteCardAPI(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
        const likeCountElement = likeButton
        .closest(".card")
        .querySelector(".card__like-count");

      likeCountElement.textContent = updatedCard.likes.length;

      if (updatedCard.likes.some((user) => user._id === currentUserId)) {
        likeButton.classList.add("card__like-button_is-active");
      } else {
        likeButton.classList.remove("card__like-button_is-active");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
logo.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});


profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});


openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

let currentUserId;

Promise.all([getCards(), getUserInfo()])
.then(([cards, userData]) => {
  currentUserId = userData._id;

  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

  cards.forEach((card) => {
  placesWrap.append(
    createCardElement(
      card,
      currentUserId,
      {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
      }
    )
  );
  });

})
.catch((err) => {
  console.log(err);
});
